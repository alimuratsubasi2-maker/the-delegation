import { create } from 'zustand';
import { getAllCharacters } from '../../data/agents';
import { useCoreStore } from '../../integration/store/coreStore';
import { getActiveAgentSet } from '../../integration/store/teamStore';
import { useUiStore } from '../../integration/store/uiStore';

/**
 * Live phone tracking.
 *
 * The office runs entirely in the desktop browser, so to follow it from a phone
 * we mirror a compact, gzip-compressed snapshot of the project to a secret
 * ntfy.sh topic. The phone page (`?takip=<topic>`) replays the last 12 hours of
 * that topic and then listens live. The phone can send back approve / reject /
 * chat commands on `<topic>-cmd`. Human-readable push notifications go to
 * `<topic>-bildirim` (ntfy app) and optionally to a Telegram bot.
 */

export const NTFY = 'https://ntfy.sh';
const STORAGE_KEY = 'live-share';
const PUBLISH_DEBOUNCE_MS = 4000;
const MIN_PUBLISH_INTERVAL_MS = 12000;
/** ntfy turns bodies over 4096 bytes into attachments; stay below it. */
const MAX_BODY = 3900;
const OUTPUT_CHUNK = 2600;

export interface LiveConfig {
  enabled: boolean;
  topic: string;
  telegramToken: string;
  telegramChatId: string;
}

interface LiveState extends LiveConfig {
  lastSentAt: number | null;
  lastError: string | null;
  setConfig: (c: Partial<LiveConfig>) => void;
}

const randomTopic = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return 'nova-ofis-' + Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
};

const loadConfig = (): LiveConfig => {
  const fallback = { enabled: false, topic: randomTopic(), telegramToken: '', telegramChatId: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return fallback;
};

export const useLiveStore = create<LiveState>((set, get) => ({
  ...loadConfig(),
  lastSentAt: null,
  lastError: null,
  setConfig: (c) => {
    set(c);
    const { enabled, topic, telegramToken, telegramChatId } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, topic, telegramToken, telegramChatId }));
    } catch { /* storage unavailable */ }
  },
}));

export const trackingUrl = (topic: string) =>
  `${window.location.origin}${import.meta.env.BASE_URL}?takip=${encodeURIComponent(topic)}`;

// ── Encoding (shared with the phone viewer) ───────────────────

const toBase64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

export async function encodePayload(obj: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(obj));
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const gz = new Uint8Array(await new Response(stream).arrayBuffer());
  return 'z:' + toBase64(gz);
}

export async function decodePayload(text: string): Promise<any> {
  if (!text.startsWith('z:')) return JSON.parse(text);
  const bin = Uint8Array.from(atob(text.slice(2)), (c) => c.charCodeAt(0));
  const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}

// ── Snapshot ─────────────────────────────────────────────────

const clip = (s: string | undefined | null, n: number) => (s ? (s.length > n ? s.slice(0, n) + '…' : s) : '');

function buildSnapshot() {
  const core = useCoreStore.getState();
  const ui = useUiStore.getState();
  const team = getActiveAgentSet();
  const people = getAllCharacters(team);
  const nameOf = (i: number) => people.find((p) => p.index === i)?.name || `Ajan ${i}`;

  return {
    k: 'state',
    t: Date.now(),
    team: team.teamName,
    tid: team.id,
    color: team.color,
    phase: core.phase,
    brief: clip(core.userBrief, 600),
    cost: Number(core.totalEstimatedCost.toFixed(4)),
    tokens: core.totalTokenUsage.totalTokens ?? (core.totalTokenUsage.promptTokens + core.totalTokenUsage.completionTokens),
    agents: people.filter((p) => p.index !== team.user.index).map((p) => {
      const task = core.tasks.find((t) => t.assignedAgentId === p.index && (t.status === 'in_progress' || t.status === 'on_hold'));
      return { i: p.index, n: p.name, c: p.color, s: ui.agentStatuses[p.index] || 'idle', d: clip(task?.title, 60) };
    }),
    tasks: core.tasks.map((t) => ({
      id: t.id, ti: clip(t.title, 90), s: t.status, a: nameOf(t.assignedAgentId), ai: t.assignedAgentId,
      de: clip(t.description, 160),
      dr: t.status === 'on_hold' ? clip(t.draftOutput || t.output, 700) : undefined,
    })),
    log: core.actionLog.slice(-12).map((l) => ({ ts: l.timestamp, a: nameOf(l.agentIndex), x: clip(l.action, 80) })),
    hasFinal: !!core.finalOutput,
  };
}

// ── Publishing ───────────────────────────────────────────────

