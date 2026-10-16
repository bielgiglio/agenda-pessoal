import React from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Home, Sun } from 'lucide-react';
import { formatDateExtended, isToday, addDays, formatToDateInput } from '../utils/dateUtils';

export default function Header({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  onOpenNewReminder,
  dayRemindersCount = { total: 0, completed: 0 }
}) {
  const isSelectedToday = isToday(selectedDate);

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(formatToDateInput(new Date()));
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Canto Superior Esquerdo: Botão Calendário Completo */}
        <div className="header-left">
          {viewMode === 'day' ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setViewMode('calendar')}
              title="Acessar calendário completo mensal"
            >
              <CalendarIcon size={18} />
              <span className="btn-text">Calendário Completo</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary-light"
              onClick={() => setViewMode('day')}
              title="Voltar para a lista do dia"
            >
              <ChevronLeft size={18} />
              <span className="btn-text">Voltar para o Dia</span>
            </button>
          )}
        </div>

        {/* Parte Superior Central: O Dia e navegação rápida */}
        <div className="header-center">
          {viewMode === 'day' ? (
            <div className="date-navigator">
              <div className="nav-controls">
                <button
                  type="button"
                  className="nav-arrow"
                  onClick={handlePrevDay}
                  title="Dia anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="date-display">
                  <h1 className="date-title">{formatDateExtended(selectedDate)}</h1>
                  <div className="date-sub">
                    {isSelectedToday ? (
                      <span className="badge-today">Hoje</span>
                    ) : (
                      <button type="button" className="btn-link-today" onClick={handleToday}>
                        Ir para Hoje
                      </button>
                    )}
                    <span className="date-counter">
                      {dayRemindersCount.total === 0
                        ? 'Nenhuma tarefa'
                        : `${dayRemindersCount.completed} de ${dayRemindersCount.total} concluída${
                            dayRemindersCount.total > 1 ? 's' : ''
                          }`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="nav-arrow"
                  onClick={handleNextDay}
                  title="Próximo dia"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="calendar-header-title">
              <h1 className="date-title">Visão Geral Mensal</h1>
              <p className="date-sub">Clique em qualquer data para ver ou agendar compromissos</p>
            </div>
          )}
        </div>

        {/* Canto Superior Direito: Botão + para adicionar novos lembretes */}
        <div className="header-right">
          <button
            type="button"
            className="btn btn-add"
            onClick={onOpenNewReminder}
            title="Adicionar novo lembrete"
          >
            <Plus size={22} className="plus-icon" />
            <span className="btn-text-add">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
