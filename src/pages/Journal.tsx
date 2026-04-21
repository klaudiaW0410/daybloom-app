import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { JournalEntry, MoodEntry } from '../types';

export const Journal: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    food_log: '',
    workout_log: '',
    affirmations: '',
    reflections: '',
    tomorrow_plan: '',
    future_goals: ''
  });
  const [mood, setMood] = useState<MoodEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formattedDate = date ? format(parseISO(date), 'EEEE, d MMMM yyyy') : '';

  useEffect(() => {
    fetchEntry();
  }, [date, user]);

  const fetchEntry = async () => {
    if (!user || !date) return;
    
    const { data: journalData } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();
    
    if (journalData) {
      setEntry(journalData);
    } else {
      setEntry({
        food_log: '',
        workout_log: '',
        affirmations: '',
        reflections: '',
        tomorrow_plan: '',
        future_goals: ''
      });
    }

    const { data: moodData } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();
    if (moodData) setMood(moodData);
  };

  const handleFieldChange = (field: keyof JournalEntry, value: string) => {
    setEntry(prev => ({ ...prev, [field]: value }));
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveEntry({ ...entry, [field]: value });
    }, 1500);
  };

  const saveEntry = async (updatedEntry: Partial<JournalEntry>) => {
    if (!user || !date) return;
    setSaving(true);
    const { error } = await supabase
      .from('journal_entries')
      .upsert({ 
        user_id: user.id, 
        date, 
        ...updatedEntry 
      }, { onConflict: 'user_id,date' });

    if (error) {
      toast(error.message, 'danger');
    } else {
      setLastSaved(new Date());
    }
    setSaving(false);
  };

  const moodIcons: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '🤩' };

  return (
    <div className="journal-page">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="title-large">{formattedDate}</h1>
          {mood && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>{moodIcons[mood.mood]}</span>
              <span className="text-secondary">Mood log tracked</span>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {saving ? (
            <span className="text-small" style={{ color: 'var(--accent-gold)' }}>Saving...</span>
          ) : lastSaved ? (
            <span className="text-small" style={{ color: 'var(--success)' }}>Saved ✓</span>
          ) : null}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <JournalField 
          label="Morning Affirmations" 
          value={entry.affirmations || ''} 
          onChange={(val) => handleFieldChange('affirmations', val)} 
          placeholder="What are you affirming today?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <JournalField 
            label="Food Log" 
            value={entry.food_log || ''} 
            onChange={(val) => handleFieldChange('food_log', val)} 
            placeholder="What did you eat today?"
            multiline
          />
          <JournalField 
            label="Workout & Movement" 
            value={entry.workout_log || ''} 
            onChange={(val) => handleFieldChange('workout_log', val)} 
            placeholder="List your exercises..."
            multiline
          />
        </div>
        <JournalField 
          label="Evening Reflections" 
          value={entry.reflections || ''} 
          onChange={(val) => handleFieldChange('reflections', val)} 
          placeholder="How was your day? What did you learn?"
          multiline
          large
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <JournalField 
            label="Plan for Tomorrow" 
            value={entry.tomorrow_plan || ''} 
            onChange={(val) => handleFieldChange('tomorrow_plan', val)} 
            placeholder="Top priorities for tomorrow..."
            multiline
          />
          <JournalField 
            label="Future Goals" 
            value={entry.future_goals || ''} 
            onChange={(val) => handleFieldChange('future_goals', val)} 
            placeholder="Long-term vision vision check..."
            multiline
          />
        </div>
      </div>
    </div>
  );
};

interface JournalFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  large?: boolean;
}

const JournalField: React.FC<JournalFieldProps> = ({ label, value, onChange, placeholder, multiline, large }) => {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 className="title-medium" style={{ marginBottom: '16px', color: 'var(--accent-gold)' }}>{label}</h3>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            width: '100%', 
            minHeight: large ? '200px' : '120px', 
            background: 'var(--surface-elevated)', 
            border: 'none',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            width: '100%', 
            background: 'var(--surface-elevated)', 
            border: 'none',
            fontSize: '1rem'
          }}
        />
      )}
    </div>
  );
};
