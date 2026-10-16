import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlignLeft, Type, Flag, Check } from 'lucide-react';
import { IMPORTANCE_LEVELS } from '../utils/storage';
import { formatToDateInput, formatToTimeInput } from '../utils/dateUtils';

export default function ReminderModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editingReminder = null
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState('verde');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingReminder) {
        setDate(editingReminder.date || formatToDateInput(new Date()));
        setTime(editingReminder.time || '');
        setTitle(editingReminder.title || '');
        setDescription(editingReminder.description || '');
        setImportance(editingReminder.importance || 'verde');
      } else {
        setDate(initialDate || formatToDateInput(new Date()));
        setTime(formatToTimeInput(new Date()));
        setTitle('');
        setDescription('');
        setImportance('verde');
      }
      setError('');
    }
  }, [isOpen, editingReminder, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título do lembrete.');
      return;
    }
    if (!date) {
      setError('Por favor, selecione o dia.');
      return;
    }

    onSave({
      id: editingReminder ? editingReminder.id : `rem-${Date.now()}`,
      date,
      time: time || '',
      title: title.trim(),
      description: description.trim(),
      importance,
      completed: editingReminder ? editingReminder.completed : false,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </h2>
            <p className="modal-subtitle">Preencha os detalhes do seu compromisso</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Título */}
          <div className="form-group">
            <label className="form-label" htmlFor="reminder-title">
              <Type size={16} />
              <span>Título <span className="required-mark">*</span></span>
            </label>
            <input
              id="reminder-title"
              type="text"
              className="form-input"
              placeholder="Ex: Treino na academia, Reunião com equipe..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          {/* Dia e Hora lado a lado */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reminder-date">
                <Calendar size={16} />
                <span>Dia <span className="required-mark">*</span></span>
              </label>
              <input
                id="reminder-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reminder-time">
                <Clock size={16} />
                <span>Hora</span>
              </label>
              <input
                id="reminder-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Etiqueta de Importância */}
          <div className="form-group">
            <label className="form-label">
              <Flag size={16} />
              <span>Etiqueta de Importância</span>
            </label>
            <div className="importance-selector">
              {Object.values(IMPORTANCE_LEVELS).map((lvl) => {
                const isSelected = importance === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`importance-option opt-${lvl.id} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setImportance(lvl.id)}
                  >
                    <span
                      className="opt-color-bullet"
                      style={{ backgroundColor: lvl.colorHex }}
                    />
                    <span className="opt-label">{lvl.colorName}</span>
                    <span className="opt-sub">({lvl.label})</span>
                    {isSelected && <Check size={16} className="opt-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label" htmlFor="reminder-desc">
              <AlignLeft size={16} />
              <span>Descrição (opcional)</span>
            </label>
            <textarea
              id="reminder-desc"
              rows={3}
              className="form-textarea"
              placeholder="Adicione detalhes, links ou notas importantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Rodapé com botões de ação */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingReminder ? 'Salvar Alterações' : 'Criar Lembrete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
