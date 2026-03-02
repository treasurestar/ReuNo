# Reunô — Documento de Requisitos

**Projeto:** Reunô — Sistema de Agendamento de Sala de Reuniões
**Versão:** 1.0
**Data:** 18/02/2026
**Stack:** Nuxt 3 (Vue 3) + Supabase (PostgreSQL) + Tailwind CSS 3

---

## 1. Visão Geral

O Reunô é uma aplicação web para gerenciamento e agendamento de uma sala de reuniões corporativa. O sistema permite que colaboradores reservem horários, convidem participantes (internos e externos), recebam notificações e acompanhem a disponibilidade em tempo real. Administradores possuem controle total sobre configurações, usuários e reuniões.

---

## 2. Requisitos Funcionais

### RF01 — Autenticação e Cadastro

| ID | Descrição |
|----|-----------|
| RF01.1 | O sistema deve permitir login com e-mail e senha via Supabase Auth. |
| RF01.2 | O sistema deve permitir login social via Google OAuth e Microsoft Azure OAuth. |
| RF01.3 | O sistema deve permitir cadastro livre de novos usuários com nome completo, e-mail e senha. |
| RF01.4 | Após o cadastro, o sistema deve enviar um e-mail de confirmação ao usuário. |
| RF01.5 | Um perfil (tabela `profiles`) deve ser criado automaticamente via trigger ao registrar um novo usuário. |
| RF01.6 | Usuários autenticados devem ser redirecionados automaticamente para o dashboard; não autenticados, para o login. |
| RF01.7 | O sistema deve oferecer opção de "Manter conectado por 30 dias". |
| RF01.8 | O sistema deve permitir logout com redirecionamento para a página de login. |

### RF02 — Dashboard

| ID | Descrição |
|----|-----------|
| RF02.1 | O dashboard deve exibir o status atual da sala (Disponível / Ocupada) com base nas reuniões do dia. |
| RF02.2 | O dashboard deve exibir a taxa de ocupação diária da sala em percentual. |
| RF02.3 | O dashboard deve listar todas as reuniões do dia com título, horário, organizador, participantes e status (Ao vivo / Agendada / Finalizada). |
| RF02.4 | O dashboard deve exibir as amenidades da sala (TV, videoconferência, internet, capacidade). |
| RF02.5 | O dashboard deve listar as próximas reuniões do usuário logado. |
| RF02.6 | O dashboard deve informar o tempo restante até a próxima reunião. |

### RF03 — Agendamento de Reuniões (Fluxo de 3 Etapas)

#### Etapa 1 — Detalhes (página `/agendar`)

| ID | Descrição |
|----|-----------|
| RF03.1 | O usuário deve informar: título (obrigatório), data (obrigatória), horário inicial, duração (30/60/90/120 min) e quantidade de participantes. |
| RF03.2 | A quantidade de participantes deve respeitar o mínimo e máximo definidos na configuração da sala. |
| RF03.3 | O usuário pode informar e-mails de convidados (separados por vírgula). |
| RF03.4 | O usuário pode selecionar lembretes pré-reunião: 2h, 1h30, 1h, 45min, 30min. |
| RF03.5 | O usuário pode ativar sincronização com Google Calendar e/ou Outlook. |

#### Etapa 2 — Disponibilidade (página `/disponibilidade`)

| ID | Descrição |
|----|-----------|
| RF03.6 | O sistema deve exibir os dias da semana (Seg–Sáb) com navegação entre semanas. |
| RF03.7 | Dias passados e fins de semana (quando não permitidos) devem estar desabilitados. |
| RF03.8 | O sistema deve exibir os slots horários do dia selecionado, de acordo com o horário de funcionamento da sala. |
| RF03.9 | Slots já reservados devem ser exibidos com os dados da reunião existente e o rótulo "Reservado". |
| RF03.10 | Slots indisponíveis por conflito de horário devem estar desabilitados. |
| RF03.11 | O usuário deve poder selecionar um slot disponível, que calcula automaticamente o horário final com base na duração escolhida. |
| RF03.12 | O sistema deve oferecer alternância de visualização entre modo "Dia" e modo "Semana". |
| RF03.13 | O modo "Semana" deve exibir uma grade de 6 colunas (Seg–Sáb) com blocos coloridos para reuniões existentes. |

#### Etapa 3 — Confirmação (página `/confirmar`)

| ID | Descrição |
|----|-----------|
| RF03.14 | O sistema deve exibir um resumo completo da reunião: título, sala, data, horário, participantes, notificações e integrações. |
| RF03.15 | Ao confirmar, o sistema deve criar o registro na tabela `meetings`, os participantes em `meeting_participants` e as notificações em `meeting_notifications`. |
| RF03.16 | Convidados sem conta no sistema devem receber um `invite_token` único para confirmação de presença via link. |
| RF03.17 | Após a confirmação, o fluxo de booking deve ser resetado e o usuário redirecionado ao dashboard. |

