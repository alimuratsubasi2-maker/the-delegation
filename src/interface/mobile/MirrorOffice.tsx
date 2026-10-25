import React, { useEffect, useRef, useState } from 'react';
import { getAllCharacters } from '../../data/agents';
import { useCoreStore } from '../../integration/store/coreStore';
import { getActiveAgentSet, useTeamStore } from '../../integration/store/teamStore';
import { useUiStore } from '../../integration/store/uiStore';
import { setMirrorMode } from '../../simulation/core/AgentSimulation';
import { SceneManager } from '../../simulation/SceneManager';

/**
 * Live 3D copy of the desktop office for the phone page.
 * Runs the normal scene with thinking disabled; the desktop's snapshot drives the
 * team, tasks and agent statuses, so agents walk to their desks exactly when the
 * real ones start working.
 */

export interface MirrorSnapshot {
  tid?: string;
  phase: 'idle' | 'working' | 'done';
  brief: string;
  agents: { i: number; n: string; c: string; s: string; d: string }[];
  tasks: { id: string; ti: string; s: string; ai?: number }[];
}

const STATUS_LABEL: Record<string, string> = {
  working: 'çalışıyor', on_hold: 'onay bekliyor', talking: 'konuşuyor', moving: 'yürüyor',
};

export function applyMirrorSnapshot(snap: MirrorSnapshot) {
  if (snap.tid && useTeamStore.getState().selectedAgentSetId !== snap.tid) {
    useTeamStore.getState().setActiveTeam(snap.tid);
  }
  useCoreStore.setState({
    phase: snap.phase,
    userBrief: snap.brief,
    tasks: snap.tasks.map((t) => ({
      id: t.id, title: t.ti, description: '', assignedAgentId: t.ai ?? -1, status: t.s as any,
      requiresUserApproval: false, revisions: [], createdAt: 0, updatedAt: 0,
    })),
  });
  useUiStore.setState({ agentStatuses: Object.fromEntries(snap.agents.map((a) => [a.i, a.s as any])) });
}

const supports3D = () => {
  try {
    return !!(navigator as any).gpu || !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};

const MirrorOffice: React.FC<{ snapshot: MirrorSnapshot | null; onUnsupported?: () => void }> = ({ snapshot, onUnsupported }) => {
  const ref = useRef<HTMLDivElement>(null);
  const positions = useUiStore((s) => s.npcScreenPositions);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setMirrorMode(true);
    if (!ref.current) return;
    if (!supports3D()) {
      setFailed(true);
      onUnsupported?.();
      return;
    }
    let manager: SceneManager | null = null;
    try {
      manager = new SceneManager(ref.current);
    } catch (e) {
      console.error('[Mirror] 3D could not start', e);
      setFailed(true);
    }
    return () => manager?.dispose();
  }, []);

  useEffect(() => {
    if (snapshot) applyMirrorSnapshot(snapshot);
  }, [snapshot]);

  if (failed) {
    return (
      <div className="p-5 m-4 rounded-2xl bg-[#121a2f] border border-[#222c47] text-sm text-[#b4bace] leading-relaxed">
        Bu tarayıcı 3D ofisi gösteremiyor. <b>Google Chrome</b>'u güncelleyip linki Chrome'da açarsan ofis görünür. Görevler ve onaylar <b>Durum</b> sekmesinde çalışmaya devam eder.
      </div>
    );
  }

  const people = getAllCharacters(getActiveAgentSet());
  const busy = snapshot?.agents.filter((a) => STATUS_LABEL[a.s]) ?? [];

  return (
    <div className="relative w-full h-full">
      <div ref={ref} className="absolute inset-0" />
      {/* Name tags above agents that are doing something */}
      {busy.map((a) => {
        const p = positions?.[a.i];
        if (!p) return null;
        return (
          <div key={a.i} className="absolute -translate-x-1/2 -translate-y-full pointer-events-none" style={{ left: p.x, top: p.y }}>
            <div className="px-2 py-0.5 rounded-full text-[10px] font-black text-white whitespace-nowrap shadow" style={{ backgroundColor: a.c }}>
              {a.n} · {STATUS_LABEL[a.s]}
            </div>
          </div>
        );
      })}
      {!snapshot && (
        <div className="absolute inset-x-4 bottom-4 p-3 rounded-2xl bg-[#121a2f]/90 text-xs text-[#b4bace]">
          Bilgisayardaki ofisten veri bekleniyor… ({people.length} ajan)
        </div>
      )}
    </div>
  );
};

export default MirrorOffice;
