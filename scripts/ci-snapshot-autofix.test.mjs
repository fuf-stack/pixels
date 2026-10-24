import { afterEach, expect, test, vi } from 'vitest';

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildSnapshots,
  collectSnapshots,
  resolveHead,
  validateBranch,
  validatePayload,
  validateSnapshot,
  writeSnapshots,
} from './ci-snapshot-autofix.mjs';

// Never launch pnpm recursively when testing the build orchestration.
vi.mock('node:child_process', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    spawnSync: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.mocked(spawnSync).mockReset();
});

const sha = 'a'.repeat(40);
const path = 'packages/veto/src/__snapshots__/veto.test.ts.snap';
const header =
  '// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html\n\n';
const encode = (text) => {
  return Buffer.from(text).toString('base64');
};
const payload = [
  { path, content: encode(`${header}exports[\`key\`] = \`snapshot data\`;\n`) },
];
const tree = {
  tree: [{ path, type: 'blob', mode: '100644' }],
  truncated: false,
};

test('accepts only bounded existing regular external snapshots', () => {
  expect(validatePayload(payload, tree)).toEqual(payload);
  const hostilePaths = [
    '../__snapshots__/escape.snap',
    '/__snapshots__/absolute.snap',
    'packages/__snapshots__/../../escape.snap',
    'packages/__snapshots__/nested/test.js',
    'packages/veto/src/veto.test.ts',
    '.github/workflows/__snapshots__/test.snap',
    'packages/__snapshots__/test.snap\nother',
  ];
  for (const hostilePath of hostilePaths) {
    expect(() => {
      return validatePayload([{ ...payload[0], path: hostilePath }], tree);
    }).toThrow();
  }
  expect(() => {
    return validatePayload(payload, { ...tree, tree: [] });
  }).toThrow();
  for (const mode of ['120000', '100755', '160000']) {
    expect(() => {
      return validatePayload(payload, { tree: [{ ...tree.tree[0], mode }] });
    }).toThrow();
  }
  expect(() => {
    return validatePayload(payload, { ...tree, truncated: true });
  }).toThrow();
  expect(() => {
    return validatePayload([...payload, ...payload], tree);
  }).toThrow();
  expect(() => {
    return validatePayload([{ ...payload[0], content: 'not base64!' }], tree);
  }).toThrow();
  expect(() => {
    return validatePayload(
      [
        {
          ...payload[0],
          content: Buffer.alloc(8 * 1024 * 1024 + 1).toString('base64'),
        },
      ],
      tree,
    );
  }).toThrow();
  expect(() => {
    return validatePayload([], tree);
  }).toThrow();
  expect(() => {
    return validatePayload(Array(201).fill(payload[0]), tree);
  }).toThrow();
});

test('rejects unsafe branches and mutable refs', () => {
  validateBranch('renovate/package-1.x', sha);
  for (const branch of [
    'main',
    'refs/heads/renovate/pkg',
    'renovate/../main',
    'renovate/a//b',
    'renovate/a\nmain',
    'renovate/a/',
  ]) {
    expect(() => {
      return validateBranch(branch, sha);
    }).toThrow();
  }
  expect(() => {
    return validateBranch('renovate/package', 'HEAD');
  }).toThrow();
});

function mockGithub(heads = [sha, sha]) {
  const calls = [];
  const response = (name, data) => {
    return async (args) => {
      calls.push([name, args]);
      return { data };
    };
  };
  return {
    calls,
    rest: {
      git: {
        getRef: async (args) => {
          calls.push(['getRef', args]);
          return { data: { object: { sha: heads.shift() } } };
        },
        getCommit: response('getCommit', { tree: { sha: 'old-tree' } }),
        getTree: response('getTree', tree),
        createBlob: response('createBlob', { sha: 'new-blob' }),
        createTree: response('createTree', { sha: 'new-tree' }),
        createCommit: response('createCommit', { sha: 'new-commit' }),
        updateRef: response('updateRef', {}),
      },
      actions: { createWorkflowDispatch: response('dispatch', {}) },
    },
  };
}
const context = { repo: { owner: 'fixture', repo: 'fixture' } };

