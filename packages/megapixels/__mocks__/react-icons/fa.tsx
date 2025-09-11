/* eslint-disable import/no-extraneous-dependencies */

import { vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

// export everything (else) unchanged
export * from 'react-icons/fa';

export const createMockedIcon = (displayName: string) => {
  const MockedIcon = () => (
    <span data-testid={`icon-${displayName}`}>{displayName}</span>
  );
  return vi.fn().mockImplementation(MockedIcon);
};

// mock some used fa icons
export const FaAngleDown = createMockedIcon('FaAngleDown');
export const FaAngleUp = createMockedIcon('FaAngleUp');
export const FaCopy = createMockedIcon('FaCopy');
export const FaEnvelope = createMockedIcon('FaEnvelope');
export const FaFlask = createMockedIcon('FaFlask');
export const FaGripVertical = createMockedIcon('FaGripVertical');
export const FaPhone = createMockedIcon('FaPhone');
export const FaPlus = createMockedIcon('FaPlus');
export const FaRocket = createMockedIcon('FaRocket');
export const FaTimes = createMockedIcon('FaTimes');
