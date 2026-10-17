import React from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { formatDateExtended, isToday, addDays, formatToDateInput } from '../utils/dateUtils';

export default function Header({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  onOpenNewReminder,
  dayRemindersCount = { total: 0, completed: 0 },
  onLogout,
  onOpenProfile,
  user
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
          ) : null}
        </div>

        {/* Canto Superior Direito: Botão +, Perfil e Logout */}
        <div className="header-right">
          <button
            type="button"
            className="btn btn-add"
            onClick={onOpenNewReminder}
            title="Adicionar novo evento"
          >
            <Plus size={20} className="plus-icon" />
            <span className="btn-text-add">Novo</span>
          </button>

          {onOpenProfile && (
            <button
              type="button"
              className="btn btn-profile"
              onClick={onOpenProfile}
              title="Meu Perfil e Configurações da Conta"
              aria-label="Meu Perfil"
            >
              <User size={18} />
              <span className="btn-text-profile">
                {user?.user_metadata?.nome || user?.user_metadata?.name || 'Perfil'}
              </span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="btn btn-logout"
              onClick={onLogout}
              title={user?.email ? `Desconectar (${user.email})` : 'Encerrar sessão'}
              aria-label="Encerrar sessão"
            >
              <LogOut size={18} />
              <span className="btn-text-logout">Sair</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

