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
  if (phase === 'done') return { canChat: false, reason: 'Proje tamamlandı' }

  const isLead = agentIndex === system.leadAgent.index
  // The Obsidian brain answers questions about past projects at any time it is not busy
  const isBrain = !!getAllAgents(system).find((a) => a.index === agentIndex)?.id.startsWith('obsidian')

  // 1. Idle Phase: Only Lead Agent can chat (to set the brief)
  if (phase === 'idle') {
    return isLead || isBrain ? { canChat: true, reason: '' } : { canChat: false, reason: 'Proje özeti bekleniyor' }
  }

  // 2. Working Phase: Lead Agent can always talk. Others only when idle.
  if (isLead || agentStatus === 'idle') {
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
