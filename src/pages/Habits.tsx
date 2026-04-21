import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { HabitDefinition } from '../types';
import { Plus, Trash2, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export const Habits: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<HabitDefinition[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '✨', color: '#C9A96E' });
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchHabits();
    fetchStats();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('habit_definitions')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index');
    if (data) setHabits(data);
  };

  const fetchStats = async () => {
    // Generate dummy data for the chart for now
    const last7Days = Array.from({ length: 7 }).map((_, i) => ({
      name: format(subDays(new Date(), 6 - i), 'EEE'),
      completed: Math.floor(Math.random() * 5) + 1
    }));
    setStats(last7Days);
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase
      .from('habit_definitions')
      .insert({
        user_id: user.id,
        name: newHabit.name,
        icon: newHabit.icon,
        color: newHabit.color,
        order_index: habits.length
      })
      .select()
      .single();

    if (error) {
      toast(error.message, 'danger');
    } else {
      setHabits([...habits, data]);
      setIsAdding(false);
      setNewHabit({ name: '', icon: '✨', color: '#C9A96E' });
      toast('Habit created!', 'success');
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habit_definitions').delete().eq('id', id);
    if (error) toast(error.message, 'danger');
    else {
      setHabits(habits.filter(h => h.id !== id));
      toast('Habit deleted', 'success');
    }
  };

  return (
    <div className="habits-page">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title-large">Habits</h1>
        <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Habit
        </button>
      </header>

      {/* Stats Chart */}
      <section className="card" style={{ marginBottom: '40px', height: '300px', padding: '24px' }}>
        <h2 className="title-medium" style={{ marginBottom: '24px' }}>Weekly Completion</h2>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} />
            <Tooltip 
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} 
              itemStyle={{ color: 'var(--accent-gold)' }}
            />
            <Bar dataKey="completed" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {isAdding && (
        <section className="card" style={{ marginBottom: '32px' }}>
          <h2 className="title-medium" style={{ marginBottom: '20px' }}>Add New Habit</h2>
          <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Habit name (e.g. Meditate)" 
              value={newHabit.name}
              onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
              required
              style={{ flex: 2 }}
            />
            <input 
              type="text" 
              placeholder="Icon (emoji)" 
              value={newHabit.icon}
              onChange={(e) => setNewHabit({...newHabit, icon: e.target.value})}
              required
              style={{ flex: 0.5 }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="habits-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {habits.map((habit) => (
          <div key={habit.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '1.5rem', width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {habit.icon}
              </div>
              <div>
                <h3 className="title-medium" style={{ fontSize: '1rem' }}>{habit.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '0.8rem' }}>
                  <Flame size={12} /> Best streak: 12 days
                </div>
              </div>
            </div>
            <button onClick={() => deleteHabit(habit.id)} style={{ color: 'var(--text-secondary)' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {habits.length === 0 && !isAdding && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            No habits yet. Start by adding your first one!
          </p>
        )}
      </section>
    </div>
  );
};
