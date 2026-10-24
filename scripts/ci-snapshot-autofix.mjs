/**
 * CI Snapshot Autofix
 *
 * Resolves a Renovate commit, builds snapshot updates in a read-only job, and
 * applies validated updates in a separate writer job. The resolver and writer
 * load this module from the trusted workflow revision. Only the read-only build
 * job loads branch code or runs its dependencies.
 *
 * Usage in actions/github-script (after importing this module):
 *   await resolveHead({ github, context, core }); // Resolve job
 *   buildSnapshots({ core });                  // Read-only build job
 *   await run({ github, context });            // Trusted writer job
 *
 * Programmatic arguments:
 *   github  - Authenticated GitHub API client supplied by actions/github-script
 *   context - GitHub Actions context containing the repository owner and name
 *   core    - Actions toolkit for setting job outputs
 *
 * Environment and artifact inputs:
 *   HEAD_BRANCH - Same-repository renovate/ branch selected by the resolve job
 *   HEAD_SHA    - Exact 40-character commit SHA tested by the build job
 *   snapshot-input/snapshots.json - Array of { path, content } updates, where
 *                                  content is the snapshot file in base64
 *   RUNNER_TEMP - Build job writes snapshot-output/snapshots.json here
 *
 * This is a workflow module, not a command-line program with positional flags.
 * Tests run with `pnpm test`. For a focused run, use:
 *   pnpm exec vitest run --project=ci-scripts
 *
 * The artifact is untrusted: validate all paths, file modes, sizes and snapshot
 * syntax before making API writes. Recheck the branch head before updating its
 * ref, and dispatch CI only after the non-force update succeeds.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 200;

/**
 * Resolve an open same-repository Renovate PR or a manual branch to one SHA.
 *
 * The workflow checks label/comment authorization before starting this job.
 * Manual requests must use the default-branch workflow. Publish the validated
 * branch and SHA as outputs so the build and writer operate on the same commit.
 *
 * @param {object} options Actions-provided GitHub client, context and toolkit
 * @param {object} options.github Authenticated GitHub API client
 * @param {object} options.context GitHub Actions event context
 * @param {object} options.core Actions toolkit with setOutput
 * @returns {Promise<void>} Resolves after setting branch and sha outputs
 */
export async function resolveHead({ github, context, core }) {
  let branch;

  if (context.eventName === 'workflow_dispatch') {
    // Manual requests must run the trusted default-branch workflow.
    if (
      context.ref !== `refs/heads/${context.payload.repository.default_branch}`
    ) {
      throw new Error('Dispatch this workflow from the default branch');
    }

    branch = context.payload.inputs.branch;
  } else {
    const number =
      context.payload.pull_request?.number ?? context.payload.issue.number;
    const { data: pr } = await github.rest.pulls.get({
      ...context.repo,
      pull_number: number,
    });

    if (
      pr.state !== 'open' ||
      pr.head.repo?.full_name !== `${context.repo.owner}/${context.repo.repo}`
    ) {
      throw new Error('An open same-repository Renovate PR is required');
    }

    branch = pr.head.ref;
  }

  // Check the branch before using it in an API request, then validate its SHA.
  validateBranchName(branch);

  const { data } = await github.rest.git.getRef({
    ...context.repo,
    ref: `heads/${branch}`,
  });
  validateBranch(branch, data.object.sha);

  core.setOutput('branch', branch);
  core.setOutput('sha', data.object.sha);
}

/**
 * Collect bounded external snapshot changes from the read-only build workspace.
 *
 * Reject untracked files, inline snapshots and other source changes. This is an
 * early build check; the trusted writer independently validates the artifact.
 *
 * @param {object} options Paths belonging to the read-only build job
 * @param {string} options.workspace Git checkout containing updated snapshots
 * @param {string} options.outputDirectory Directory for snapshots.json
 * @returns {void} Writes the JSON artifact or throws on invalid changes
 */
export function collectSnapshots({ workspace, outputDirectory }) {
  const git = (args) => {
    return execFileSync('git', args, { cwd: workspace });
  };
  const files = git(['diff', '--name-only', '-z', 'HEAD'])
    .toString()
    .split('\0')
    .filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']);

  if (!files.length || files.length > MAX_FILES || untracked.length) {
    throw new Error('Expected only tracked snapshot updates');
  }

  let size = 0;
  const payload = files.map((path) => {
    if (
      !/^(?:[a-zA-Z0-9_-]+\/)*__snapshots__\/[a-zA-Z0-9_.-]+\.snap$/.test(path)
    ) {
      throw new Error(
        'Inline snapshots and non-snapshot changes require manual review',
      );
    }

    const file = join(workspace, path);
    const stat = fs.lstatSync(file);

    if (!stat.isFile() || stat.nlink !== 1) {
      throw new Error('Expected regular snapshot file');
    }

    size += stat.size;

    if (size > MAX_BYTES) {
      throw new Error('Snapshot payload too large');
    }

    return { path, content: fs.readFileSync(file).toString('base64') };
  });

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(
    join(outputDirectory, 'snapshots.json'),
    JSON.stringify(payload),
  );
}

