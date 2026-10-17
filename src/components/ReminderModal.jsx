import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlignLeft, Type, Flag, Check, Repeat } from 'lucide-react';
import { PRIORIDADE_OPTIONS, normalizarPrioridade } from '../utils/storage';
import {
  formatToDateInput,
  formatToTimeInput,
  DIAS_DA_SEMANA,
  DIAS_DA_SEMANA_ABREV,
  getDayOfWeekFromDate,
  formatDiasSemanaResumo
} from '../utils/dateUtils';

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
  const [prioridade, setPrioridade] = useState('baixa');
  const [isRecorrente, setIsRecorrente] = useState(false);
  const [diasSemana, setDiasSemana] = useState([1]);
  const [horarioRecorrente, setHorarioRecorrente] = useState('09:00');
  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingReminder) {
        setDate(editingReminder.date || formatToDateInput(new Date()));
        setTime(editingReminder.time || '');
        setTitle(editingReminder.title || editingReminder.titulo || '');
        setDescription(editingReminder.description || editingReminder.descricao || '');
        setPrioridade(normalizarPrioridade(editingReminder.prioridade || editingReminder.importance));
        
        const rec = Boolean(editingReminder.recorrente);
        setIsRecorrente(rec);

        // Preenche os dias previamente selecionados
        let diasIniciais = [];
        if (Array.isArray(editingReminder.dias_semana) && editingReminder.dias_semana.length > 0) {
          diasIniciais = editingReminder.dias_semana.map(Number);
        } else if (editingReminder.dia_semana !== null && editingReminder.dia_semana !== undefined) {
          diasIniciais = [Number(editingReminder.dia_semana)];
        } else if (editingReminder.date) {
          diasIniciais = [getDayOfWeekFromDate(editingReminder.date)];
        } else {
          diasIniciais = [1];
        }
        setDiasSemana(diasIniciais);
        setHorarioRecorrente(editingReminder.horario_recorrente || editingReminder.time || '09:00');
      } else {
        const initDate = initialDate || formatToDateInput(new Date());
        setDate(initDate);
        const defaultTime = formatToTimeInput(new Date());
        setTime(defaultTime);
        setTitle('');
        setDescription('');
        setPrioridade('baixa');
        setIsRecorrente(false);
        setDiasSemana([getDayOfWeekFromDate(initDate)]);
        setHorarioRecorrente(defaultTime || '09:00');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, editingReminder, initialDate]);

  if (!isOpen) return null;

  const handleToggleDiaSemana = (diaIdx) => {
    setDiasSemana((prev) => {
      if (prev.includes(diaIdx)) {
        return prev.filter((d) => d !== diaIdx);
      } else {
        return [...prev, diaIdx].sort((a, b) => a - b);
      }
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título do compromisso.');
      return;
    }
    if (!isRecorrente && !date) {
      setError('Por favor, selecione o dia.');
      return;
    }
    if (isRecorrente && diasSemana.length === 0) {
      setError('Selecione pelo menos um dia da semana para o evento fixo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const diasOrdenados = [...diasSemana].sort((a, b) => a - b);

      await onSave({
        id: editingReminder ? editingReminder.id : undefined,
        date: isRecorrente ? (date || initialDate || formatToDateInput(new Date())) : date,
        time: isRecorrente ? horarioRecorrente : (time || ''),
        title: title.trim(),
        titulo: title.trim(),
        description: description.trim(),
        descricao: description.trim(),
        prioridade,
        importance: prioridade,
        recorrente: isRecorrente,
        dias_semana: isRecorrente ? diasOrdenados : null,
        dia_semana: isRecorrente ? (diasOrdenados.length > 0 ? diasOrdenados[0] : null) : null,
        horario_recorrente: isRecorrente ? horarioRecorrente : null,
        completed: editingReminder ? (editingReminder.completed ?? editingReminder.concluido ?? false) : false,
        concluido: editingReminder ? (editingReminder.completed ?? editingReminder.concluido ?? false) : false
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      setError(err.message || 'Erro ao salvar. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Opção Evento Fixo / Recorrente Semanal */}
          <div className="form-group">
            <div
              className={`recurrence-card ${isRecorrente ? 'is-active' : ''}`}
              onClick={() => setIsRecorrente(!isRecorrente)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setIsRecorrente(!isRecorrente);
                }
              }}
            >
              <div className="recurrence-card-left">
                <div className={`recurrence-icon-box ${isRecorrente ? 'active' : ''}`}>
                  <Repeat size={18} />
                </div>
                <div className="recurrence-card-text">
                  <span className="recurrence-card-title">Evento Fixo / Recorrente Semanal</span>
                  <span className="recurrence-card-desc">
                    Repete automaticamente toda semana no dia escolhido
                  </span>
                </div>
              </div>
              <div className={`custom-switch ${isRecorrente ? 'checked' : ''}`}>
                <div className="switch-thumb" />
              </div>
            </div>
          </div>

          {/* Configuração de Data e Hora: Recorrente vs Pontual */}
          {isRecorrente ? (
            <div className="recurrence-config-block">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  <span>Dias da Semana <span className="required-mark">*</span></span>
                  <span className="form-label-badge">{diasSemana.length} selecionado{diasSemana.length === 1 ? '' : 's'}</span>
                </label>
                <div className="weekday-selector-grid">
                  {DIAS_DA_SEMANA_ABREV.map((diaAbrev, idx) => {
                    const isSelected = diasSemana.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`weekday-select-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleDiaSemana(idx)}
                        title={`Clique para marcar/desmarcar ${DIAS_DA_SEMANA[idx]}`}
                        aria-pressed={isSelected}
                      >
                        <span className="weekday-select-abrev">{diaAbrev}</span>
                        <span className="weekday-select-sub">{DIAS_DA_SEMANA[idx].split('-')[0]}</span>
                        {isSelected && <span className="weekday-chip-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="recurrence-frequency-hint">
                  {diasSemana.length > 0 ? (
                    <>🗓️ Ocorre toda(o) <strong>{formatDiasSemanaResumo(diasSemana)}</strong></>
                  ) : (
                    <>⚠️ <em>Selecione pelo menos um dia acima</em></>
                  )}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="recurrence-time">
                  <Clock size={16} />
                  <span>Horário Fixo</span>
                </label>
                <input
                  id="recurrence-time"
                  type="time"
                  className="form-input"
                  value={horarioRecorrente}
                  onChange={(e) => setHorarioRecorrente(e.target.value)}
                />
              </div>
            </div>
          ) : (
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
          )}

          {/* Prioridade do Evento */}
          <div className="form-group">
            <label className="form-label">
              <Flag size={16} />
              <span>Prioridade do Evento</span>
            </label>
            <div className="importance-selector">
              {PRIORIDADE_OPTIONS.map((lvl) => {
                const isSelected = prioridade === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`importance-option opt-${lvl.id} ${lvl.optClass} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPrioridade(lvl.id)}
                  >
                    <span
                      className="opt-color-bullet"
                      style={{ backgroundColor: lvl.colorHex }}
                    />
                    <span className="opt-label">{lvl.label}</span>
                    <span className="opt-sub">({lvl.subLabel})</span>
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
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Salvando...'
                : editingReminder
                ? 'Salvar Alterações'
                : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

