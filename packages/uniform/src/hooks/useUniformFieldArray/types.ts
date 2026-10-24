export interface FieldArrayElementMethods {
  /** Add new element at end */
  append: () => void;
  /** Clone current element */
  duplicate: () => void;
  /** Add new element after current */
  insert: () => void;
  /** Remove current element */
  remove: () => void;
}

/** Bound operations and identification for one array row */
export interface FieldArrayItem {
  /** Stable row ID */
  id: string;
  /** Data supplied to the consumer's row renderer */
  renderProps: {
    /** Row position */
    index: number;
    /** Number of rows */
    length: number;
    /** Operations bound to this row */
    methods: FieldArrayElementMethods;
    /** Field name */
    name: string;
    /** HTML data-testid attribute for e2e tests */
    testId: string;
  };
}
