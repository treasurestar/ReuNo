# Reunô

Sistema de agendamento de sala de reunião com disponibilidade em tempo real, notificações automáticas e sincronização com calendários externos.

## Stack

- **Frontend:** Nuxt 3 (SPA) + Vue 3 + TypeScript
- **Estilo:** Tailwind CSS 3 com dark mode
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Deploy:** Vercel

## Funcionalidades

- **Agendamento rápido** — fluxo em 3 etapas: dados da reunião → disponibilidade → confirmação
- **Disponibilidade em tempo real** — calendário visual com slots ocupados e livres
- **Reuniões recorrentes** — diária, semanal, quinzenal ou mensal com detecção automática de conflitos
- **Gestão de participantes** — convite por e-mail, confirmação de presença via link, suporte a visitantes
- **Notificações** — lembretes configuráveis antes de cada reunião
- **Sincronização com calendários** — Google Calendar e Outlook (deep links + integração OAuth)
- **Compartilhamento** — links de convite via WhatsApp e cópia rápida
- **Painel admin** — gerenciamento de usuários, configuração da sala, cancelamento de séries e reagendamento
- **Dark mode** — alternância entre temas claro e escuro

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/reuno.git
cd reuno

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencha as variáveis no .env
```

## Variáveis de Ambiente

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_EMAILS=admin@seudominio.com
```

## Banco de Dados

Execute o schema no **Supabase SQL Editor**:

```bash
# Arquivo principal
supabase/schema.sql
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Deploy (Vercel)

```bash
vercel --prod
```

## Estrutura do Projeto

```
reuno/
├── assets/css/          # Tailwind CSS
├── components/          # Sidebar, Topbar
├── composables/         # useAuth, useMeetings, useBookingFlow, useGoogleCalendar...
├── layouts/             # default, auth, booking
├── middleware/           # auth.global.ts
├── pages/               # Rotas da aplicação
├── plugins/             # supabase.client.ts
├── server/
│   ├── api/admin/       # Endpoints administrativos
│   ├── api/google/      # Integração Google Calendar
│   └── utils/           # Helpers do servidor
├── supabase/            # Schema SQL e migrações
├── types/               # Interfaces TypeScript
└── nuxt.config.ts
```

## Licença

Projeto privado. Todos os direitos reservados.
