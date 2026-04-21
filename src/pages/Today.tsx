import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { MoodEntry, JournalEntry, HabitWithStats } from '../types';
import { format } from 'date-fns';
import { Utensils, Dumbbell, BookOpen, Moon, Target } from 'lucide-react';

import { MoodSelector } from '../components/MoodSelector';
import { HabitCircle } from '../components/HabitCircle';
import { QuickLogCard } from '../components/QuickLogCard';
import { PhotoUpload } from '../components/PhotoUpload';

export const Today: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [mood, setMood] = useState<MoodEntry | null>(null);
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch mood
    const { data: moodData } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if (moodData) setMood(moodData);

    // Fetch habits
    const { data: habitDefs } = await supabase
      .from('habit_definitions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('order_index');

    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);

    const habitStats = habitDefs?.map(h => ({
      ...h,
      completedToday: logs?.some(l => l.habit_id === h.id && l.completed) || false,
      streak: 0 // In a real app, calculate this from historical logs
    })) || [];
    setHabits(habitStats);

    // Fetch journal
    const { data: journalData } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if (journalData) setJournal(journalData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleMoodSelect = async (m: 1|2|3|4|5) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .upsert({ user_id: user?.id, mood: m, date: today }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (data) setMood(data);
    if (error) toast(error.message, 'danger');
  };

  const toggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newState = !habit.completedToday;
    const { error } = await supabase
      .from('habit_logs')
      .upsert({ user_id: user?.id, habit_id: habitId, date: today, completed: newState }, { onConflict: 'user_id,habit_id,date' });

    if (!error) {
      setHabits(habits.map(h => h.id === habitId ? { ...h, completedToday: newState } : h));
      if (newState) toast('Habit completed! 🔥', 'success');
    } else {
      toast(error.message, 'danger');
    }
  };

  const updateJournalField = async (field: keyof JournalEntry, value: string) => {
    const { error } = await supabase
      .from('journal_entries')
      .upsert({ user_id: user?.id, date: today, [field]: value }, { onConflict: 'user_id,date' });
    
    if (!error) {
      setJournal(prev => prev ? { ...prev, [field]: value } : { [field]: value } as unknown as JournalEntry);
    }
  };

  if (loading) return <div className="loading-screen">Loading Today...</div>;

  return (
    <div className="today-page">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="title-large">Good morning, {profile?.display_name || 'Friend'} 🌤</h1>
        <p className="text-secondary">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </header>

      {/* Morning Widget */}
      <div style={{ marginBottom: '40px' }}>
        <MoodSelector selectedMood={mood?.mood || null} onSelect={handleMoodSelect} />
        
        <div className="card" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Target size={20} color="var(--accent-gold)" />
            <h3 className="title-medium" style={{ fontSize: '1rem' }}>Daily Affirmation</h3>
          </div>
          <input 
            type="text" 
            placeholder="I am capable of achieving my goals..." 
            value={journal?.affirmations || ''}
            onChange={(e) => updateJournalField('affirmations', e.target.value)}
            style={{ width: '100%', background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--accent-gold)' }}
          />
        </div>
      </div>

      {/* Habits Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="title-medium">Today's Habits</h2>
          <button onClick={() => toast('Go to Habits page to manage', 'info')} className="text-small" style={{ color: 'var(--accent-gold)' }}>+ Manage</button>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '20px',
          padding: '4px'
        }}>
          {habits.length > 0 ? habits.map((habit) => (
            <HabitCircle 
              key={habit.id}
              name={habit.name}
              icon={habit.icon}
              completed={habit.completedToday}
              streak={habit.streak}
              onClick={() => toggleHabit(habit.id)}
            />
          )) : (
            <p className="text-small" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>
              No active habits. Add some in the Habits tab!
            </p>
          )}
        </div>
      </section>

      {/* Quick Logs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <QuickLogCard 
          icon={<Utensils size={20} />} 
          title="Food Log" 
          value={journal?.food_log || ''} 
          onSave={(val) => updateJournalField('food_log', val)} 
        />
        <QuickLogCard 
          icon={<Dumbbell size={20} />} 
          title="Workout" 
          value={journal?.workout_log || ''} 
          onSave={(val) => updateJournalField('workout_log', val)} 
        />
        <QuickLogCard 
          icon={<BookOpen size={20} />} 
          title="Reflections" 
          value={journal?.reflections || ''} 
          onSave={(val) => updateJournalField('reflections', val)} 
        />
        <QuickLogCard 
          icon={<Moon size={20} />} 
          title="Tomorrow's Plan" 
          value={journal?.tomorrow_plan || ''} 
          onSave={(val) => updateJournalField('tomorrow_plan', val)} 
        />
      </div>

      <PhotoUpload userId={user?.id || ''} date={today} />
    </div>
  );
};
