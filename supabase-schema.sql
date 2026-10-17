-- ============================================================
-- SCRIPT DE CRIAÇÃO DA TABELA E REGRAS DE SEGURANÇA (RLS)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Criação da tabela de eventos
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  data_hora TIMESTAMPTZ NOT NULL,
  concluido BOOLEAN NOT NULL DEFAULT false,
  prioridade TEXT NOT NULL DEFAULT 'baixa',
  recorrente BOOLEAN NOT NULL DEFAULT false,
  dia_semana INTEGER,
  dias_semana INTEGER[],
  horario_recorrente TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Se a tabela já existir previamente, adicione as novas colunas de forma segura e não destrutiva:
ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS prioridade TEXT NOT NULL DEFAULT 'baixa';

ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS recorrente BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS dia_semana INTEGER;

ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS dias_semana INTEGER[];

ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS horario_recorrente TEXT;

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- 3. Criação de índice para otimizar consultas por usuário e ordenação cronológica
CREATE INDEX IF NOT EXISTS idx_eventos_user_data_hora 
  ON public.eventos (user_id, data_hora ASC);

-- 4. Remoção de políticas prévias se existirem (para permitir re-execução segura)
DROP POLICY IF EXISTS "Usuários podem gerenciar apenas seus próprios eventos" ON public.eventos;
DROP POLICY IF EXISTS "Usuários podem visualizar os próprios eventos" ON public.eventos;
DROP POLICY IF EXISTS "Usuários podem inserir os próprios eventos" ON public.eventos;
DROP POLICY IF EXISTS "Usuários podem atualizar os próprios eventos" ON public.eventos;
DROP POLICY IF EXISTS "Usuários podem excluir os próprios eventos" ON public.eventos;

-- 5. Políticas RLS: Usuário gerencia apenas os próprios registros com auth.uid() = user_id
CREATE POLICY "Usuários podem visualizar os próprios eventos"
  ON public.eventos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir os próprios eventos"
  ON public.eventos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar os próprios eventos"
  ON public.eventos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir os próprios eventos"
  ON public.eventos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

