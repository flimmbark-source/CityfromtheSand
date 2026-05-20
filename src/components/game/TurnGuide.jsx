import React from 'react';

// §4 Turn steps — displayed as a horizontal strip so the active player always
// knows where they are and what they can still do this turn.
export default function TurnGuide({
  player,
  buildsRemaining,
  refreshesRemaining,
  availableEngineCount,
  isGameOver,
}) {
  const tilesWaiting = player.tilesToPlace.length;
  const refreshTotal = player.stats.refresh;
  const buildTotal = player.stats.build;
  const enginesTotal = player.engineZone.length;

  const steps = [
    {
      num: '①',
      label: 'Draw Hand',
      // Always done — hand is drawn automatically at turn start
      status: 'done',
      detail: `${player.hand.length} cards`,
    },
    {
      num: '②',
      label: 'Free Refresh',
      // §4 step 2: refresh happens BEFORE buying
      status: refreshTotal === 0
        ? 'na'
        : refreshesRemaining > 0
          ? 'available'
          : 'done',
      detail: refreshTotal === 0
        ? 'N/A'
        : `${refreshTotal - refreshesRemaining}/${refreshTotal} used`,
      note: refreshesRemaining > 0 ? 'Do before buying!' : null,
    },
    {
      num: '③',
      label: 'Buy / Build',
      status: buildsRemaining > 0 ? 'available' : 'done',
      detail: `${buildTotal - buildsRemaining}/${buildTotal} used`,
    },
    {
      num: '④',
      label: 'Place Tiles',
      status: tilesWaiting > 0 ? 'pending' : 'done',
      detail: tilesWaiting > 0 ? `${tilesWaiting} in queue` : '—',
    },
    {
      num: '⑤',
      label: 'Engine Abilities',
      status: enginesTotal === 0
        ? 'na'
        : availableEngineCount > 0
          ? 'available'
          : 'done',
      detail: enginesTotal === 0
        ? 'none'
        : `${availableEngineCount}/${enginesTotal} ready`,
    },
  ];

  if (isGameOver) return null;

  return (
    <div className="turn-guide">
      {steps.map((s) => (
        <div key={s.num} className={`tg-step tg-step--${s.status}`}>
          <span className="tg-num">{s.num}</span>
          <span className="tg-label">{s.label}</span>
          <span className="tg-detail">{s.detail}</span>
          {s.note && <span className="tg-note">{s.note}</span>}
        </div>
      ))}
    </div>
  );
}