### RF04 — Validações de Agendamento (Backend)

| ID | Descrição |
|----|-----------|
| RF04.1 | O sistema deve impedir agendamentos sobrepostos na mesma sala (trigger `check_meeting_overlap`). |
| RF04.2 | O sistema deve impedir agendamentos fora do horário de funcionamento (trigger `check_room_hours`). |
| RF04.3 | O sistema deve impedir agendamentos em fins de semana quando a configuração `allow_weekends` for `false`. |
| RF04.4 | O horário de término deve ser obrigatoriamente posterior ao horário de início (constraint SQL). |

### RF05 — Minhas Reuniões

| ID | Descrição |
|----|-----------|
| RF05.1 | O sistema deve listar reuniões do usuário em 3 abas: Ativas, Convites e Passadas. |
| RF05.2 | A aba "Ativas" deve exibir reuniões futuras com status `scheduled` criadas pelo usuário ou nas quais é participante. |
| RF05.3 | A aba "Convites" deve exibir convites pendentes (`status = 'pending'`) com opções de Confirmar ou Recusar. |
| RF05.4 | A aba "Passadas" deve exibir reuniões anteriores à data atual ou com status `completed`. |
| RF05.5 | O criador da reunião pode cancelar a reunião inteira. |
| RF05.6 | Participantes não-criadores podem cancelar apenas sua própria presença. |
| RF05.7 | O sidebar deve exibir um resumo dos convites pendentes com contagem. |

### RF06 — Confirmação de Presença (Visitantes)

| ID | Descrição |
|----|-----------|
| RF06.1 | Visitantes sem conta devem poder confirmar presença via URL com `?token=<invite_token>`. |
| RF06.2 | A página `/confirmar-presenca` deve validar o token e atualizar o status do participante via função RPC `confirm_guest_presence`. |
| RF06.3 | Tokens já utilizados ou cancelados devem retornar mensagem de erro. |

### RF07 — Calendário Interativo (Topbar)

| ID | Descrição |
|----|-----------|
| RF07.1 | Ao clicar na data exibida no cabeçalho, um popup de calendário mensal deve ser exibido. |
| RF07.2 | O calendário deve carregar reuniões do mês e colorir as datas: verde (hoje), azul (com reunião), cinza (fim de semana/passado), branco (disponível). |
| RF07.3 | O calendário deve permitir navegação entre meses (anterior/próximo). |
| RF07.4 | Ao clicar em uma data futura, o sistema deve navegar para `/disponibilidade` com aquela data selecionada. |
| RF07.5 | O popup deve fechar ao clicar fora da área do calendário. |
| RF07.6 | Uma legenda de cores deve ser exibida abaixo do calendário. |

### RF08 — Reuniões Recorrentes

| ID | Descrição |
|----|-----------|
| RF08.1 | O sistema deve suportar criação de séries de reuniões com frequências: diária, semanal, quinzenal e mensal. |
| RF08.2 | Para séries semanais, o usuário deve poder selecionar os dias da semana. |
| RF08.3 | Séries podem ter data de término ou número máximo de ocorrências. |
| RF08.4 | Cada ocorrência é um registro individual na tabela `meetings` vinculado à `meeting_series`. |

### RF09 — Painel Administrativo

| ID | Descrição |
|----|-----------|
| RF09.1 | O painel admin deve ser visível e acessível apenas para usuários com `role = 'admin'`. |
| RF09.2 | O admin deve visualizar estatísticas: uso semanal (horas), cancelamentos da semana, taxa de ocupação do dia, total de usuários e reuniões do mês. |
| RF09.3 | O admin deve poder editar a configuração da sala: nome, horário de abertura/fechamento, capacidade mínima/máxima, permissão de fins de semana. |
| RF09.4 | O admin deve visualizar a lista de todos os usuários com nome, e-mail, role e data de criação. |
| RF09.5 | O admin deve poder promover um usuário a admin ou rebaixar um admin a usuário. |
| RF09.6 | O admin deve poder remover um usuário do sistema. |
| RF09.7 | O admin deve visualizar todas as reuniões do sistema com filtros por status (agendadas, finalizadas, canceladas). |
| RF09.8 | O admin deve poder cancelar qualquer reunião. |
| RF09.9 | As reuniões de hoje devem ser listadas na aba de estatísticas com opção de cancelamento rápido. |

### RF10 — Notificações

