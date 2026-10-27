import ReactDOM from 'react-dom/client';

// Стили Mantine — централизованно, в правильном порядке (core первым).
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';

// Брендовый шрифт (self-hosted, с подмножеством кириллицы).
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/500.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/golos-text/700.css';

// Наши глобальные стили — последними, чтобы переопределяли дефолты Mantine.
import './index.css';

import reportWebVitals from './reportWebVitals';
import { AppWrapper } from './AppWrapper';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<AppWrapper />);

reportWebVitals();
