import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReminderList from './components/ReminderList';
import ReminderModal from './components/ReminderModal';
import FullCalendar from './components/FullCalendar';
import { loadReminders, saveReminders } from './utils/storage';
import { formatToDateInput } from './utils/dateUtils';
import './App.css';

export default function App() {
  const [reminders, setReminders] = useState(() => loadReminders());
  const [selectedDate, setSelectedDate] = useState(() => formatToDateInput(new Date()));
  const [viewMode, setViewMode] = useState('day'); // 'day' ou 'calendar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Sincroniza lembretes com localStorage sempre que houver alterações
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Lembretes do dia selecionado
  const dayReminders = reminders.filter((r) => r.date === selectedDate);
  const dayCompleted = dayReminders.filter((r) => r.completed).length;

  // Adicionar ou atualizar lembrete
  const handleSaveReminder = (reminderData) => {
    if (editingReminder) {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderData.id ? reminderData : r))
      );
    } else {
      setReminders((prev) => [reminderData, ...prev]);
      // Se adicionou em outra data, sincroniza a data selecionada
      setSelectedDate(reminderData.date);
    }
    setEditingReminder(null);
  };

  // Alternar status de conclusão
  const handleToggleComplete = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  // Iniciar edição
  const handleStartEdit = (reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  // Deletar lembrete
  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Abrir modal para novo lembrete
  const handleOpenNewReminder = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  // Abrir modal pré-selecionando data vindo do calendário
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

  return (
    <div className="agenda-app">
      {/* Topo fixo com calendário no canto esquerdo, data no topo e botão + no canto direito */}
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
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="content-container">
          {viewMode === 'day' ? (
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
              reminders={reminders}
              selectedDate={selectedDate}
              onSelectDateAndGoToDay={handleSelectDateFromCalendar}
              onOpenNewReminderForDate={handleOpenNewReminderForDate}
            />
          )}
        </div>
      </main>

      {/* Modal de Criação / Edição de Lembretes */}
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
    </div>
  );
}
