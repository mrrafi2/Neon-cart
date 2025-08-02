import { StrictMode , Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { CartAnimationProvider } from "./contexts/cartAnimationContext.jsx"


const App = lazy(( ) => import('./App.jsx'));

import LoadingSpinner from './components/common/loading.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Suspense fallback={<LoadingSpinner />}>
<CartAnimationProvider>
      <App />
      </CartAnimationProvider>
    </Suspense>
  </StrictMode>,
)
