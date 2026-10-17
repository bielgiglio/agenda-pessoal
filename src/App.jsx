import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ReminderList from './components/ReminderList';
import ReminderModal from './components/ReminderModal';
import FullCalendar from './components/FullCalendar';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import { supabase } from './supabaseClient';
import {
  getEventos,
  createEvento,
  updateEvento,
  toggleEventoConcluido,
  deleteEvento
} from './services/eventosService';
import {
  formatToDateInput,
  isEventMatchingDate,
  projectEventForDate
} from './utils/dateUtils';
import { AlertCircle, RefreshCw, Calendar, Plus } from 'lucide-react';
import './App.css';

export default function App() {
  // Estado de Autenticação
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados de Dados da Agenda
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Estados de Navegação e Interface
  const [selectedDate, setSelectedDate] = useState(() => formatToDateInput(new Date()));
  const [viewMode, setViewMode] = useState('day'); // 'day' ou 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Estado compartilhado do Mês e Ano do Calendário
  const [currentYear, setCurrentYear] = useState(() => {
    const d = new Date(selectedDate ? `${selectedDate}T12:00:00` : new Date());
    return d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate ? `${selectedDate}T12:00:00` : new Date());
    return d.getMonth();
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

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

  // 1. Monitora a sessão de autenticação do Supabase
  useEffect(() => {
    let mounted = true;

    // Busca a sessão inicial ativa
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (mounted) {
        setSession(currentSession);
        setAuthLoading(false);
      }
    }).catch((err) => {
      console.error('Erro ao verificar sessão inicial:', err);
      if (mounted) setAuthLoading(false);
    });

    // Escuta mudanças de autenticação em tempo real
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Busca os eventos do Supabase quando houver usuário autenticado
  const carregarEventos = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoadingEventos(true);
      setErrorMessage(null);
      const dados = await getEventos();
      setEventos(dados);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setErrorMessage(
        'Não foi possível carregar os eventos. Verifique se as tabelas foram criadas no Supabase e se as credenciais estão corretas.'
      );
    } finally {
      setLoadingEventos(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      carregarEventos();
    } else {
      setEventos([]);
    }
  }, [session, carregarEventos]);

  // Lembretes do dia selecionado (incluindo eventos fixos / recorrentes projetados para a data)
  const dayReminders = eventos
    .filter((r) => isEventMatchingDate(r, selectedDate))
    .map((r) => projectEventForDate(r, selectedDate));
  const dayCompleted = dayReminders.filter((r) => r.concluido || r.completed).length;

  // 3. Operação: Criar ou Editar Evento no Supabase
  const handleSaveReminder = async (formData) => {
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error('Usuário não autenticado.');
    }

    if (editingReminder) {
      const atualizado = await updateEvento(editingReminder.id, formData, userId);
      setEventos((prev) =>
        prev
          .map((item) => (item.id === atualizado.id ? atualizado : item))
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
      );
    } else {
      const novo = await createEvento(formData, userId);
      setEventos((prev) => {
        const list = [...prev, novo];
        return list.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      });
      // Sincroniza a data selecionada com a data do evento criado
      setSelectedDate(formData.date);
    }
    setEditingReminder(null);
  };

  // 4. Operação: Alternar Concluído / Pendente no Supabase
  const handleToggleComplete = async (id) => {
    const alvo = eventos.find((e) => e.id === id);
    if (!alvo) return;

    const novoStatus = !alvo.concluido;

    // Atualização otimista na interface
    setEventos((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, concluido: novoStatus, completed: novoStatus } : e
      )
    );

    try {
      await toggleEventoConcluido(id, alvo.concluido);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      // Reverte em caso de erro
      setEventos((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, concluido: alvo.concluido, completed: alvo.concluido } : e
        )
      );
      alert('Não foi possível alterar o status do evento no momento.');
    }
  };

  // 5. Operação: Excluir Evento no Supabase
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    const estadoAnterior = [...eventos];
    // Remoção otimista
    setEventos((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteEvento(id);
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      setEventos(estadoAnterior);
      alert('Erro ao excluir o evento. Tente novamente.');
    }
  };

  // Iniciar edição
  const handleStartEdit = (reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  // Abrir modal para novo lembrete
  const handleOpenNewReminder = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  // Abrir modal com data pré-selecionada vinda do calendário
  const handleOpenNewReminderForDate = (date) => {
    setSelectedDate(date);
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  // Selecionar data a partir do calendário mensal
  const handleSelectDateFromCalendar = (date, goToDayView = false) => {
    setSelectedDate(date);
    if (goToDayView) {
      setViewMode('day');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setEventos([]);
    } catch (err) {
      console.error('Erro ao encerrar sessão:', err);
    }
  };

  // Tela de Carregamento da Sessão Inicial
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <Calendar size={42} className="loading-icon pulse" />
          <h2 className="loading-title">Carregando Agenda...</h2>
          <div className="spinner-bar"></div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, exibe unicamente a tela de login
  if (!session) {
    return <Login onAuthSuccess={(novaSessao) => setSession(novaSessao)} />;
  }

  return (
    <div className="agenda-app">
      {/* Topo fixo com navegação, data, botão de novo evento e menu do usuário */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenNewReminder={handleOpenNewReminder}
        dayRemindersCount={{
          total: dayReminders.length,
          completed: dayCompleted
        }}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={session.user}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onGoToCurrentMonth={handleGoToCurrentMonth}
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="content-container">
          {/* Alerta de erro na sincronização */}
          {errorMessage && (
            <div className="app-error-banner">
              <div className="error-text-wrap">
                <AlertCircle size={20} className="error-icon" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-error"
                onClick={carregarEventos}
              >
                <RefreshCw size={14} />
                <span>Tentar novamente</span>
              </button>
            </div>
          )}

          {/* Indicador de carregamento de eventos */}
          {loadingEventos ? (
            <div className="events-loading-state">
              <div className="spinner-bubble"></div>
              <p>Sincronizando seus eventos com o Supabase...</p>
            </div>
          ) : viewMode === 'day' ? (
            <ReminderList
              reminders={dayReminders}
              selectedDate={selectedDate}
              onToggleComplete={handleToggleComplete}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
              onOpenNewReminder={handleOpenNewReminder}
            />
          ) : (
            <FullCalendar
              reminders={eventos}
              selectedDate={selectedDate}
              onSelectDateAndGoToDay={handleSelectDateFromCalendar}
              onOpenNewReminderForDate={handleOpenNewReminderForDate}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />
          )}
        </div>
      </main>

      {/* Botão Flutuante (FAB) para Mobile no Modo Diário */}
      {viewMode === 'day' && (
        <button
          type="button"
          className="mobile-fab-btn"
          onClick={handleOpenNewReminder}
          title="Adicionar novo compromisso"
          aria-label="Adicionar novo compromisso"
        >
          <Plus size={26} />
        </button>
      )}

      {/* Modal de Criação / Edição de Eventos */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
        initialDate={selectedDate}
        editingReminder={editingReminder}
      />

      {/* Modal de Perfil e Configurações da Conta */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={session.user}
        onUserUpdated={(updatedUser) => {
          setSession((prev) => (prev ? { ...prev, user: updatedUser } : prev));
        }}
      />
    </div>
  );
}