/**
 * Run tests, retry with snapshot updates on failure, then collect the artifact.
 *
 * Run only in the read-only job: pnpm executes code from the Renovate branch.
 * A successful update run must also pass a normal test run before collection.
 * Publish changed=true only after the artifact has been written successfully.
 *
 * @param {object} options Arguments provided by the read-only workflow job
 * @param {object} options.core Actions toolkit with setOutput
 * @returns {void} Sets changed or throws when tests or collection fail
 */
export function buildSnapshots({ core }) {
  const test = (args = []) => {
    const result = spawnSync(
      'pnpm',
      ['test', '--project=!@repo/storybook-config*', ...args],
      { stdio: 'inherit' },
    );

    if (result.error) {
      throw result.error;
    }

    return result.status === 0;
  };

  if (test()) {
    core.setOutput('changed', 'false');
    return;
  }

  if (!test(['-u']) || !test()) {
    throw new Error('Tests failed after updating snapshots');
  }

  collectSnapshots({
    workspace: process.cwd(),
    outputDirectory: join(process.env.RUNNER_TEMP, 'snapshot-output'),
  });
  core.setOutput('changed', 'true');
}

/**
 * Require a Renovate branch and an immutable commit ID before any API calls.
 *
 * @param {string} branch Repository-local branch name, including renovate/
 * @param {string} sha Expected tested commit SHA
 * @throws {Error} When the branch or SHA is outside the accepted format
 */
export function validateBranch(branch, sha) {
  validateBranchName(branch);

  if (!/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error('Invalid immutable head SHA');
  }
}

/** Require a repository-local Renovate branch before resolving its ref. */
function validateBranchName(branch) {
  if (
    !/^renovate\/[a-zA-Z0-9_./-]+$/.test(branch) ||
    branch.includes('..') ||
    branch.includes('//') ||
    branch.endsWith('/')
  ) {
    throw new Error('Invalid Renovate branch');
  }
}

/**
 * Accept only Vitest's external snapshot data assignments without evaluating JS.
 *
 * Vitest executes .snap files as JavaScript. A safe filename alone is therefore
 * insufficient: reject interpolation, extra statements and malformed encoding.
 * Escaped backslashes, backticks and dollar signs remain valid snapshot data.
 *
 * @param {string} content Canonical base64-encoded UTF-8 snapshot file
 * @throws {Error} When the decoded file contains anything outside this grammar
 */
export function validateSnapshot(content) {
  const buffer = Buffer.from(content, 'base64');
  if (buffer.toString('base64') !== content) {
    throw new Error('Noncanonical base64');
  }

  const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  const header =
    '// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html';
  if (!text.startsWith(`${header}\n`)) {
    throw new Error('Invalid snapshot header');
  }

  let position = header.length;

  const skipWhitespace = () => {
    while (position < text.length && /[ \t\r\n]/.test(text[position])) {
      position += 1;
    }
  };

  const consume = (literal) => {
    if (!text.startsWith(literal, position)) {
      throw new Error('Invalid snapshot assignment');
    }

    position += literal.length;
  };

  // Scan string contents instead of using a JS parser or executing the file.
  const readTemplateLiteral = () => {
    consume('`');

    while (position < text.length) {
      const character = text[position];
      position += 1;

      if (character === '`') {
        return;
      }

      if (character === '$' && text[position] === '{') {
        throw new Error('Snapshot interpolation is forbidden');
      }

      if (character === '\\') {
        if (!['\\', '`', '$'].includes(text[position])) {
          throw new Error('Invalid snapshot escape');
        }

        position += 1;
      }
    }

    throw new Error('Unterminated snapshot literal');
  };

  skipWhitespace();

  while (position < text.length) {
    consume('exports[');
    readTemplateLiteral();
    consume('] = ');
    readTemplateLiteral();
    consume(';');
    skipWhitespace();
  }
}

/**
 * Validate the entire artifact against the tested commit's tracked file tree.
 *
 * Accept at most 200 updates and 8 MiB of decoded content, restricted to existing
 * regular __snapshots__/*.snap files. Reject duplicates, symlinks and executable
 * files. A truncated GitHub tree cannot establish that every path is safe.
 *
 * @param {unknown} payload Parsed JSON artifact containing snapshot updates
 * @param {object} tree Complete recursive GitHub Git tree for the tested commit
 * @returns {Array<{path: string, content: string}>} Validated snapshot updates
 * @throws {Error} When any entry or the aggregate payload is invalid
 */