async function post(topic: string, body: string, headers: Record<string, string> = {}) {
  const res = await fetch(`${NTFY}/${topic}`, { method: 'POST', body, headers });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

async function publishSnapshot() {
  const { enabled, topic } = useLiveStore.getState();
  if (!enabled) return;
  try {
    const snap = buildSnapshot();
    let body = await encodePayload(snap);
    // Trim drafts, then descriptions, if the compressed body is still too large
    if (body.length > MAX_BODY) {
      snap.tasks.forEach((t) => { t.dr = clip(t.dr, 200) || undefined; t.de = ''; });
      body = await encodePayload(snap);
    }
    if (body.length > MAX_BODY) {
      snap.tasks = snap.tasks.slice(-25);
      body = await encodePayload(snap);
    }
    await post(topic, body);
    useLiveStore.setState({ lastSentAt: Date.now(), lastError: null });
  } catch (e) {
    useLiveStore.setState({ lastError: e instanceof Error ? e.message : String(e) });
  }
}

/** Sends a full text (task output or final delivery) in chunks the viewer reassembles. */
async function publishOutput(id: string, title: string, agent: string, text: string) {
  const { enabled, topic } = useLiveStore.getState();
  if (!enabled || !text) return;
  const parts = Math.ceil(text.length / OUTPUT_CHUNK);
  for (let p = 0; p < parts; p++) {
    const body = await encodePayload({ k: 'out', id, ti: title, a: agent, p, of: parts, x: text.slice(p * OUTPUT_CHUNK, (p + 1) * OUTPUT_CHUNK) });
    try { await post(topic, body); } catch (e) { console.warn('[Live] output chunk failed', e); }
  }
}

/** Push notification to the ntfy app topic and, if configured, Telegram. */
export async function notify(title: string, message: string) {
  const { enabled, topic, telegramToken, telegramChatId } = useLiveStore.getState();
  if (!enabled) return;
  const link = trackingUrl(topic);
  post(`${topic}-bildirim`, message, { Title: encodeURIComponent(title), Click: link, Tags: 'office' })
    .catch((e) => console.warn('[Live] ntfy notify failed', e));
  if (telegramToken && telegramChatId) {
    // Form-encoded POST is a "simple" request: no CORS preflight (Telegram rejects OPTIONS)
    const form = new URLSearchParams({ chat_id: telegramChatId, text: `${title}\n\n${message}\n\n📱 ${link}`, disable_web_page_preview: 'true' });
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, { method: 'POST', body: form })
      .catch((e) => console.warn('[Live] Telegram notify failed', e));
  }
}

// ── Phone → office commands ──────────────────────────────────

let cmdSource: EventSource | null = null;
const handledCmds = new Set<string>();

function listenForCommands() {
  cmdSource?.close();
  cmdSource = null;
  const { enabled, topic } = useLiveStore.getState();
  if (!enabled) return;
  cmdSource = new EventSource(`${NTFY}/${topic}-cmd/sse`);
  cmdSource.onmessage = async (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (!msg.message || handledCmds.has(msg.id)) return;
      handledCmds.add(msg.id);
      const cmd = await decodePayload(msg.message);
      const core = useCoreStore.getState();
      const task = core.tasks.find((t) => t.id === cmd.taskId);
      if (cmd.type === 'approve' && task?.status === 'on_hold') core.approveTask(task.id);
      if (cmd.type === 'reject' && task?.status === 'on_hold' && cmd.text) core.rejectTask(task.id, cmd.text);
      if (cmd.type === 'chat' && cmd.text) chatHandler?.(cmd.text, typeof cmd.agent === 'number' ? cmd.agent : undefined);
    } catch (e) {
      console.warn('[Live] bad command', e);
    }
  };
}

let chatHandler: ((text: string, agent?: number) => void) | null = null;
/** Registered by the simulation: delivers a phone chat message to an agent (lead by default). */
export function setLiveChatHandler(fn: ((text: string, agent?: number) => void) | null) {
  chatHandler = fn;
}

// ── Wiring ───────────────────────────────────────────────────

let timer: ReturnType<typeof setTimeout> | null = null;
let lastPublish = 0;

function schedulePublish() {
  if (!useLiveStore.getState().enabled) return;
  if (timer) clearTimeout(timer);
  const wait = Math.max(PUBLISH_DEBOUNCE_MS, MIN_PUBLISH_INTERVAL_MS - (Date.now() - lastPublish));
  timer = setTimeout(() => {
    lastPublish = Date.now();
    publishSnapshot();
  }, wait);
}

export function startLiveShare() {
  const nameOf = (i: number) => getAllCharacters(getActiveAgentSet()).find((p) => p.index === i)?.name || `Ajan ${i}`;

  useCoreStore.subscribe((s, prev) => {
    const relevant = s.tasks !== prev.tasks || s.phase !== prev.phase || s.userBrief !== prev.userBrief || s.actionLog !== prev.actionLog;
    if (!relevant) return;
    schedulePublish();

    for (const t of s.tasks) {
      const before = prev.tasks.find((p) => p.id === t.id);
      if (t.status === 'on_hold' && before?.status !== 'on_hold') {
        notify('🟣 Onayını bekliyor', `${nameOf(t.assignedAgentId)}: "${t.title}"`);
      }
      if (t.status === 'done' && before?.status !== 'done') {
        publishOutput(t.id, t.title, nameOf(t.assignedAgentId), t.output || '');
      }
    }
    if (s.finalOutput && s.finalOutput !== prev.finalOutput) {
      publishOutput('final', 'Son Teslim', getActiveAgentSet().leadAgent.name, s.finalOutput);
      notify('✅ Proje teslim edildi', clip(s.userBrief, 200) || 'Ekip projeyi bitirdi.');
    }
  });
  useUiStore.subscribe((s, prev) => {
    if (s.agentStatuses !== prev.agentStatuses) schedulePublish();
  });
  useLiveStore.subscribe((s, prev) => {
    if (s.enabled !== prev.enabled || s.topic !== prev.topic) {
      listenForCommands();
      if (s.enabled) publishSnapshot();
    }
  });

  listenForCommands();
  if (useLiveStore.getState().enabled) publishSnapshot();
}

/** Sends a command from the phone viewer to the office. */
export async function sendCommand(topic: string, cmd: { type: 'approve' | 'reject' | 'chat'; taskId?: string; text?: string; agent?: number }) {
  await post(`${topic}-cmd`, await encodePayload(cmd));
}