test.each(
  ['pull_request_target', 'issue_comment'].flatMap((eventName) => {
    return [null, 'closed', 'fork', 'branch', 'sha'].map((invalid) => {
      return [eventName, invalid];
    });
  }),
)(
  'resolves %s requests with %s input only when the head is valid',
  async (eventName, invalid) => {
    const github = mockGithub([invalid === 'sha' ? 'HEAD' : sha]);
    const pr = {
      state: invalid === 'closed' ? 'closed' : 'open',
      head: {
        ref: invalid === 'branch' ? 'main' : 'renovate/pkg',
        repo: {
          full_name:
            invalid === 'fork' ? 'outsider/fixture' : 'fixture/fixture',
        },
      },
    };
    github.rest.pulls = { get: vi.fn().mockResolvedValue({ data: pr }) };
    const core = { setOutput: vi.fn() };
    const request = resolveHead({
      github,
      core,
      context: {
        ...context,
        eventName,
        payload:
          eventName === 'issue_comment'
            ? { issue: { number: 42 } }
            : { pull_request: { number: 42 } },
      },
    });

    if (invalid) {
      await expect(request).rejects.toThrow();
      expect(core.setOutput).not.toHaveBeenCalled();
    } else {
      await request;
      expect(github.rest.pulls.get).toHaveBeenCalledWith({
        ...context.repo,
        pull_number: 42,
      });
      expect(core.setOutput.mock.calls).toEqual([
        ['branch', 'renovate/pkg'],
        ['sha', sha],
      ]);
    }
  },
);

test.each(['refs/heads/main', 'refs/heads/renovate/pkg'])(
  'manual request from %s must use the default-branch workflow',
  async (ref) => {
    const github = mockGithub();
    const core = { setOutput: vi.fn() };
    const request = resolveHead({
      github,
      core,
      context: {
        ...context,
        eventName: 'workflow_dispatch',
        ref,
        payload: {
          repository: { default_branch: 'main' },
          inputs: { branch: 'renovate/pkg' },
        },
      },
    });

    if (ref === 'refs/heads/main') {
      await request;
      expect(core.setOutput).toHaveBeenCalledWith('sha', sha);
    } else {
      await expect(request).rejects.toThrow(/default branch/);
      expect(github.calls).toEqual([]);
    }
  },
);

/** Create an isolated checkout for exercising the real Git/file collector. */
function snapshotFixture() {
  const directory = fs.mkdtempSync(join(tmpdir(), 'ci-snapshot-autofix-'));
  const workspace = join(directory, 'repo');
  const outputDirectory = join(directory, 'artifact');
  const file = join(workspace, path);
  fs.mkdirSync(join(file, '..'), { recursive: true });
  fs.writeFileSync(file, 'original snapshot');
  fs.writeFileSync(join(workspace, 'README.md'), 'original source');

  const git = (args) => {
    return execFileSync('git', args, { cwd: workspace, stdio: 'pipe' });
  };
  git(['init', '-q']);
  git(['add', '.']);
  git([
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.invalid',
    '-c',
    'commit.gpgsign=false',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '-qm',
    'fixture',
  ]);
  fs.writeFileSync(file, Buffer.from(payload[0].content, 'base64'));

  return { directory, workspace, outputDirectory, file };
}

test('collects only tracked regular snapshots and rejects source, untracked and symlink changes', () => {
  const fixture = snapshotFixture();

  try {
    collectSnapshots(fixture);
    expect(
      JSON.parse(
        fs.readFileSync(
          join(fixture.outputDirectory, 'snapshots.json'),
          'utf8',
        ),
      ),
    ).toEqual(payload);

    const readme = join(fixture.workspace, 'README.md');
    fs.writeFileSync(readme, 'changed source');
    expect(() => {
      return collectSnapshots(fixture);
    }).toThrow(/non-snapshot/);
    fs.writeFileSync(readme, 'original source');

    const untracked = join(fixture.workspace, 'untracked.txt');
    fs.writeFileSync(untracked, 'extra file');
    expect(() => {
      return collectSnapshots(fixture);
    }).toThrow(/tracked snapshot/);
    fs.unlinkSync(untracked);

    fs.unlinkSync(fixture.file);
    fs.symlinkSync(readme, fixture.file);
    expect(() => {
      return collectSnapshots(fixture);
    }).toThrow(/regular snapshot/);
  } finally {
    fs.rmSync(fixture.directory, { recursive: true, force: true });
  }
});

