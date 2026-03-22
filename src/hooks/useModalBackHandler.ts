import { useEffect, useRef } from 'react';

export const useModalBackHandler = (
  isOpen: boolean, 
  onClose: () => void, 
  modalId: string
) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Push a new state when the modal opens
      window.history.pushState({ modal: modalId }, '');
      
      const handlePopState = (event: PopStateEvent) => {
        // If the user goes back, the state will no longer be this modal's ID
        // Or if they go back multiple times, it might be something else
        if (window.history.state?.modal !== modalId) {
          onCloseRef.current();
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If the modal is closed programmatically (not via back button),
        // we should clean up the history state if it's still ours
        if (window.history.state?.modal === modalId) {
          (window as any).__ignoreNextPopState = true;
          window.history.back();
          setTimeout(() => {
            (window as any).__ignoreNextPopState = false;
          }, 100);
        }
      };
    }
  }, [isOpen, modalId]);
};
