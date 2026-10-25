import { create } from 'zustand';
import { getAllCharacters } from '../../data/agents';
import { useCoreStore } from '../../integration/store/coreStore';
import { getActiveAgentSet } from '../../integration/store/teamStore';

/**
 * Keeps every delivered project in this browser so "Start New Project" never
 * loses past work. Newest first, capped to stay well inside localStorage limits.
 */

const STORAGE_KEY = 'nova-arsiv';
const MAX_ENTRIES = 30;
const MAX_TEXT = 60000;

export interface ArchivedProject {
  id: string;
  date: number;
  team: string;
  color: string;
  brief: string;
  final: string;
  cost: number;
  tasks: { title: string; agent: string; output: string }[];
}

interface ArchiveState {
  items: ArchivedProject[];
  remove: (id: string) => void;
}

const load = (): ArchivedProject[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const persist = (items: ArchivedProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota hit: drop the oldest half and try once more
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, Math.ceil(items.length / 2)))); } catch { /* give up */ }
  }
};

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  items: load(),
  remove: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    persist(items);
  },
}));

export function archiveToMarkdown(p: ArchivedProject): string {
  const tasks = p.tasks.map((t) => `## ${t.title}\n*${t.agent}*\n\n${t.output}`).join('\n\n');
  return `# ${p.team} — ${new Date(p.date).toLocaleString('tr-TR')}\n\n**Proje özeti:** ${p.brief}\n\n# Son teslim\n\n${p.final}\n\n# Ekip çıktıları\n\n${tasks}\n`;
}

function archiveCurrentProject() {
  const core = useCoreStore.getState();
  if (!core.finalOutput) return;
  const team = getActiveAgentSet();
  const people = getAllCharacters(team);
  const nameOf = (i: number) => people.find((p) => p.index === i)?.name || `Ajan ${i}`;
  const entry: ArchivedProject = {
    id: `p-${Date.now()}`,
    date: Date.now(),
    team: team.teamName,
    color: team.color,
    brief: core.userBrief,
    final: core.finalOutput.slice(0, MAX_TEXT),
    cost: core.totalEstimatedCost,
    tasks: core.tasks
      .filter((t) => t.status === 'done' && t.output)
      .map((t) => ({ title: t.title, agent: nameOf(t.assignedAgentId), output: (t.output || '').slice(0, MAX_TEXT / 4) })),
  };
  const items = [entry, ...useArchiveStore.getState().items].slice(0, MAX_ENTRIES);
  useArchiveStore.setState({ items });
  persist(items);
}

useCoreStore.subscribe((s, prev) => {
  if (s.finalOutput && s.finalOutput !== prev.finalOutput) archiveCurrentProject();
});
