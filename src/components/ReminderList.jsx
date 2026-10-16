import React, { useState } from 'react';
import ReminderItem from './ReminderItem';
import { CalendarCheck2, PlusCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ReminderList({
  reminders,
  selectedDate,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenNewReminder
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Ordena lembretes: os que têm horário primeiro, por ordem cronológica, e concluidos por último se desejado
  const sortedReminders = [...reminders].sort((a, b) => {
    if (!a.time && b.time) return 1;
    if (a.time && !b.time) return -1;
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  const filteredReminders = sortedReminders.filter((rem) => {
    if (filter === 'pending') return !rem.completed;
    if (filter === 'completed') return rem.completed;
    return true;
  });

  const pendingCount = reminders.filter((r) => !r.completed).length;
  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <section className="reminder-list-section">
      <div className="list-controls-bar">
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({reminders.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Concluídas ({completedCount})
          </button>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <CalendarCheck2 size={48} className="empty-icon" />
          </div>
          <h2 className="empty-title">Nenhum lembrete para este dia</h2>
          <p className="empty-subtitle">
            Você está livre ou ainda não registrou suas tarefas. Comece adicionando um novo lembrete!
          </p>
          <button
            type="button"
            className="btn btn-primary empty-btn"
            onClick={onOpenNewReminder}
          >
            <PlusCircle size={18} />
            <span>Adicionar Lembrete</span>
          </button>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="empty-state empty-filter">
          <p className="empty-subtitle">
            {filter === 'pending'
              ? '🎉 Parabéns! Todas as tarefas deste dia foram concluídas.'
              : 'Nenhuma tarefa concluída ainda neste dia.'}
          </p>
        </div>
      ) : (
        <div className="reminders-grid">
          {filteredReminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
