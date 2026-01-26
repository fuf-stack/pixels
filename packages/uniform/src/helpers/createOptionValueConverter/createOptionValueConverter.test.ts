import { describe, expect, it } from 'vitest';

import { createOptionValueConverter } from './createOptionValueConverter';

describe('createOptionValueConverter', () => {
  describe('with string values only', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('should return string values unchanged', () => {
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType('option1')).toBe('option1');
      expect(convertToOriginalType('option2')).toBe('option2');
      expect(convertToOriginalType('option3')).toBe('option3');
    });

    it('should have empty numberValueKeys set', () => {
      const { numberValueKeys } = createOptionValueConverter(options);

      expect(numberValueKeys.size).toBe(0);
    });
  });

  describe('with number values only', () => {
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
    ];

    it('should convert string keys back to numbers', () => {
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType('1')).toBe(1);
      expect(convertToOriginalType('2')).toBe(2);
      expect(convertToOriginalType('3')).toBe(3);
    });

    it('should handle number input and convert to number', () => {
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType(1)).toBe(1);
      expect(convertToOriginalType(2)).toBe(2);
      expect(convertToOriginalType(3)).toBe(3);
    });

    it('should have correct numberValueKeys set', () => {
      const { numberValueKeys } = createOptionValueConverter(options);

      expect(numberValueKeys.size).toBe(3);
      expect(numberValueKeys.has('1')).toBe(true);
      expect(numberValueKeys.has('2')).toBe(true);
      expect(numberValueKeys.has('3')).toBe(true);
    });
  });

  describe('with mixed string and number values', () => {
    const options = [
      { value: 1, label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 3, label: 'Three' },
      { value: 'four', label: 'Four' },
    ];

    it('should convert number values back to numbers', () => {
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType('1')).toBe(1);
      expect(convertToOriginalType('3')).toBe(3);
    });

    it('should keep string values as strings', () => {
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType('two')).toBe('two');
      expect(convertToOriginalType('four')).toBe('four');
    });

    it('should have correct numberValueKeys set', () => {
      const { numberValueKeys } = createOptionValueConverter(options);

      expect(numberValueKeys.size).toBe(2);
      expect(numberValueKeys.has('1')).toBe(true);
      expect(numberValueKeys.has('3')).toBe(true);
      expect(numberValueKeys.has('two')).toBe(false);
      expect(numberValueKeys.has('four')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options array', () => {
      const { convertToOriginalType, numberValueKeys } =
        createOptionValueConverter([]);

      expect(numberValueKeys.size).toBe(0);
      expect(convertToOriginalType('any')).toBe('any');
    });

    it('should handle zero as a number value', () => {
      const options = [
        { value: 0, label: 'Zero' },
        { value: 1, label: 'One' },
      ];
      const { convertToOriginalType, numberValueKeys } =
        createOptionValueConverter(options);

      expect(numberValueKeys.has('0')).toBe(true);
      expect(convertToOriginalType('0')).toBe(0);
      expect(typeof convertToOriginalType('0')).toBe('number');
    });

    it('should handle negative numbers', () => {
      const options = [
        { value: -1, label: 'Negative One' },
        { value: -2, label: 'Negative Two' },
      ];
      const { convertToOriginalType, numberValueKeys } =
        createOptionValueConverter(options);

      expect(numberValueKeys.has('-1')).toBe(true);
      expect(numberValueKeys.has('-2')).toBe(true);
      expect(convertToOriginalType('-1')).toBe(-1);
      expect(convertToOriginalType('-2')).toBe(-2);
    });

    it('should handle decimal numbers', () => {
      const options = [
        { value: 1.5, label: 'One and a half' },
        { value: 2.75, label: 'Two point seven five' },
      ];
      const { convertToOriginalType, numberValueKeys } =
        createOptionValueConverter(options);

      expect(numberValueKeys.has('1.5')).toBe(true);
      expect(numberValueKeys.has('2.75')).toBe(true);
      expect(convertToOriginalType('1.5')).toBe(1.5);
      expect(convertToOriginalType('2.75')).toBe(2.75);
    });

    it('should handle string that looks like a number but is defined as string', () => {
      const options = [
        { value: '123', label: 'String 123' },
        { value: 456, label: 'Number 456' },
      ];
      const { convertToOriginalType, numberValueKeys } =
        createOptionValueConverter(options);

      // '123' was defined as string, should stay string
      expect(numberValueKeys.has('123')).toBe(false);
      expect(convertToOriginalType('123')).toBe('123');
      expect(typeof convertToOriginalType('123')).toBe('string');

      // 456 was defined as number, should convert back to number
      expect(numberValueKeys.has('456')).toBe(true);
      expect(convertToOriginalType('456')).toBe(456);
      expect(typeof convertToOriginalType('456')).toBe('number');
    });

    it('should handle options with additional properties', () => {
      const options = [
        { value: 1, label: 'One', disabled: true, description: 'First option' },
        { value: 2, label: 'Two', icon: 'star' },
      ];
      const { convertToOriginalType } = createOptionValueConverter(options);

      expect(convertToOriginalType('1')).toBe(1);
      expect(convertToOriginalType('2')).toBe(2);
    });

    it('should handle unknown keys by returning them as strings', () => {
      const options = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
      ];
      const { convertToOriginalType } = createOptionValueConverter(options);

      // Unknown key that doesn't match any option
      expect(convertToOriginalType('unknown')).toBe('unknown');
      expect(convertToOriginalType('999')).toBe('999');
    });
  });
});
