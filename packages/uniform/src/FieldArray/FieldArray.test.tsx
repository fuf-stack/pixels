import { describe } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';

import * as edgeCaseStories from './stories/FieldArray.edge-cases.stories';
import * as stories from './stories/FieldArray.stories';

describe('Story Snapshots', () => {
  // keep existing unit snapshot scenarios, composition interactions also run in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    FlatArray: stories.FlatArray,
    WithInitialValue: stories.WithInitialValue,
    Required: stories.Required,
    Invalid: stories.Invalid,
    LastElementNotRemovable: stories.LastElementNotRemovable,
    FlatLastElementNotRemovable: stories.FlatLastElementNotRemovable,
    WithoutLabels: stories.WithoutLabels,
    CustomTestId: stories.CustomTestId,
    Sortable: stories.Sortable,
    Duplicate: stories.Duplicate,
    InsertAfter: stories.InsertAfter,
    DuplicateAndInsertAfter: stories.DuplicateAndInsertAfter,
    AllFeatures: stories.AllFeatures,
  });
  storySnapshots(edgeCaseStories);
});
