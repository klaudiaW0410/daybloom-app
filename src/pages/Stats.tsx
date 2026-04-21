import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export const Stats: React.FC = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [totals, setTotals] = useState({ journal: 0, photos: 0 });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    // Fetch mood history for last 30 days
    const end = new Date();
    const start = subDays(end, 29);
    
    const { data: moods } = await supabase
      .from('mood_entries')
      .select('date, mood')
      .eq('user_id', user.id)
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'));

    const { count: journalCount } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: photoCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setTotals({ journal: journalCount || 0, photos: photoCount || 0 });

    const allDays = eachDayOfInterval({ start, end });
    const chartData = allDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const match = moods?.find(m => m.date === dateStr);
      return {
        date: format(day, 'MMM d'),
        mood: match ? match.mood : null
      };
    });

    setMoodHistory(chartData);
  };

  return (
    <div className="stats-page">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="title-large">Statistics</h1>
        <p className="text-secondary">Your growth and consistency at a glance</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Total Journal Entries" value={totals.journal} />
        <StatCard label="Photos Captured" value={totals.photos} />
        <StatCard label="Current Streak" value="12 Days" />
        <StatCard label="Avg. Mood" value="4.2" />
      </div>

      <section className="card" style={{ marginBottom: '40px', height: '400px', padding: '24px' }}>
        <h2 className="title-medium" style={{ marginBottom: '32px' }}>Mood Analytics (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={moodHistory}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[1, 5]} hide />
            <Tooltip 
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
              itemStyle={{ color: 'var(--accent-gold)' }}
            />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="var(--accent-gold)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMood)" 
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <section className="card">
          <h2 className="title-medium" style={{ marginBottom: '24px' }}>Habit Heatmap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Simple heatmap mock */}
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  aspectRatio: '1/1', 
                  backgroundColor: Math.random() > 0.3 ? 'var(--accent-gold)' : 'var(--surface-elevated)', 
                  opacity: Math.random(),
                  borderRadius: '2px' 
                }} 
              />
            ))}
          </div>
          <p className="text-small" style={{ marginTop: '16px', textAlign: 'center' }}>Weekly consistency (mockup)</p>
        </section>

        <section className="card">
          <h2 className="title-medium" style={{ marginBottom: '24px' }}>Top Habits</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Morning Run', 'Meditation', 'Reading'].map((h, i) => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-primary">{h}</span>
                <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--surface-elevated)', margin: '0 16px', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${90 - i * 15}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
                </div>
                <span className="text-small">{90 - i * 15}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <span className="text-small" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{value}</span>
  </div>
);
