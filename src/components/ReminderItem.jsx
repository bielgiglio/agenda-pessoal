import React from 'react';
import { Clock, Check, Trash2, Edit3, Repeat } from 'lucide-react';
import { IMPORTANCE_LEVELS } from '../utils/storage';
import { DIAS_DA_SEMANA, formatDiasSemanaResumo } from '../utils/dateUtils';

export default function ReminderItem({
  reminder,
  onToggleComplete,
  onEdit,
  onDelete
}) {
  const prioridadeKey = reminder.prioridade || reminder.importance || 'baixa';
  const importanceInfo = IMPORTANCE_LEVELS[prioridadeKey] || IMPORTANCE_LEVELS.baixa;
  const isRecorrente = Boolean(reminder.recorrente);

  const diasArray = Array.isArray(reminder.dias_semana) && reminder.dias_semana.length > 0
    ? reminder.dias_semana
    : reminder.dia_semana !== null && reminder.dia_semana !== undefined
    ? [Number(reminder.dia_semana)]
    : [];

  const diasLabel = isRecorrente ? formatDiasSemanaResumo(diasArray) : '';

  return (
    <div className={`reminder-card ${reminder.completed ? 'is-completed' : ''} priority-${prioridadeKey}`}>
      <div className="card-priority-stripe" style={{ backgroundColor: importanceInfo.colorHex }} />

      {/* Checkbox redonda customizada */}
      <button
        type="button"
        className={`checkbox-btn ${reminder.completed ? 'checked' : ''}`}
        onClick={() => onToggleComplete(reminder.id)}
        aria-label={reminder.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
      >
        {reminder.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Conteúdo principal */}
      <div className="reminder-body">
        <div className="reminder-header-row">
          <div className="reminder-meta">
            {reminder.time && (
              <span className="reminder-time">
                <Clock size={13} className="time-icon" />
                {reminder.time}
              </span>
            )}
            <span className={`importance-tag ${importanceInfo.badgeClass}`}>
              <span className="importance-dot" style={{ backgroundColor: importanceInfo.colorHex }} />
              {importanceInfo.label}
            </span>
            {isRecorrente && (
              <span
                className="recurrent-tag"
                title={`Evento fixo: ${diasLabel}`}
              >
                <Repeat size={12} className="recurrent-icon" />
                <span>{diasLabel || 'Semanal'}</span>
              </span>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="reminder-actions">
            <button
              type="button"
              className="action-icon-btn edit-btn"
              onClick={() => onEdit(reminder)}
              title="Editar lembrete"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn delete-btn"
              onClick={() => onDelete(reminder.id)}
              title="Excluir lembrete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <h3 className="reminder-title">
          {isRecorrente && (
            <Repeat
              size={15}
              className="title-repeat-icon"
              title={`Evento fixo: ${diasLabel}`}
            />
          )}
          <span>{reminder.title}</span>
        </h3>

        {reminder.description && (
          <p className="reminder-desc">{reminder.description}</p>
        )}
      </div>
    </div>
  );
}

