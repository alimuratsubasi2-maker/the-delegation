import { create } from 'zustand';

/**
 * Obsidian "second brain" for the office.
 *
 * Talks to the user's local Obsidian vault through the Local REST API plugin
 * (runs on 127.0.0.1, so nothing leaves the machine except what ends up in
 * the Gemini prompt). On connect it builds a compact map of every project
 * (each folder's "Genel Bakis" note); per request it runs keyword searches
 * and injects the most relevant snippets into the agents' system prompt.
 */

const STORAGE_KEY = 'obsidian-config';
export const DEFAULT_OBSIDIAN_URL = 'http://127.0.0.1:27123';

/** Character budgets keep prompts inside free-tier token limits. */
const OVERVIEW_PER_PROJECT = 900;
const OVERVIEW_MAX = 14000;
const SEARCH_MAX = 4000;
const SEARCH_TOP_FILES = 5;
const KEYWORDS_MAX = 5;

const STOPWORDS = new Set([
  've', 'ile', 'bir', 'bu', 'şu', 'için', 'gibi', 'daha', 'çok', 'ama', 'veya', 'olan', 'olsun', 'olarak',
  'ben', 'sen', 'biz', 'siz', 'benim', 'senin', 'bana', 'sana', 'şimdi', 'sonra', 'önce', 'nasıl', 'neden',
  'istiyorum', 'yapalım', 'yap', 'lütfen', 'merhaba', 'tamam', 'evet', 'hayır', 'kadar', 'her', 'hepsi',
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'task', 'project', 'please',
]);

export type ObsidianStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ObsidianConfig {
  url: string;
  apiKey: string;
}

interface ObsidianState extends ObsidianConfig {
  status: ObsidianStatus;
  error: string | null;
  overview: string;
  projectCount: number;
  noteCount: number;
  setConfig: (config: ObsidianConfig) => void;
}

const loadConfig = (): ObsidianConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { url: DEFAULT_OBSIDIAN_URL, apiKey: '', ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { url: DEFAULT_OBSIDIAN_URL, apiKey: '' };
};

export const useObsidianStore = create<ObsidianState>((set) => ({
  ...loadConfig(),
  status: 'disconnected',
  error: null,
  overview: '',
  projectCount: 0,
  noteCount: 0,
  setConfig: (config) => {
    set({ ...config });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch { /* storage unavailable */ }
  },
}));

// ── REST helpers ─────────────────────────────────────────────

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const { url, apiKey } = useObsidianStore.getState();
  const res = await fetch(`${url.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Obsidian ${res.status}: ${res.statusText}`);
  return res;
}

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

async function listDir(dir: string): Promise<string[]> {
  const res = await request(`/vault/${dir ? encodePath(dir) + '/' : ''}`);
  const data = await res.json();
  return data.files || [];
}

async function readNote(path: string): Promise<string> {
  const res = await request(`/vault/${encodePath(path)}`, { headers: { Accept: 'text/markdown' } });
  return res.text();
}

/** Strips frontmatter, links and excess whitespace so snippets stay dense. */
function compact(md: string, max: number): string {
  return md
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, max);
}

// ── Public API ───────────────────────────────────────────────

/** Connects to the vault and builds the project overview. */
export async function connectObsidian(): Promise<void> {
  const store = useObsidianStore;
  store.setState({ status: 'connecting', error: null });
  try {
    const ping = await (await request('/')).json();
    if (ping.authenticated === false) throw new Error('API anahtarı geçersiz');

    const root = await listDir('');
    const folders = root.filter((f) => f.endsWith('/') && !f.startsWith('.'));
    const rootNotes = root.filter((f) => f.endsWith('.md'));

    const sections: string[] = [];
    let noteCount = rootNotes.length;

    for (const folder of folders) {
      const name = folder.replace(/\/$/, '');
      try {
        const files = await listDir(name);
        noteCount += files.filter((f) => f.endsWith('.md')).length;
        const overviewFile = files.find((f) => /genel bak[ıi]s/i.test(f)) || files.find((f) => f.endsWith('.md'));
        const others = files.filter((f) => f.endsWith('.md') && f !== overviewFile).map((f) => f.replace(/\.md$/, ''));
        const body = overviewFile ? compact(await readNote(`${name}/${overviewFile}`), OVERVIEW_PER_PROJECT) : '';
        sections.push(`### ${name}\n${body}${others.length ? `\nNotlar: ${others.join(', ')}` : ''}`);
      } catch (e) {
        console.warn('[Obsidian] Skipping folder', name, e);
      }
    }

    store.setState({
      status: 'connected',
      overview: sections.join('\n\n').slice(0, OVERVIEW_MAX),
      projectCount: folders.length,
      noteCount,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    store.setState({
      status: 'error',
      error: msg.includes('Failed to fetch') ? 'Obsidian açık değil veya adrese ulaşılamıyor' : msg,
    });
  }
}

export function isObsidianConnected(): boolean {
  return useObsidianStore.getState().status === 'connected';
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  // Longer words first: they are usually the most specific (names, topics)
  return [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, KEYWORDS_MAX);
}

/** Searches the vault for the given text and returns the best matching snippets. */
export async function searchObsidian(text: string): Promise<string> {
  if (!isObsidianConnected() || !text.trim()) return '';
  const scores = new Map<string, { score: number; contexts: string[] }>();

  await Promise.all(extractKeywords(text).map(async (kw) => {
    try {
      const res = await request(`/search/simple/?query=${encodeURIComponent(kw)}&contextLength=160`, { method: 'POST' });
      const results: { filename: string; score: number; matches: { context: string }[] }[] = await res.json();
      for (const r of results) {
        const entry = scores.get(r.filename) || { score: 0, contexts: [] };
        entry.score += 1 + (r.score || 0);
        entry.contexts.push(...r.matches.slice(0, 2).map((m) => m.context.replace(/\s+/g, ' ').trim()));
        scores.set(r.filename, entry);
      }
    } catch (e) {
      console.warn('[Obsidian] Search failed for', kw, e);
    }
  }));

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, SEARCH_TOP_FILES)
    .map(([file, { contexts }]) => `- ${file}: ${[...new Set(contexts)].slice(0, 3).join(' … ')}`)
    .join('\n')
    .slice(0, SEARCH_MAX);
}

/**
 * Builds the knowledge block injected into an agent's system prompt.
 * The lead and the Obsidian agent get the full project map; everyone gets
 * search hits for what they are currently working on.
 */
export async function buildBrainContext(query: string, fullMap: boolean): Promise<string> {
  if (!isObsidianConnected()) return '';
  const { overview } = useObsidianStore.getState();
  const hits = await searchObsidian(query);
  if (!hits && !fullMap) return '';

  return `\nOBSIDIAN BRAIN (user's own vault: all past projects and mind maps — treat as known context, never ask the user to re-explain it):` +
    (fullMap && overview ? `\nPROJECT MAP:\n${overview}` : '') +
    (hits ? `\nRELEVANT NOTES for "${query.slice(0, 80)}":\n${hits}` : '');
}

// Reconnect automatically when a key was saved in a previous session
if (useObsidianStore.getState().apiKey) connectObsidian();
