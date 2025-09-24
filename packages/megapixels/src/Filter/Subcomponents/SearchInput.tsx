import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import { motion } from '@fuf-stack/pixel-motion';
import Button from '@fuf-stack/pixels/Button';
import { useFormContext } from '@fuf-stack/uniform/hooks';
import Input from '@fuf-stack/uniform/Input';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';

export type SearchConfiguration =
  | boolean
  | {
      /** Placeholder shown in the search input */
      placeholder?: string;
    };

interface SearchInputProps {
  /** Slots class names passed from parent variants */
  classNames?: Partial<{
    searchWrapper: string;
    searchShowButton: string;
    searchMotionDiv: string;
    searchInput: string;
    searchInputWrapper: string;
    searchSubmitButton: string;
  }>;
  /** Search configuration */
  config: SearchConfiguration;
}

/**
 * SearchInput
 *
 * By default renders only a search button. When clicked, the text input animates in
 * and a trailing submit button is shown.
 */
const SearchInput = ({ classNames = {}, config }: SearchInputProps) => {
  const { formState, setFocus, triggerSubmit } = useFormContext();

  // Auto-open if there is an initial or externally set search value
  const isInitiallyVisible = !!formState?.defaultValues?.search;
  const [isVisible, setIsVisible] = useState(isInitiallyVisible);

  const placeholder =
    typeof config === 'object' ? config.placeholder : undefined;

  return (
    <div className={classNames.searchWrapper}>
      {!isVisible && (
        <Button
          ariaLabel="Show search input"
          className={classNames.searchShowButton}
          icon={<FaSearch />}
          size="sm"
          variant="bordered"
          onClick={() => {
            setIsVisible(true);
          }}
        />
      )}
      {isVisible ? (
        <motion.div
          key="search-input"
          animate={{ opacity: 1 }}
          className={classNames.searchMotionDiv}
          // if the input was not initially visible, animate in
          initial={!isInitiallyVisible ? { opacity: 0.5 } : false}
          onAnimationComplete={() => {
            // if the input was not initially visible, focus it
            if (!isInitiallyVisible) {
              setFocus('search');
            }
          }}
          transition={{
            duration: 0.3,
            ease: 'circOut',
          }}
        >
          <Input
            clearable
            debounceDelay={0}
            name="search"
            placeholder={placeholder}
            size="sm"
            className={{
              input: classNames.searchInput,
              inputWrapper: classNames.searchInputWrapper,
            }}
            // submit on clear
            onClear={() => {
              triggerSubmit();
            }}
          />
          <SubmitButton
            ariaLabel="Trigger search"
            // eslint-disable-next-line react/no-children-prop
            children={null}
            className={classNames.searchSubmitButton}
            color="primary"
            icon={<FaSearch />}
            size="sm"
          />
        </motion.div>
      ) : null}
    </div>
  );
};

export default SearchInput;
