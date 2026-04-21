import React, { useState, useEffect } from 'react';

interface QuickLogCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onSave: (val: string) => void;
}

export const QuickLogCard: React.FC<QuickLogCardProps> = ({ icon, title, value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== value) {
      onSave(text);
    }
  };

  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
        <h3 className="title-medium" style={{ fontSize: '1rem' }}>{title}</h3>
      </div>
      
      <div 
        onClick={() => setIsEditing(true)}
        style={{ 
          minHeight: '60px', 
          cursor: 'text',
          fontSize: '0.9rem',
          color: text ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}
      >
        {isEditing ? (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            style={{ 
              width: '100%', 
              height: '100px', 
              background: 'var(--surface-elevated)',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              resize: 'none'
            }}
            placeholder={`Log your ${title.toLowerCase()}...`}
          />
        ) : (
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {text || `Tap to log your ${title.toLowerCase()}...`}
          </p>
        )}
      </div>
    </div>
  );
};
