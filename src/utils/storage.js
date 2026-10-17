import { formatToDateInput, addDays } from './dateUtils';

const STORAGE_KEY = 'agenda_pessoal_reminders_v1';

export const PRIORIDADE_OPTIONS = [
  {
    id: 'baixa',
    label: 'Baixa',
    subLabel: 'Normal',
    colorName: 'Verde',
    colorHex: '#10b981',
    badgeClass: 'tag-green',
    optClass: 'opt-verde'
  },
  {
    id: 'media',
    label: 'Média',
    subLabel: 'Importante',
    colorName: 'Amarelo',
    colorHex: '#f59e0b',
    badgeClass: 'tag-yellow',
    optClass: 'opt-amarelo'
  },
  {
    id: 'alta',
    label: 'Alta',
    subLabel: 'Urgente',
    colorName: 'Vermelho',
    colorHex: '#ef4444',
    badgeClass: 'tag-red',
    optClass: 'opt-vermelho'
  }
];

export const PRIORIDADE_MAP = PRIORIDADE_OPTIONS.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

export const IMPORTANCE_LEVELS = {
  ...PRIORIDADE_MAP,
  verde: PRIORIDADE_MAP.baixa,
  amarelo: PRIORIDADE_MAP.media,
  vermelho: PRIORIDADE_MAP.alta
};

export function normalizarPrioridade(valor) {
  if (!valor) return 'baixa';
  const v = String(valor).toLowerCase().trim();
  if (v === 'verde' || v === 'baixa') return 'baixa';
  if (v === 'amarelo' || v === 'media' || v === 'média') return 'media';
  if (v === 'vermelho' || v === 'alta') return 'alta';
  return 'baixa';
}

export function getInitialReminders() {
  const today = formatToDateInput(new Date());
  const tomorrow = addDays(today, 1);
  const afterTomorrow = addDays(today, 3);

  return [
    {
      id: 'rem-1',
      date: today,
      time: '08:00',
      title: 'Caminhada matinal & Exercícios',
      description: '30 minutos de atividade física ao ar livre para começar o dia com energia.',
      importance: 'verde',
      completed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-2',
      date: today,
      time: '11:00',
      title: 'Revisar pendências da semana',
      description: 'Organizar a caixa de entrada de e-mails e checar tarefas em andamento.',
      importance: 'amarelo',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-3',
      date: today,
      time: '15:30',
      title: 'Reunião de alinhamento de projeto',
      description: 'Apresentar a nova interface da agenda e coletar feedback da equipe.',
      importance: 'vermelho',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-4',
      date: tomorrow,
      time: '09:00',
      title: 'Planejamento de sprint',
      description: 'Definir metas e prioridades para as próximas duas semanas.',
      importance: 'amarelo',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-5',
      date: tomorrow,
      time: '14:00',
      title: 'Consulta médica de rotina',
      description: 'Checkup anual com clínico geral.',
      importance: 'vermelho',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-6',
      date: afterTomorrow,
      time: '17:00',
      title: 'Supermercado e compras do mês',
      description: 'Comprar itens essenciais e frutas frescas.',
      importance: 'verde',
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];
}

export function loadReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialReminders();
      saveReminders(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler do localStorage:', err);
    return getInitialReminders();
  }
}

export function saveReminders(reminders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