| ID | Descrição |
|----|-----------|
| RF10.1 | O sistema deve registrar lembretes configuráveis para cada reunião (ex: 2h, 1h, 30min antes). |
| RF10.2 | Cada notificação registra o `scheduled_for` (horário calculado) e o flag `sent` para evitar duplicatas. |
| RF10.3 | O ícone de notificação deve estar visível no cabeçalho para acesso futuro. |

### RF11 — Integrações

| ID | Descrição |
|----|-----------|
| RF11.1 | O sistema deve suportar flag de sincronização com Google Calendar por reunião. |
| RF11.2 | O sistema deve suportar flag de sincronização com Outlook por reunião. |
| RF11.3 | Os campos `google_event_id` e `outlook_event_id` devem armazenar os IDs dos eventos sincronizados. |

### RF12 — Sidebar

| ID | Descrição |
|----|-----------|
| RF12.1 | A sidebar deve exibir a logo do Reunô, navegação principal e informações da sala. |
| RF12.2 | A navegação deve incluir: Dashboard, Nova reunião, Disponibilidade, Minhas reuniões e Admin (condicional). |
| RF12.3 | O link Admin só deve aparecer para usuários com `role = 'admin'`. |
| RF12.4 | A sidebar deve exibir o status atual da sala (Disponível/Ocupada) e o tempo até a próxima reunião. |
| RF12.5 | A sidebar deve exibir nome, e-mail e iniciais do usuário logado, com botão de logout. |

---

## 3. Requisitos Não Funcionais

### RNF01 — Desempenho

| ID | Descrição |
|----|-----------|
| RNF01.1 | A aplicação deve carregar a página inicial em menos de 3 segundos em conexões 4G. |
| RNF01.2 | Consultas de disponibilidade (slots do dia) devem retornar em menos de 500ms. |
| RNF01.3 | O banco de dados deve utilizar índices otimizados para consultas por data, status, usuário e token. |

### RNF02 — Segurança

| ID | Descrição |
|----|-----------|
| RNF02.1 | Todas as tabelas do banco devem utilizar Row Level Security (RLS) do Supabase. |
| RNF02.2 | Usuários comuns só podem editar/excluir seus próprios dados e reuniões que criaram. |
| RNF02.3 | Apenas admins podem editar a configuração da sala, gerenciar usuários e cancelar reuniões de terceiros. |
| RNF02.4 | Senhas devem ter no mínimo 6 caracteres. |
| RNF02.5 | Tokens de convite (`invite_token`) devem ser UUIDs únicos e validados server-side via RPC. |
| RNF02.6 | As chaves do Supabase (URL e ANON_KEY) devem ser armazenadas em variáveis de ambiente (`.env`), nunca em código-fonte. |
| RNF02.7 | Rotas protegidas devem ser bloqueadas por middleware global que redireciona para `/login`. |

### RNF03 — Usabilidade

| ID | Descrição |
|----|-----------|
| RNF03.1 | A interface deve ser responsiva, funcionando em telas de 375px (mobile) até 1920px (desktop). |
| RNF03.2 | A aplicação deve suportar modo claro e modo escuro com alternância manual. |
| RNF03.3 | O modo escuro deve usar paleta de cores com alto contraste para legibilidade (fundo `#0f1729`, cards `#1a2332`, bordas `#2a3444`). |
| RNF03.4 | Todos os textos da interface devem estar em português brasileiro. |
| RNF03.5 | Datas devem ser exibidas no formato brasileiro (DD/MM/AAAA) e horários no formato 24h (HH:MM). |
| RNF03.6 | Ações destrutivas (cancelar reunião, remover usuário) devem ter feedback visual claro (botões vermelhos). |
| RNF03.7 | Transições e animações (slide up, fade) devem ser utilizadas para suavizar a experiência do usuário. |
| RNF03.8 | Estados de carregamento devem exibir spinners com mensagens contextuais. |
| RNF03.9 | Estados vazios (sem reuniões, sem convites) devem exibir ícones e mensagens informativas. |

### RNF04 — Arquitetura

| ID | Descrição |
|----|-----------|
| RNF04.1 | A aplicação deve ser SPA (Single Page Application) com `ssr: false` no Nuxt. |
| RNF04.2 | O estado global deve ser gerenciado via composables com `useState` do Nuxt para persistência entre páginas. |
| RNF04.3 | A comunicação com o banco deve ser feita exclusivamente via Supabase Client JS (sem API REST custom). |
| RNF04.4 | Validações de negócio críticas (overlap, horário de funcionamento) devem ser implementadas no banco via triggers PostgreSQL. |
| RNF04.5 | O padrão de composables deve separar responsabilidades: `useAuth` (autenticação), `useMeetings` (CRUD), `useBookingFlow` (fluxo de reserva), `useRoomConfig` (configuração da sala). |

