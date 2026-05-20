import React, { useEffect, useRef } from 'react';

export default function ActionLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  return (
    <div className="action-log">
      <div className="action-log-title">Action Log</div>
      <div className="action-log-entries">
        {log.map((entry, i) => (
          <div key={i} className="log-entry">
            {entry}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
