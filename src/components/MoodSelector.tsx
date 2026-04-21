import React from 'react';

interface MoodSelectorProps {
  selectedMood: number | null;
  onSelect: (mood: 1 | 2 | 3 | 4 | 5) => void;
}

const moods = [
  { val: 1, emoji: '😢', label: 'Awful' },
  { val: 2, emoji: '😕', label: 'Bad' },
  { val: 3, emoji: '😐', label: 'Okay' },
  { val: 4, emoji: '🙂', label: 'Good' },
  { val: 5, emoji: '🤩', label: 'Great' }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 className="title-medium" style={{ marginBottom: '20px' }}>How's your mood?</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        {moods.map((m) => (
          <button
            key={m.val}
            onClick={() => onSelect(m.val as any)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 4px',
              borderRadius: '12px',
              backgroundColor: selectedMood === m.val ? 'var(--accent-soft)' : 'transparent',
              border: `1px solid ${selectedMood === m.val ? 'var(--accent-gold)' : 'transparent'}`,
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.75rem' }}>{m.emoji}</span>
            <span style={{ fontSize: '0.7rem', color: selectedMood === m.val ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
