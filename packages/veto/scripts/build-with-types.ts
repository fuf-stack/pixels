#!/usr/bin/env tsx

/**
 * Temporary Dependencies Shifter for Type Generation
 *
 * This script temporarily moves zod and zodex from 'dependencies' to 'devDependencies'
 * during the build process to allow tsup's --dts-resolve flag to properly include
 * their types in the generated declaration files.
 *
 * What this script does:
 * 1. Creates a backup of the original package.json file
 * 2. Moves zod and zodex from dependencies to devDependencies
 * 3. Runs tsup with --dts-resolve flag (plus any additional arguments)
 * 4. Restores package.json from the backup file
 *
 * Usage:
 *   npx tsx build-with-types.ts [additional tsup arguments]
 *
 * Example:
 *   npx tsx build-with-types.ts --minify --sourcemap
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Dependencies that need to be temporarily moved for proper type generation
const DEPENDENCIES_TO_MOVE = ['zod', 'zodex'];

// Path to package.json
const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const BACKUP_FILE_PATH = path.join(process.cwd(), 'package.json.bak');

// Default tsup command
const DEFAULT_TSUP_ARGS = '--dts-resolve';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Creates a backup of the package.json file
 */
function createBackup(): void {
  console.log('\n📦 STEP 1: Creating backup of package.json...');

  try {
    fs.copyFileSync(PACKAGE_JSON_PATH, BACKUP_FILE_PATH);
    console.log('✅ Backup created successfully at package.json.bak');
  } catch (error) {
    console.error('❌ Failed to create backup file!');
    throw error;
  }
}

/**
 * Temporarily moves specified dependencies to devDependencies
 * to enable proper type generation with tsup --dts-resolve
 * @returns {boolean} True if changes were made to package.json
 */
function temporarilyMoveZodDependencies(): boolean {
  console.log(
    '\n📦 STEP 2: Moving dependencies to devDependencies for type generation...',
  );

  // Read package.json
  const packageJsonContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  const packageJson: PackageJson = JSON.parse(packageJsonContent);

  // Check if there are dependencies to process
  if (!packageJson.dependencies) {
    console.log('⚠️ No dependencies found in package.json.');
    return false;
  }

  // Ensure devDependencies exists
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  // Track if we made any changes
  let hasChanges = false;

  // Process each target dependency using array methods instead of loops
  DEPENDENCIES_TO_MOVE.forEach((depName) => {
    if (packageJson.dependencies?.[depName]) {
      // Store the version
      const version = packageJson.dependencies[depName];

      // Move to devDependencies
      console.log(`📦 Moving ${depName}@${version} to devDependencies`);
      // @ts-expect-error this is oks
      packageJson.devDependencies[depName] = version;

      // Remove from dependencies
      delete packageJson.dependencies[depName];

      hasChanges = true;
    } else {
      console.log(
        `ℹ️ Dependency ${depName} not found in dependencies, skipping.`,
      );
    }
  });

  // Remove dependencies section if empty
  if (
    packageJson.dependencies &&
    Object.keys(packageJson.dependencies).length === 0
  ) {
    delete packageJson.dependencies;
  }

  if (!hasChanges) {
    console.log('ℹ️ No changes were needed.');
    return false;
  }

  // Write updated package.json
  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8',
  );

  console.log('✅ Successfully moved dependencies to devDependencies!');
  return true;
}

/**
 * Runs the tsup build command with the specified arguments
 * @param {string[]} additionalArgs Additional arguments to pass to tsup
 */
function runTsupBuild(additionalArgs: string[] = []): void {
  console.log('\n🔨 STEP 3: Running tsup build with type resolution...');

  const tsupArgs = [DEFAULT_TSUP_ARGS, ...additionalArgs]
    .filter(Boolean)
    .join(' ');
  const command = `npx tsup ${tsupArgs}`;

  console.log(`🔄 Executing: ${command}`);

  try {
    // Run tsup with stdio inherited so the user can see the build output
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed!');
    throw error;
  }
}

/**
 * Restores the original package.json from backup
 */
function restoreFromBackup(): void {
  console.log('\n🔄 STEP 4: Restoring package.json from backup...');

  try {
    fs.copyFileSync(BACKUP_FILE_PATH, PACKAGE_JSON_PATH);
    console.log('✅ Original package.json restored successfully!');

    // Clean up the backup file
    fs.unlinkSync(BACKUP_FILE_PATH);
    console.log('🧹 Backup file removed.');
  } catch (error) {
    console.error('❌ Failed to restore from backup!');
    console.error(
      `   Please manually restore by copying ${BACKUP_FILE_PATH} to ${PACKAGE_JSON_PATH}`,
    );
    throw error;
  }
}

/**
 * Main function
 */
function main(): void {
  try {
    console.log(
      '🚀 Starting Temporary Dependencies Shifter for Type Generation',
    );

    // Get any additional tsup arguments from command line
    const additionalTsupArgs = process.argv.slice(2);

    // Step 1: Create backup
    createBackup();

    // Step 2: Move dependencies
    const changesMade = temporarilyMoveZodDependencies();

    // Step 3: Run tsup build
    runTsupBuild(additionalTsupArgs);

    // Step 4: Restore package.json from backup (only if we made changes)
    if (changesMade) {
      restoreFromBackup();
    } else {
      console.log(
        '\n🔄 STEP 4: No changes were made to package.json, but cleaning up backup file...',
      );
      // Clean up the backup file even if no changes were made
      if (fs.existsSync(BACKUP_FILE_PATH)) {
        fs.unlinkSync(BACKUP_FILE_PATH);
        console.log('🧹 Backup file removed.');
      }
    }

    console.log('\n✨ Build process completed successfully!');
  } catch (error) {
    console.error(
      '\n❌ Build process failed:',
      error instanceof Error ? error.message : String(error),
    );

    // Make sure the user knows they can restore from backup in case of failure
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      console.error(
        `\n💡 A backup exists at ${BACKUP_FILE_PATH}. You can restore it by running:`,
      );
      console.error(`   cp ${BACKUP_FILE_PATH} ${PACKAGE_JSON_PATH}`);
    }

    process.exit(1);
  }
}

// Execute the script
main();
