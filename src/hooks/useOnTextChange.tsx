import {useCallback, useRef} from 'react';

/**
 * Hook to create a callback that only fires when the text changes.
 */
const useOnTextChange = callback => {
  const prevTextRef = useRef('');

  return useCallback(
    newText => {
      if (prevTextRef.current !== newText) {
        callback(newText); // Call your animation or logic here
        prevTextRef.current = newText; // Update the reference
      }
    },
    [callback],
  );
};

export default useOnTextChange;
