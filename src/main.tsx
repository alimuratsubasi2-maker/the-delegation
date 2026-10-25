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
    // `?debug=1` exposes the stores so automated checks can stage a project without an API key
    if (new URLSearchParams(window.location.search).has('debug')) {
      Promise.all([import('./integration/store/coreStore'), import('./integration/store/uiStore'), import('./integration/store/teamStore')])
        .then(([core, ui, team]) => { (window as any).__nova = { core: core.useCoreStore, ui: ui.useUiStore, team: team.useTeamStore }; });
    }
  });
}
