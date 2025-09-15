/* eslint-disable import-x/no-extraneous-dependencies */

import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';

import react from '@fuf-stack/eslint-config-fuf/react';
import vitest from '@fuf-stack/eslint-config-fuf/vitest';

const gitignorePath = path.resolve('.', '.gitignore');

export default [includeIgnoreFile(gitignorePath), ...react, ...vitest];
