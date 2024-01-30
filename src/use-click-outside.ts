import * as React from 'react';

export const useClickOutside = (reference: any, whatHappens: () => unknown, condition = true) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reference.current && !reference.current?.contains(event.target) && condition) whatHappens();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [reference, condition]);
};
