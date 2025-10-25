/* eslint-disable import-x/no-extraneous-dependencies */

// INFO: react-json-view is bundled with --dts-resolve for now (dev dep)
import JsonView from '@uiw/react-json-view';

/**
 * A custom renderer for JSON null values in the JsonView component.
 *
 * This component provides a consistent way to render null values across the JSON viewer.
 * It can be customized to handle null values differently from the default representation,
 * such as using different styling or displaying alternative text.
 */
const NullRenderer = () => {
  return (
    <JsonView.Null
      render={() => {
        return (
          <span className="rounded bg-warning-100 px-1 text-xs text-warning-700">
            null
          </span>
        );
      }}
    />
  );
};

export default NullRenderer;
