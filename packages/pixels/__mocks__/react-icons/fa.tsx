/* eslint-disable import-x/no-extraneous-dependencies */

import { vi } from 'vitest';

import React from 'react';

// export everything (else) unchanged
export * from 'react-icons/fa';

export const createMockedIcon = (displayName: string) => {
  const MockedIcon = () => {
    return <span data-testid={`icon-${displayName}`}>{displayName}</span>;
  };
  return vi.fn().mockImplementation(MockedIcon);
};

// mock some used fa icons
export const FaBars = createMockedIcon('FaBars');
export const FaChevronDown = createMockedIcon('FaChevronDown');
export const FaChevronUp = createMockedIcon('FaChevronUp');
export const FaEnvelope = createMockedIcon('FaEnvelope');
export const FaTimesCircle = createMockedIcon('FaTimesCircle');
