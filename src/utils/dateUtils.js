// Funções auxiliares para manipulação e formatação de datas em português

export const DIAS_DA_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const DIAS_DA_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

// Retorna data no formato YYYY-MM-DD local
export function formatToDateInput(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Retorna hora no formato HH:MM
export function formatToTimeInput(date = new Date()) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Cria objeto Date a partir de string YYYY-MM-DD
export function parseDateInput(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Formata data por extenso: "Quinta-feira, 15 de Outubro de 2026"
export function formatDateExtended(dateStr) {
  const date = parseDateInput(dateStr);
  const diaSemana = DIAS_DA_SEMANA[date.getDay()];
  const dia = date.getDate();
  const mes = MESES[date.getMonth()];
  const ano = date.getFullYear();
  return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}

// Adiciona ou subtrai dias de uma string YYYY-MM-DD
export function addDays(dateStr, days) {
  const date = parseDateInput(dateStr);
  date.setDate(date.getDate() + days);
  return formatToDateInput(date);
}

// Verifica se a data é hoje
export function isToday(dateStr) {
  return dateStr === formatToDateInput(new Date());
}

// Retorna o dia da semana (0 = Domingo ... 6 = Sábado) de uma string YYYY-MM-DD
export function getDayOfWeekFromDate(dateStr) {
  const date = parseDateInput(dateStr);
  return date.getDay();
}

// Formata lista de dias da semana para exibição amigável: [1, 3, 5] -> "Seg, Qua e Sex"
export function formatDiasSemanaResumo(dias = []) {
  if (!dias || dias.length === 0) return '';
  const ordenados = [...dias].sort((a, b) => a - b);
  if (ordenados.length === 7) return 'Todos os dias';
  if (ordenados.length === 5 && ordenados.every((d, i) => d === i + 1)) return 'Segunda a Sexta';
  if (ordenados.length === 2 && ordenados.includes(0) && ordenados.includes(6)) return 'Fins de semana';

  const nomes = ordenados.map((d) => DIAS_DA_SEMANA_ABREV[d]);
  if (nomes.length === 1) return DIAS_DA_SEMANA[ordenados[0]];
  if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`;
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

// Verifica se um evento se aplica a uma determinada data (considerando recorrência semanal para múltiplos dias)
export function isEventMatchingDate(event, dateStr) {
  if (!event) return false;
  if (event.recorrente) {
    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    // Suporta array dias_semana
    if (Array.isArray(event.dias_semana) && event.dias_semana.length > 0) {
      return event.dias_semana.map(Number).includes(dayOfWeek);
    }
    // Fallback retroativo para dia_semana singular
    if (event.dia_semana !== null && event.dia_semana !== undefined) {
      return Number(event.dia_semana) === dayOfWeek;
    }
    return false;
  }
  return event.date === dateStr;
}

// Projeta o evento para uma determinada data caso seja recorrente
export function projectEventForDate(event, dateStr) {
  if (!event || !event.recorrente) return event;
  return {
    ...event,
    date: dateStr,
    time: event.horario_recorrente || event.time || ''
  };
}

