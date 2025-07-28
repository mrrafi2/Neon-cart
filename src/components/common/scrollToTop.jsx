// built this to solve the pesky React Router quirk where the viewport stays put on navigation, now snap back to the top every time...

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop ( ) {
  const { pathname } = useLocation ( );
  
  useEffect(( ) => {
    window.scrollTo(0, 0);
  }, [ pathname ] );
  
  return null;
}
