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