test('build orchestration requires successful update and verification runs before publishing an artifact', () => {
  const core = { setOutput: vi.fn() };
  const spawn = vi.mocked(spawnSync);

  spawn.mockReturnValueOnce({ status: 0 });
  buildSnapshots({ core });
  expect(core.setOutput).toHaveBeenCalledWith('changed', 'false');
  expect(spawn).toHaveBeenCalledTimes(1);
  core.setOutput.mockClear();
  spawn.mockReset();

  spawn.mockReturnValueOnce({ status: 1 }).mockReturnValueOnce({ status: 1 });
  expect(() => {
    return buildSnapshots({ core });
  }).toThrow(/Tests failed/);
  expect(core.setOutput).not.toHaveBeenCalled();
  expect(spawn).toHaveBeenCalledTimes(2);
  spawn.mockReset();

  spawn
    .mockReturnValueOnce({ status: 1 })
    .mockReturnValueOnce({ status: 0 })
    .mockReturnValueOnce({ status: 1 });
  expect(() => {
    return buildSnapshots({ core });
  }).toThrow(/Tests failed/);
  expect(core.setOutput).not.toHaveBeenCalled();
  spawn.mockReset();

  const fixture = snapshotFixture();
  try {
    vi.spyOn(process, 'cwd').mockReturnValue(fixture.workspace);
    vi.stubEnv('RUNNER_TEMP', fixture.directory);
    spawn
      .mockReturnValueOnce({ status: 1 })
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 0 });
    buildSnapshots({ core });
    expect(
      spawn.mock.calls.map(([, args]) => {
        return args;
      }),
    ).toEqual([['test'], ['test', '-u'], ['test']]);
    expect(
      fs.existsSync(join(fixture.directory, 'snapshot-output/snapshots.json')),
    ).toBe(true);
    expect(core.setOutput).toHaveBeenCalledWith('changed', 'true');
  } finally {
    fs.rmSync(fixture.directory, { recursive: true, force: true });
  }
});

test('writes a data-only commit parented to the tested SHA without force', async () => {
  const github = mockGithub();
  await writeSnapshots({
    github,
    context,
    branch: 'renovate/pkg',
    sha,
    payload,
  });
  expect(
    github.calls.find(([name]) => {
      return name === 'createCommit';
    })[1].parents,
  ).toEqual([sha]);
  expect(
    github.calls.find(([name]) => {
      return name === 'createTree';
    })[1].tree,
  ).toEqual([{ path, mode: '100644', type: 'blob', sha: 'new-blob' }]);
  expect(
    github.calls.find(([name]) => {
      return name === 'updateRef';
    })[1].force,
  ).toBe(false);
  expect(github.calls[github.calls.length - 1][0]).toBe('dispatch');
});

test.each([{ heads: ['b'.repeat(40)] }, { heads: [sha, 'b'.repeat(40)] }])(
  'rejects head movement before writes or ref update: $heads',
  async ({ heads }) => {
    const github = mockGithub(heads);
    await expect(
      writeSnapshots({ github, context, branch: 'renovate/pkg', sha, payload }),
    ).rejects.toThrow(/Branch moved/);
    expect(
      !github.calls.some(([name]) => {
        return name === 'updateRef' || name === 'dispatch';
      }),
    ).toBeTruthy();
  },
);

test('validates the complete artifact before any GitHub mutation', async () => {
  const github = mockGithub();
  await expect(
    writeSnapshots({
      github,
      context,
      branch: 'renovate/pkg',
      sha,
      payload: [...payload, { path: 'package.json', content: 'e30=' }],
    }),
  ).rejects.toThrow();
  expect(
    !github.calls.some(([name]) => {
      return name.startsWith('create') || name === 'updateRef';
    }),
  ).toBeTruthy();
});

// These fixtures intentionally contain literal JS interpolation syntax.
/* eslint-disable no-template-curly-in-string */
test('snapshot grammar rejects executable content and accepts escaped data', () => {
  validateSnapshot(encode(`${header}exports[\`key\`] = \`safe\`;\n`));
  validateSnapshot(
    encode(
      `${
        header
      }exports[\`key\`] = \`backslash: \\\\ backtick: \\\` interpolation text: \\\${literal}\`;\n`,
    ),
  );
  const attacks = [
    'exports[`key`] = `${process.exit()}`;',
    'exports[`${process.exit()}`] = `value`;',
    'exports[`key`] = `safe`; process.exit();',
    'exports[`key`] = `safe` + process.exit();',
    'exports[`key`] = `unterminated',
    'exports[`key`] = `safe\\`;',
    'exports[`key`] = String.raw`value`;',
    '/* comment */ exports[`key`] = `value`;',
  ];
  for (const attack of attacks) {
    expect(() => {
      return validateSnapshot(encode(header + attack));
    }).toThrow();
  }
  expect(() => {
    return validateSnapshot(Buffer.from([0xff]).toString('base64'));
  }).toThrow();
  expect(() => {
    return validateSnapshot('YQ==\n');
  }).toThrow();
});

/* eslint-enable no-template-curly-in-string */

test('does not dispatch CI if a concurrent head update rejects the commit', async () => {
  const github = mockGithub();
  github.rest.git.updateRef = async (args) => {
    github.calls.push(['updateRef', args]);
    expect(args.force).toBe(false);
    throw new Error('Not a fast forward');
  };
  await expect(
    writeSnapshots({ github, context, branch: 'renovate/pkg', sha, payload }),
  ).rejects.toThrow(/Not a fast forward/);
  expect(
    !github.calls.some(([name]) => {
      return name === 'dispatch';
    }),
  ).toBeTruthy();
});
