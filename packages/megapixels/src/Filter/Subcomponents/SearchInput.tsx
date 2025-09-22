import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

import { motion } from '@fuf-stack/pixel-motion';
import { cn } from '@fuf-stack/pixel-utils';
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
  /** CSS class name */
  className?: string;
  /** Search configuration */
  config: SearchConfiguration;
}

/**
 * SearchInput
 *
 * By default renders only a search button. When clicked, the text input animates in
 * and a trailing submit button is shown.
 */
const SearchInput = ({ className = undefined, config }: SearchInputProps) => {
  const { formState, setFocus, triggerSubmit } = useFormContext();

  // Auto-open if there is an initial or externally set search value
  const isInitiallyVisible = !!formState?.defaultValues?.search;
  const [isVisible, setIsVisible] = useState(isInitiallyVisible);

  const placeholder =
    typeof config === 'object' ? config.placeholder : undefined;

  return (
    <div className={cn('flex items-center', className)}>
      {!isVisible && (
        <Button
          aria-label="Show search input"
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
          className="flex w-72 gap-2"
          initial={{ opacity: 0.5 }}
          onAnimationComplete={() => {
            // if the input was not initially visible, focus it
            if (!isInitiallyVisible) {
              setFocus('search');
            }
          }}
          transition={{
            // if the input was not initially visible, animate in
            duration: isInitiallyVisible ? 0 : 0.3,
            ease: 'circOut',
          }}
        >
          <Input
            clearable
            // disable debounce
            debounceDelay={0}
            name="search"
            placeholder={placeholder}
            size="sm"
            // submit on clear
            onClear={() => {
              triggerSubmit();
            }}
          />
          <SubmitButton
            // eslint-disable-next-line react/no-children-prop
            children={null}
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
