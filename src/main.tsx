import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {captureFirstTouchUtm} from './utils/utm';

// Record the first-touch acquisition source before anything else (SPEC §4).
captureFirstTouchUtm();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
