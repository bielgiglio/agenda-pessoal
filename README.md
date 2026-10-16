# 📅 Agenda Pessoal Web App (React + Vite)

Um aplicativo web moderno, intuitivo e responsivo para organização da sua rotina diária e mensal, pronto para deploy na **Vercel**.

---

## ✨ Funcionalidades

- **Visão Diária (Página Inicial):**
  - **Topo central:** Exibição da data atual por extenso com controles para navegar entre dias anteriores e posteriores, ou voltar rapidamente para "Hoje".
  - **Canto superior esquerdo:** Botão para alternar para a visualização do **Calendário Completo**.
  - **Canto superior direito:** Botão **+** (Novo) para cadastrar rapidamente lembretes.
  - **Lista de Tarefas:** Exibição clara dos compromissos do dia com horários, etiquetas coloridas, títulos e descrições.
  - **Ações:** Marcar como concluído (com efeito riscado e checkbox), editar ou excluir lembrete.
  - **Filtros rápidos:** Visualizar Todas, apenas Pendentes ou Concluídas.

- **Modal de Criação / Edição de Lembretes:**
  - **Dia** (seleção de data).
  - **Hora** (horário do compromisso).
  - **Título** (nome da tarefa).
  - **Descrição** (detalhes ou notas).
  - **Etiquetas de Importância com cores:**
    - 🟢 **Verde:** Baixa / Normal
    - 🟡 **Amarelo:** Média / Importante
    - 🔴 **Vermelho:** Alta / Urgente

- **Calendário Completo (Mensal):**
  - Grid mensal interativo com destaques para o dia de hoje e dia selecionado.
  - Indicadores em pontinhos com as cores de prioridade (verde, amarelo e vermelho) para cada compromisso na data.
  - Painel de prévia da data com botão para adicionar novo lembrete diretamente naquele dia ou abrir a lista completa daquele dia.

- **Persistência de Dados:**
  - Todos os dados ficam salvos automaticamente no `localStorage` do navegador.

---

## 🚀 Como Executar Localmente

1. Acesse o diretório do projeto:
   ```bash
   cd agenda-pessoal
   ```

2. Instale as dependências (se ainda não o fez):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra no navegador o endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## 🌐 Como Subir para a Vercel

O projeto está 100% configurado para o padrão Vite + React da Vercel.

### Opção 1: Via GitHub (Recomendado)
1. Crie um repositório no seu GitHub.
2. Faça o push do projeto:
   ```bash
   git init
   git add .
   git commit -m "feat: agenda pessoal react app"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/agenda-pessoal.git
   git push -u origin main
   ```
3. Acesse [vercel.com](https://vercel.com) e faça login.
4. Clique em **"Add New..."** > **"Project"**.
5. Importe o repositório da sua agenda.
6. A Vercel detectará automaticamente as configurações do Vite:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
7. Clique em **Deploy**! Em poucos segundos sua agenda estará no ar com link público HTTPS.

### Opção 2: Via Vercel CLI
1. Instale a CLI globalmente:
   ```bash
   npm i -g vercel
   ```
2. Na pasta do projeto, execute:
   ```bash
   vercel
   ```
3. Siga as instruções no terminal para publicar.