### RNF05 — Manutenibilidade

| ID | Descrição |
|----|-----------|
| RNF05.1 | O projeto deve utilizar TypeScript com interfaces tipadas para todas as entidades do banco (`types/database.ts`). |
| RNF05.2 | A configuração da sala deve ser editável via painel admin sem necessidade de alterar código. |
| RNF05.3 | O schema do banco deve ser versionado no repositório (`supabase/schema.sql`). |
| RNF05.4 | Classes CSS reutilizáveis devem ser definidas em `@layer components` no Tailwind (`.card`, `.chip`, `.button-primary`, etc.). |

### RNF06 — Disponibilidade

| ID | Descrição |
|----|-----------|
| RNF06.1 | A aplicação deve estar hospedada e acessível 24/7 (dependente do Supabase e hosting). |
| RNF06.2 | A sala opera das 08:00 às 19:00 no fuso horário `America/Sao_Paulo` (configurável). |
| RNF06.3 | Fins de semana são bloqueados por padrão, mas configuráveis pelo admin. |

### RNF07 — Compatibilidade

| ID | Descrição |
|----|-----------|
| RNF07.1 | A aplicação deve funcionar nos navegadores Chrome, Firefox, Safari e Edge em suas versões mais recentes. |
| RNF07.2 | Fontes utilizadas: Plus Jakarta Sans (principal), Inter (formulários), Manrope (display), Material Symbols Outlined (ícones). |
| RNF07.3 | A aplicação deve ser servida via HTTPS. |

---

## 4. Regras de Negócio

| ID | Regra |
|----|-------|
| RN01 | Uma sala não pode ter duas reuniões simultâneas (sobreposição de horários é bloqueada por trigger). |
| RN02 | Reuniões não podem ser agendadas fora do horário de funcionamento configurado. |
| RN03 | Reuniões não podem ser agendadas em fins de semana quando `allow_weekends = false`. |
| RN04 | Todo participante deve ser um usuário registrado (`user_id`) ou um visitante identificado (`guest_name`). |
| RN05 | Visitantes confirmam presença via token único; tokens expirados ou já usados são rejeitados. |
| RN06 | O organizador é automaticamente adicionado como participante com `is_organizer = true`. |
| RN07 | Apenas o criador da reunião ou um admin pode cancelar a reunião inteira. |
| RN08 | Participantes não-criadores podem cancelar apenas sua própria presença. |
| RN09 | Novos usuários recebem `role = 'user'` por padrão; promoção a admin é feita manualmente. |
| RN10 | A tabela `room_config` é singleton (sempre 1 registro, `id = 1`). |
| RN11 | O campo `updated_at` é atualizado automaticamente por trigger em `profiles`, `meetings` e `room_config`. |

---

## 5. Modelo de Dados

### Tabelas

| Tabela | Descrição | Registros esperados |
|--------|-----------|-------------------|
| `profiles` | Perfis de usuários (extends `auth.users`) | Dezenas |
| `room_config` | Configuração da sala (singleton) | 1 |
| `meeting_series` | Regras de recorrência | Poucas unidades |
| `meetings` | Reuniões individuais (avulsas ou de série) | Centenas a milhares |
| `meeting_participants` | Participantes por reunião | Milhares |
| `meeting_notifications` | Lembretes agendados | Milhares |

### Relacionamentos

```
auth.users (1) ──── (1) profiles
profiles   (1) ──── (N) meetings          [created_by]
profiles   (1) ──── (N) meeting_series     [created_by]
profiles   (1) ──── (N) meeting_participants [user_id]
meeting_series (1) ──── (N) meetings       [series_id]
meetings   (1) ──── (N) meeting_participants
meetings   (1) ──── (N) meeting_notifications
```

---

## 6. Mapa de Páginas e Rotas

| Rota | Layout | Acesso | Descrição |
|------|--------|--------|-----------|
| `/login` | auth | Público | Login com e-mail/senha e OAuth |
| `/registro` | auth | Público | Cadastro de novo usuário |
| `/confirmar-email` | auth | Público | Mensagem pós-cadastro |
| `/confirmar-presenca` | auth | Público | Confirmação de visitante via token |
| `/` | default | Autenticado | Dashboard principal |
| `/agendar` | default | Autenticado | Etapa 1 — Detalhes da reunião |
| `/disponibilidade` | default | Autenticado | Etapa 2 — Seleção de horário |
| `/confirmar` | default | Autenticado | Etapa 3 — Revisão e confirmação |
| `/minhas-reunioes` | default | Autenticado | Histórico e convites |
| `/admin` | default | Admin | Painel administrativo |
