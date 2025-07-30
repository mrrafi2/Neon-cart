// built this to solve the pesky react router quirk where the viewport stays put on navigation, now snap back to the top every time...

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop ( ) {
  const { pathname } = useLocation ( );  // track the current route path
  
  useEffect(( ) => {
    // when the pathname changes, scroll back to top
    window.scrollTo(0, 0);
  }, [ pathname ] );
  
  return null;
}
