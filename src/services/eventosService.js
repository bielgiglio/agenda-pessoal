import { supabase } from '../supabaseClient';
import { normalizarPrioridade } from '../utils/storage';

/**
 * Converte um registro da tabela 'eventos' para o formato utilizado pelos componentes do frontend
 */
export function formatEventoFromDB(evento) {
  if (!evento) return null;

  const d = new Date(evento.data_hora);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hours}:${minutes}`;
  const prioridade = normalizarPrioridade(evento.prioridade);

  const recorrente = Boolean(evento.recorrente);
  
  // Normaliza dias_semana como array de inteiros
  let diasSemana = [];
  if (Array.isArray(evento.dias_semana) && evento.dias_semana.length > 0) {
    diasSemana = evento.dias_semana.map(Number);
  } else if (evento.dia_semana !== null && evento.dia_semana !== undefined) {
    diasSemana = [Number(evento.dia_semana)];
  }

  const diaSemana = diasSemana.length > 0 ? diasSemana[0] : null;
  const horarioRecorrente = evento.horario_recorrente || '';

  return {
    id: evento.id,
    user_id: evento.user_id,
    titulo: evento.titulo,
    title: evento.titulo,
    descricao: evento.descricao || '',
    description: evento.descricao || '',
    data_hora: evento.data_hora,
    date: dateStr,
    time: recorrente && horarioRecorrente ? horarioRecorrente : (timeStr === '00:00' ? '' : timeStr),
    concluido: Boolean(evento.concluido),
    completed: Boolean(evento.concluido),
    prioridade,
    importance: prioridade,
    recorrente,
    dias_semana: diasSemana,
    dia_semana: diaSemana,
    horario_recorrente: horarioRecorrente
  };
}

/**
 * Converte dados do formulário para o formato da tabela 'eventos'
 */
export function formatEventoToDB(formData, userId) {
  const isRecorrente = Boolean(formData.recorrente);
  
  let diasSemana = null;
  let diaSemana = null;

  if (isRecorrente) {
    if (Array.isArray(formData.dias_semana) && formData.dias_semana.length > 0) {
      diasSemana = [...new Set(formData.dias_semana.map(Number))].sort((a, b) => a - b);
      diaSemana = diasSemana[0];
    } else if (formData.dia_semana !== undefined && formData.dia_semana !== null) {
      diasSemana = [Number(formData.dia_semana)];
      diaSemana = Number(formData.dia_semana);
    } else {
      diasSemana = [];
      diaSemana = null;
    }
  }

  const horarioRecorrente = isRecorrente
    ? (formData.horario_recorrente || formData.time || '00:00')
    : null;

  let date = formData.date;
  let time = (isRecorrente ? horarioRecorrente : formData.time) || '00:00';

  if (!date) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    date = `${y}-${m}-${d}`;
  }

  // Constrói a data/hora local e converte para ISO UTC para o banco
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time && time.trim() ? time : '00:00').split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hours, minutes, 0);

  const prioridade = normalizarPrioridade(formData.prioridade || formData.importance);

  return {
    titulo: (formData.title || formData.titulo || '').trim(),
    descricao: (formData.description || formData.descricao || '').trim(),
    data_hora: dateObj.toISOString(),
    concluido: Boolean(formData.completed ?? formData.concluido ?? false),
    prioridade,
    recorrente: isRecorrente,
    dias_semana: diasSemana,
    dia_semana: diaSemana,
    horario_recorrente: horarioRecorrente,
    ...(userId ? { user_id: userId } : {})
  };
}

/**
 * Busca todos os eventos do usuário autenticado em ordem cronológica
 */
export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data_hora', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(formatEventoFromDB);
}

/**
 * Insere um novo evento no Supabase
 */
export async function createEvento(formData, userId) {
  const payload = formatEventoToDB(formData, userId);

  const { data, error } = await supabase
    .from('eventos')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return formatEventoFromDB(data);
}

/**
 * Atualiza um evento existente no Supabase
 */
export async function updateEvento(id, formData, userId) {
  const payload = formatEventoToDB(formData, userId);

  const { data, error } = await supabase
    .from('eventos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return formatEventoFromDB(data);
}

/**
 * Altera apenas o status de conclusão (marcar como concluído / pendente)
 */
export async function toggleEventoConcluido(id, currentStatus) {
  const { data, error } = await supabase
    .from('eventos')
    .update({ concluido: !currentStatus })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return formatEventoFromDB(data);
}

/**
 * Exclui um evento pelo ID
 */
export async function deleteEvento(id) {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}

