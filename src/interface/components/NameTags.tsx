import React from 'react';

/**
 * Always-visible name tags above every mascot, so each agent can be told apart
 * at a glance (also on phones, where there is no hover). Busy agents get a
 * status suffix and a solid pill in their colour.
 */

export interface NameTagAgent {
  index: number;
  name: string;
  color: string;
  status?: string;
}

const STATUS_LABEL: Record<string, string> = {
  working: 'çalışıyor',
  on_hold: 'onay bekliyor',
  talking: 'konuşuyor',
};

export const NameTags: React.FC<{
  agents: NameTagAgent[];
  positions: Record<number, { x: number; y: number }> | undefined;
  hide?: (index: number) => boolean;
  compact?: boolean;
}> = ({ agents, positions, hide, compact }) => (
  <>
    {agents.map((a) => {
      const p = positions?.[a.index];
      if (!p || hide?.(a.index)) return null;
      const busy = a.status ? STATUS_LABEL[a.status] : undefined;
      return (
        <div
          key={a.index}
          className="absolute -translate-x-1/2 pointer-events-none"
          // Anchor sits above the head; nudge the tag down so it rests on top of the mascot
          style={{ left: p.x, top: p.y + (compact ? 6 : 10) }}
        >
          <div
            className={`flex items-center gap-1 rounded-full whitespace-nowrap shadow font-black ${compact ? 'px-1.5 py-[1px] text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}
            style={busy ? { backgroundColor: a.color, color: '#fff' } : { backgroundColor: 'rgba(11,17,34,0.78)', color: '#e7e9f5', border: `1px solid ${a.color}` }}
          >
            {!busy && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />}
            {a.name}{busy ? ` · ${busy}` : ''}
          </div>
        </div>
      );
    })}
  </>
);
