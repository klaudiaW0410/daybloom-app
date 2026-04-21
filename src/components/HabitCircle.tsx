import React from 'react';
import { Flame } from 'lucide-react';

interface HabitCircleProps {
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
  onClick: () => void;
}

export const HabitCircle: React.FC<HabitCircleProps> = ({ name, icon, completed, streak, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        backgroundColor: completed ? 'var(--accent-gold)' : 'var(--surface-card)',
        border: `1px solid ${completed ? 'var(--accent-gold)' : 'var(--border-color)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: completed ? '0 0 15px rgba(201, 169, 110, 0.3)' : 'none',
        transition: 'all 0.2s ease'
      }}>
        <span style={{ filter: completed ? 'none' : 'grayscale(100%)' }}>{icon}</span>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <p className="text-small" style={{ fontWeight: '600', color: completed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
          <Flame size={12} color={streak > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
          <span style={{ fontSize: '10px', fontWeight: '700', color: streak > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
            {streak}
          </span>
        </div>
      </div>
    </div>
  );
};
