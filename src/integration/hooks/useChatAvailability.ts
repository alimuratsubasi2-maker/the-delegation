import { useCoreStore } from '../store/coreStore'
import { useActiveTeam } from '../store/teamStore'
import { useUiStore } from '../store/uiStore'
import { getAllAgents } from '../../data/agents'

export interface ChatAvailability {
  canChat: boolean
  reason: string
}

/**
 * Derives whether the player can chat with a given agent based on
 * the current project phase and the agent's task state.
 */
export function useChatAvailability(agentIndex: number | null): ChatAvailability {
  const { phase, tasks, isGeneratingAsset } = useCoreStore()
  const agentStatus = useUiStore((s) => (agentIndex !== null ? s.agentStatuses[agentIndex] : 'idle'))
  const system = useActiveTeam()

  if (agentIndex === null) return { canChat: false, reason: '' }
  if (isGeneratingAsset) return { canChat: false, reason: 'Teslim ediliyor...' }

  const isLead = agentIndex === system.leadAgent.index
  // The Obsidian brain answers questions about past projects at any time it is not busy
  const isBrain = !!getAllAgents(system).find((a) => a.index === agentIndex)?.id.startsWith('obsidian')

  // Before a project starts and after delivery, every agent can be talked to one-on-one
  if (phase === 'idle' || phase === 'done') return { canChat: true, reason: '' }

  // Working phase: lead and brain always; others whenever they are not busy with a task
  if (isLead || isBrain || agentStatus === 'idle' || !agentStatus) {
    return { canChat: true, reason: '' }
  }

  // Provide specific reason for busy agents
  if (agentStatus === 'on_hold') return { canChat: false, reason: 'Onayını bekliyor...' }

  const activeTask = tasks.find((t) => t.assignedAgentId === agentIndex && t.status === 'in_progress')
  return { 
    canChat: false, 
    reason: activeTask ? `Çalışıyor: "${activeTask.title}"` : 'Ajan meşgul' 
  }
}
