import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Todo } from '../types';
import { Plus, Check, Square, GripVertical, Trash2 } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const Goals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setTodos(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title: newTodo,
        priority,
        completed: false
      })
      .select()
      .single();

    if (error) toast(error.message, 'danger');
    else {
      setTodos([data, ...todos]);
      setNewTodo('');
      toast('Task added', 'success');
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id);
    
    if (error) toast(error.message, 'danger');
    else {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) toast(error.message, 'danger');
    else {
      setTodos(todos.filter(t => t.id !== id));
      toast('Task deleted', 'info');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="goals-page">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="title-large">Vision & Goals</h1>
        <p className="text-secondary">Track your milestones and daily tasks</p>
      </header>

      <section className="card" style={{ marginBottom: '32px' }}>
        <h2 className="title-medium" style={{ marginBottom: '20px' }}>Long-term Vision</h2>
        <textarea 
          placeholder="Where do you see yourself in 1, 5, 10 years? Write it down..."
          style={{ width: '100%', minHeight: '150px', background: 'var(--surface-elevated)', border: 'none' }}
        />
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="title-medium">Tasks</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'active', 'completed'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                style={{ 
                  fontSize: '0.8rem', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: filter === f ? 'var(--accent-gold)' : 'var(--surface-card)',
                  color: filter === f ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={addTodo} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            style={{ flex: 1 }}
          />
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            style={{ 
              background: 'var(--surface-card)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0 12px'
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>
            <Plus size={20} />
          </button>
        </form>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTodos.map((todo) => (
                <SortableTodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={() => toggleTodo(todo.id, todo.completed)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  );
};

const SortableTodoItem: React.FC<{ todo: Todo, onToggle: () => void, onDelete: () => void }> = ({ todo, onToggle, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = {
    low: '#888',
    medium: 'var(--accent-gold)',
    high: 'var(--danger)'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        opacity: todo.completed ? 0.6 : 1
      }}
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-secondary)' }}>
        <GripVertical size={18} />
      </div>
      <button onClick={onToggle} style={{ color: todo.completed ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
        {todo.completed ? <Check size={20} /> : <Square size={20} />}
      </button>
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.95rem', 
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
        }}>
          {todo.title}
        </p>
        <span style={{ 
          fontSize: '0.7rem', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          color: priorityColor[todo.priority] 
        }}>
          {todo.priority}
        </span>
      </div>
      <button onClick={onDelete} style={{ color: 'var(--text-secondary)' }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
};
