import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayData, setDayData] = useState<Record<string, any>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMonthData();
  }, [currentMonth]);

  const fetchMonthData = async () => {
    if (!user) return;
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    // Fetch moods
    const { data: moods } = await supabase
      .from('mood_entries')
      .select('date, mood')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end);

    // Fetch habit logs
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('date, completed')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('date', start)
      .lte('date', end);

    // Fetch photos
    const { data: photos } = await supabase
      .from('photos')
      .select('date, storage_path')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end);

    const data: Record<string, any> = {};
    moods?.forEach(m => {
      if (!data[m.date]) data[m.date] = {};
      data[m.date].mood = m.mood;
    });
    logs?.forEach(l => {
      if (!data[l.date]) data[l.date] = {};
      data[l.date].habitsCount = (data[l.date].habitsCount || 0) + 1;
    });
    photos?.forEach(p => {
      if (!data[p.date]) data[p.date] = {};
      data[p.date].photo = p.storage_path;
    });

    setDayData(data);
  };

  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <h1 className="title-large">{format(currentMonth, 'MMMM yyyy')}</h1>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-secondary" style={{ padding: '8px' }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-secondary" style={{ padding: '8px' }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
        {days.map(d => (
          <div key={d} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const moodIcons: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '🤩' };

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        {calendarDays.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const data = dayData[dateStr];
          const isCurrentMonth = isSameMonth(d, monthStart);
          const isToday = isSameDay(d, new Date());

          return (
            <div 
              key={dateStr}
              onClick={() => navigate(`/journal/${dateStr}`)}
              style={{
                height: '120px',
                padding: '8px',
                backgroundColor: isCurrentMonth ? 'var(--surface-card)' : 'transparent',
                border: '1px solid var(--border-color)',
                opacity: isCurrentMonth ? 1 : 0.3,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: isToday ? '700' : '400',
                color: isToday ? 'var(--accent-gold)' : 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {format(d, 'd')}
              </span>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                {data?.mood && <span style={{ fontSize: '1.2rem' }}>{moodIcons[data.mood]}</span>}
                {data?.habitsCount > 0 && (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: Math.min(data.habitsCount, 4) }).map((_, i) => (
                      <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }} />
                    ))}
                  </div>
                )}
              </div>

              {data?.photo && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '4px', 
                  right: '4px', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '4px', 
                  background: `url(${supabase.storage.from('photos').getPublicUrl(data.photo).data.publicUrl})`,
                  backgroundSize: 'cover'
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-page">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
