import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Check
} from 'lucide-react';
import {
  formatDateExtended,
  isToday,
  addDays,
  formatToDateInput,
  MESES
} from '../utils/dateUtils';

export default function Header({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  onOpenNewReminder,
  dayRemindersCount = { total: 0, completed: 0 },
  onLogout,
  onOpenProfile,
  user,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onGoToCurrentMonth
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isSelectedToday = isToday(selectedDate);

  // Fecha o menu do usuário ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(formatToDateInput(new Date()));
  };

  const userName =
    user?.user_metadata?.nome ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  const now = new Date();
  const isViewingCurrentMonth =
    currentMonth === now.getMonth() && currentYear === now.getFullYear();

  return (
    <header className="app-header">
      <div className="header-container">
        {viewMode === 'day' ? (
          /* ========================================================
             VISÃO DIÁRIA: Estruturada em 2 Linhas Limpas
             ======================================================== */
          <div className="day-header-wrapper">
            {/* LINHA 1: Barra de Ação (Voltar/Calendário à esquerda, Ações à direita) */}
            <div className="header-action-row">
              <div className="header-action-left">
                <button
                  type="button"
                  className="btn btn-outline btn-header-calendar"
                  onClick={() => setViewMode('calendar')}
                  title="Abrir calendário mensal completo"
                >
                  <CalendarIcon size={18} />
                  <span className="btn-text-calendar">Calendário</span>
                </button>
              </div>

              <div className="header-action-right">
                {/* Botão Novo Evento */}
                <button
                  type="button"
                  className="btn btn-add btn-header-add"
                  onClick={onOpenNewReminder}
                  title="Adicionar novo compromisso"
                >
                  <Plus size={18} className="plus-icon" />
                  <span className="btn-text-add">Novo</span>
                </button>

                {/* Menu Compacto do Usuário (Perfil e Logout) */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`user-avatar-btn ${isUserMenuOpen ? 'is-active' : ''}`}
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    title={user?.email ? `${userName} (${user.email})` : 'Menu do usuário'}
                    aria-label="Menu do usuário"
                    aria-expanded={isUserMenuOpen}
                  >
                    <span className="user-avatar-initial">{userInitial}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-dropdown-card">
                      <div className="user-dropdown-header">
                        <span className="user-dropdown-name">{userName}</span>
                        {user?.email && (
                          <span className="user-dropdown-email">{user.email}</span>
                        )}
                      </div>

                      <div className="user-dropdown-divider" />

                      {onOpenProfile && (
                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProfile();
                          }}
                        >
                          <UserIcon size={16} />
                          <span>Meu Perfil</span>
                        </button>
                      )}

                      {onLogout && (
                        <button
                          type="button"
                          className="user-dropdown-item item-danger"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                        >
                          <LogOut size={16} />
                          <span>Sair da Conta</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LINHA 2: Navegação de Data Centralizada */}
            <div className="header-date-row">
              <button
                type="button"
                className="nav-arrow"
                onClick={handlePrevDay}
                title="Dia anterior"
                aria-label="Dia anterior"
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
                aria-label="Próximo dia"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             VISÃO DO CALENDÁRIO MENSAL: Estrutura em 2 Linhas Limpas
             ======================================================== */
          <div className="day-header-wrapper">
            {/* LINHA 1: Barra de Ação (Esquerda: Voltar para o Dia | Direita: + Novo & Menu) */}
            <div className="header-action-row">
              <div className="header-action-left">
                <button
                  type="button"
                  className="btn btn-outline btn-header-calendar"
                  onClick={() => setViewMode('day')}
                  title="Voltar para a lista do dia"
                >
                  <ChevronLeft size={18} />
                  <span className="btn-text-calendar">Lista do Dia</span>
                </button>
              </div>

              <div className="header-action-right">
                {/* Botão Novo Evento */}
                <button
                  type="button"
                  className="btn btn-add btn-header-add"
                  onClick={onOpenNewReminder}
                  title="Adicionar novo compromisso"
                >
                  <Plus size={18} className="plus-icon" />
                  <span className="btn-text-add">Novo</span>
                </button>

                {/* Menu Compacto do Usuário (Perfil e Logout) */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`user-avatar-btn ${isUserMenuOpen ? 'is-active' : ''}`}
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    title={user?.email ? `${userName} (${user.email})` : 'Menu do usuário'}
                    aria-label="Menu do usuário"
                    aria-expanded={isUserMenuOpen}
                  >
                    <span className="user-avatar-initial">{userInitial}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-dropdown-card">
                      <div className="user-dropdown-header">
                        <span className="user-dropdown-name">{userName}</span>
                        {user?.email && (
                          <span className="user-dropdown-email">{user.email}</span>
                        )}
                      </div>

                      <div className="user-dropdown-divider" />

                      {onOpenProfile && (
                        <button
                          type="button"
                          className="user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProfile();
                          }}
                        >
                          <UserIcon size={16} />
                          <span>Meu Perfil</span>
                        </button>
                      )}

                      {onLogout && (
                        <button
                          type="button"
                          className="user-dropdown-item item-danger"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                        >
                          <LogOut size={16} />
                          <span>Sair da Conta</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LINHA 2: Navegação de Mês Centralizada (Sem colisão/sobreposição) */}
            <div className="header-date-row">
              <button
                type="button"
                className="nav-arrow"
                onClick={onPrevMonth}
                title="Mês anterior"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="date-display">
                <h1 className="date-title">
                  {MESES[currentMonth]} {currentYear}
                </h1>
                <div className="date-sub">
                  {isViewingCurrentMonth ? (
                    <span className="badge-today">Mês Atual</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-link-today"
                      onClick={onGoToCurrentMonth}
                    >
                      Ir para Mês Atual
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="nav-arrow"
                onClick={onNextMonth}
                title="Próximo mês"
                aria-label="Próximo mês"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
