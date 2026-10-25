import ReactDOM from 'react-dom/client';
import './index.css';
import './theme/night.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const trackingTopic = new URLSearchParams(window.location.search).get('takip');

// `?takip=<topic>` opens the lightweight phone tracking page instead of the 3D office
if (trackingTopic) {
  document.title = 'Nova Ofis · Takip';
  import('./interface/mobile/MobileViewer').then(({ default: MobileViewer }) => {
    root.render(<MobileViewer topic={trackingTopic} />);
  });
} else {
  Promise.all([import('./App'), import('./core/live/LiveShare'), import('./core/archive/ProjectArchive')]).then(([{ default: App }, { startLiveShare }]) => {
    startLiveShare();
    root.render(<App />);
  });
}
