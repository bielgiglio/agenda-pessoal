import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Clock,
  Repeat
} from 'lucide-react';
import {
  MESES,
  DIAS_DA_SEMANA_ABREV,
  formatToDateInput,
  isToday,
  formatDateExtended,
  getDayOfWeekFromDate,
  projectEventForDate,
  isEventMatchingDate
} from '../utils/dateUtils';
import { IMPORTANCE_LEVELS } from '../utils/storage';

export default function FullCalendar({
  reminders,
  selectedDate,
  onSelectDateAndGoToDay,
  onOpenNewReminderForDate
}) {
  // Inicializa o mês/ano com base no selectedDate
  const [currentYear, setCurrentYear] = useState(() => {
    const d = new Date(selectedDate ? `${selectedDate}T12:00:00` : new Date());
    return d.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate ? `${selectedDate}T12:00:00` : new Date());
    return d.getMonth();
  });

  // Mês anterior
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Próximo mês
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Cálculo da grade do mês
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Dias do mês anterior para preencher a primeira semana
  const prevMonthDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: formatToDateInput(new Date(currentYear, currentMonth - 1, daysInPrevMonth - i))
    });
  }

  // Dias do mês atual
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      isCurrentMonth: true,
      dateStr: formatToDateInput(new Date(currentYear, currentMonth, i))
    });
  }

  // Dias do próximo mês para completar a grade (42 células = 6 semanas)
  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = [];
  const cellsNeeded = totalCellsSoFar > 35 ? 42 : 35;
  for (let i = 1; i <= cellsNeeded - totalCellsSoFar; i++) {
    nextMonthDays.push({
      day: i,
      isCurrentMonth: false,
      dateStr: formatToDateInput(new Date(currentYear, currentMonth + 1, i))
    });
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Agrupamento de lembretes por data (projetando eventos recorrentes em todas as semanas correspondentes)
  const remindersByDate = {};
  allCalendarDays.forEach((cell) => {
    remindersByDate[cell.dateStr] = [];
  });
  if (selectedDate && !remindersByDate[selectedDate]) {
    remindersByDate[selectedDate] = [];
  }

  Object.keys(remindersByDate).forEach((dateStr) => {
    const dayEvents = reminders
      .filter((rem) => isEventMatchingDate(rem, dateStr))
      .map((rem) => projectEventForDate(rem, dateStr))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    remindersByDate[dateStr] = dayEvents;
  });

  // Lembretes do dia selecionado para prévia
  const selectedDayReminders = remindersByDate[selectedDate] || [];

  return (
    <div className="full-calendar-wrapper">
      {/* Barra superior de navegação do calendário */}
      <div className="calendar-controls">
        <div className="calendar-month-heading">
          <h2>
            {MESES[currentMonth]} <span className="year-text">{currentYear}</span>
          </h2>
        </div>

        <div className="calendar-nav-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleGoToCurrentMonth}
          >
            Mês Atual
          </button>
          <div className="arrow-btn-group">
            <button
              type="button"
              className="nav-arrow"
              onClick={handlePrevMonth}
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="nav-arrow"
              onClick={handleNextMonth}
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Dias */}
      <div className="calendar-grid-card">
        {/* Cabeçalho dos dias da semana */}
        <div className="calendar-weekdays-row">
          {DIAS_DA_SEMANA_ABREV.map((dia, idx) => (
            <div key={idx} className="weekday-header-cell">
              {dia}
            </div>
          ))}
        </div>

        {/* Células de dias */}
        <div className="calendar-days-grid">
          {allCalendarDays.map((cell, idx) => {
            const cellReminders = remindersByDate[cell.dateStr] || [];
            const isTodayCell = isToday(cell.dateStr);
            const isSelectedCell = cell.dateStr === selectedDate;

            return (
              <div
                key={idx}
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${
                  isTodayCell ? 'is-today' : ''
                } ${isSelectedCell ? 'is-selected' : ''}`}
                onClick={() => onSelectDateAndGoToDay(cell.dateStr, false)}
                onDoubleClick={() => onSelectDateAndGoToDay(cell.dateStr, true)}
                title={`Clique para selecionar, clique duplo para abrir o dia (${cell.dateStr})`}
              >
                <div className="cell-top">
                  <span className={`cell-day-number ${isTodayCell ? 'today-pill' : ''}`}>
                    {cell.day}
                  </span>
                  {cellReminders.length > 0 && (
                    <span className="cell-count-badge">{cellReminders.length}</span>
                  )}
                </div>

                {/* Pontos de Lembretes com cores da prioridade (ou cinza se concluído) */}
                <div className="cell-dots-wrapper">
                  {cellReminders.slice(0, 4).map((rem, rIdx) => {
                    const isConcluido = Boolean(rem.concluido ?? rem.completed);
                    const prioridadeKey = rem.prioridade || rem.importance || 'baixa';
                    const color = isConcluido
                      ? '#94a3b8' // Cinza para eventos concluídos
                      : IMPORTANCE_LEVELS[prioridadeKey]?.colorHex || '#10b981';

                    return (
                      <span
                        key={rIdx}
                        className={`reminder-dot-indicator ${isConcluido ? 'is-completed-dot' : ''}`}
                        style={{ backgroundColor: color }}
                        title={`${rem.time ? rem.time + ' - ' : ''}${rem.title}${
                          isConcluido ? ' (Concluído)' : ''
                        }`}
                      />
                    );
                  })}
                  {cellReminders.length > 4 && (
                    <span className="dot-plus">+{cellReminders.length - 4}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel lateral/inferior de resumo do dia selecionado */}
      <div className="calendar-day-preview-card">
        <div className="preview-header">
          <div>
            <span className="preview-label">Dia Selecionado:</span>
            <h3 className="preview-date-title">{formatDateExtended(selectedDate)}</h3>
          </div>
          <div className="preview-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onOpenNewReminderForDate(selectedDate)}
            >
              <Plus size={16} />
              <span>Adicionar Neste Dia</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSelectDateAndGoToDay(selectedDate, true)}
            >
              <span>Ver Lista do Dia</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="preview-content">
          {selectedDayReminders.length === 0 ? (
            <p className="preview-empty">Nenhum lembrete registrado para esta data.</p>
          ) : (
            <div className="preview-items-list">
              {selectedDayReminders.map((rem) => {
                const isConcluido = Boolean(rem.concluido ?? rem.completed);
                const prioridadeKey = rem.prioridade || rem.importance || 'baixa';
                const info = IMPORTANCE_LEVELS[prioridadeKey] || IMPORTANCE_LEVELS.baixa;
                return (
                  <div key={rem.id} className={`preview-item ${isConcluido ? 'is-completed' : ''}`}>
                    <span
                      className="preview-bullet"
                      style={{ backgroundColor: isConcluido ? '#94a3b8' : info.colorHex }}
                    />
                    {rem.time && (
                      <span className="preview-time">
                        <Clock size={12} />
                        {rem.time}
                      </span>
                    )}
                    <span className={`preview-title ${isConcluido ? 'completed' : ''}`}>
                      {rem.recorrente && (
                        <Repeat size={13} className="preview-repeat-icon" title="Evento semanal fixo" />
                      )}
                      <span>{rem.title}</span>
                    </span>
                    <span className={`preview-badge ${info.badgeClass}`}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

