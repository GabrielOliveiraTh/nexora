import { createRoot } from 'react-dom/client';
import { StyleProvider, px2remTransformer } from '@ant-design/cssinjs';
import { App } from './App';

const px2rem = px2remTransformer({ rootValue: 10 });

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <StyleProvider transformers={[px2rem]}>
    <App />
  </StyleProvider>,
);