export function validatePayload(payload, tree) {
  if (
    !Array.isArray(payload) ||
    payload.length === 0 ||
    payload.length > MAX_FILES ||
    tree.truncated
  ) {
    throw new Error('Empty, oversized, or incomplete snapshot input');
  }

  const tracked = new Map(
    tree.tree.map((entry) => {
      return [entry.path, entry];
    }),
  );
  const seen = new Set();
  let bytes = 0;

  return payload.map((entry) => {
    const path = entry?.path;
    const original = tracked.get(path);
    if (
      typeof path !== 'string' ||
      !/^(?:[a-zA-Z0-9_-]+\/)*__snapshots__\/[a-zA-Z0-9_.-]+\.snap$/.test(
        path,
      ) ||
      path.split('/').some((part) => {
        return part === '.' || part === '..';
      }) ||
      seen.has(path) ||
      original?.type !== 'blob' ||
      original.mode !== '100644' ||
      typeof entry.content !== 'string'
    ) {
      throw new Error(
        'Only existing regular external snapshot files may change',
      );
    }

    bytes += Buffer.byteLength(entry.content, 'base64');

    if (bytes > MAX_BYTES) {
      throw new Error('Snapshot payload exceeds size limit');
    }

    validateSnapshot(entry.content);
    seen.add(path);

    return { path, content: entry.content };
  });
}

/**
 * Commit validated snapshot data through the API without running branch code.
 *
 * Validate every entry before creating blobs or commits. Parent the new commit
 * to the tested SHA, refuse a moved branch and never force-update its ref.
 *
 * @param {object} options Trusted request metadata and untrusted artifact data
 * @param {object} options.github Authenticated GitHub API client
 * @param {object} options.context Actions context containing repository identity
 * @param {string} options.branch Resolved Renovate branch
 * @param {string} options.sha Tested commit SHA
 * @param {unknown} options.payload Parsed snapshot artifact
 * @returns {Promise<void>} Resolves after the ref update and CI dispatch succeed
 */
export async function writeSnapshots({
  github,
  context,
  branch,
  sha,
  payload,
}) {
  validateBranch(branch, sha);

  const { repo } = context;
  const assertHead = async () => {
    const { data } = await github.rest.git.getRef({
      ...repo,
      ref: `heads/${branch}`,
    });
    if (data.object.sha !== sha) {
      throw new Error('Branch moved; request a fresh autofix run');
    }
  };

  await assertHead();

  const { data: commit } = await github.rest.git.getCommit({
    ...repo,
    commit_sha: sha,
  });
  const { data: tree } = await github.rest.git.getTree({
    ...repo,
    tree_sha: commit.tree.sha,
    recursive: '1',
  });

  // Validate every entry before creating any blobs or commits.
  const entries = validatePayload(payload, tree);
  const changes = [];

  for (const entry of entries) {
    // Preserve artifact order and avoid a burst of concurrent API writes.
    // eslint-disable-next-line no-await-in-loop
    const { data: blob } = await github.rest.git.createBlob({
      ...repo,
      content: entry.content,
      encoding: 'base64',
    });
    changes.push({
      path: entry.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  const { data: updatedTree } = await github.rest.git.createTree({
    ...repo,
    base_tree: commit.tree.sha,
    tree: changes,
  });
  if (updatedTree.sha === commit.tree.sha) {
    throw new Error('No snapshot changes');
  }

  const { data: updatedCommit } = await github.rest.git.createCommit({
    ...repo,
    message: 'test: update snapshots',
    tree: updatedTree.sha,
    parents: [sha],
  });

  await assertHead();

  // Non-force update rejects concurrent forward movement, since the new commit
  // has exactly the resolved input SHA as its parent.
  await github.rest.git.updateRef({
    ...repo,
    ref: `heads/${branch}`,
    sha: updatedCommit.sha,
    force: false,
  });

  await github.rest.actions.createWorkflowDispatch({
    ...repo,
    workflow_id: 'ci.yml',
    ref: branch,
  });
}

/**
 * Workflow entrypoint: read the downloaded artifact and apply its validated data.
 *
 * Reads HEAD_BRANCH and HEAD_SHA from the environment and snapshots.json from
 * snapshot-input/ in the workspace. Open without following a symlink, require a
 * regular file with one link and bound its encoded size before parsing JSON.
 * Any thrown error fails the actions/github-script step.
 *
 * @param {object} options Arguments provided by the trusted workflow job
 * @param {object} options.github Authenticated GitHub API client
 * @param {object} options.context GitHub Actions context
 * @returns {Promise<void>} Resolves after validated snapshots are committed
 */
export async function run({ github, context }) {
  const handle = fs.openSync(
    'snapshot-input/snapshots.json',
    // Combine open flags to reject a symlink without a separate check/use race.
    // eslint-disable-next-line no-bitwise
    fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
  );

  try {
    const stat = fs.fstatSync(handle);
    if (!stat.isFile() || stat.nlink !== 1 || stat.size > MAX_BYTES * 1.5) {
      throw new Error('Invalid snapshot artifact');
    }

    const payload = JSON.parse(fs.readFileSync(handle, 'utf8'));
    await writeSnapshots({
      github,
      context,
      branch: process.env.HEAD_BRANCH,
      sha: process.env.HEAD_SHA,
      payload,
    });
  } finally {
    fs.closeSync(handle);
  }
}
