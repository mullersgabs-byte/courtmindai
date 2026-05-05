# Plano — CourtMind Premium

Reestruturar o app preto-e-branco minimalista (referência das mockups que você enviou) em um produto com cara de SaaS pronto para produção, mantendo a fonte atual (Inter) e elevando-a com o tratamento tipográfico estilo Apple (SF).

## 1. Sistema de design (base)
- **Tipografia Apple-like**: ativar `-apple-system, BlueprintHF, "SF Pro Display"` como primária com Inter como fallback. Escala consistente: Display 40/-3.5%, Title 28, Headline 20, Body 15, Caption 11 uppercase tracking 0.24em. Aplicar `font-feature-settings: "ss01","cv11","tnum"` para números tabulares.
- **Tokens em `src/styles.css`**: refinar `--surface-1/2/3` (fundos em camadas), `--hairline`, `--accent-press`, raios (`--r-card 28px`, `--r-pill 999px`), sombras (`--shadow-1` sutil, `--shadow-elev` em hover).
- **Microinterações globais**: classes utilitárias `.press` (scale 0.98 + shadow), `.shimmer`, `.skeleton`, `.fade-up`, `.tap-haptic` (ripple).
- **Componentes novos**: `Button` (variants: primary/ghost/quiet), `Card`, `StatTile`, `SectionHeader`, `EmptyState`, `LoadingSkeleton`, `Toast`, `Sheet` (bottom sheet iOS-style), `ProgressRing`.

## 2. Jornada do usuário
```text
/  (landing) ─► /onboarding (3 passos) ─► /home (dashboard)
                                          ├─ /training (sessão)
                                          ├─ /feedback (detalhe IA)
                                          ├─ /history (timeline)
                                          ├─ /plan (programa 6 sem.)
                                          └─ /profile (config)
```
- Landing já está no estilo. Polir hero card e CTA principal único ("Começar agora").
- Onboarding: 3 telas (esporte, nível, objetivo) com progress dots + transições suaves.
- TabBar inferior com 4 ícones (lucide) + indicador animado.

## 3. Home (impactante)
- Saudação personalizada + foto/inicial.
- **Hero "Próxima sessão"**: card preto com exercício sugerido do dia, duração estimada e botão "Começar".
- **Anel de progresso semanal** (ProgressRing SVG) — sessões da meta, minutos, calorias estimadas.
- Stats grid com números grandes (sessões, minutos, streak 🔥 substituído por ícone Flame).
- **Insights inteligentes**: card que mostra a métrica que mais melhorou ("Backhand: +18% precisão esta semana") — calculado do localStorage de feedbacks.
- Atividade recente com swipe-to-detail.
- Estados: empty ("Nenhum treino ainda — vamos começar?"), loading skeleton.

## 4. Training (sessão)
- Fluxo já existe; refinar:
  - Tela permission com 3 ícones (Camera, Lock, Eye-off) + cópia clara.
  - Gravação com timer grande, anel de progresso ao redor do botão record, badge "REC" pulsante.
  - Pós-análise: card de resultado com score em ProgressRing 0–100, verdict, listas com ícones (Check, AlertTriangle, ArrowUp).
  - Botão "Ver feedback completo" → /feedback.
  - Sucesso/erro via Toast (sonner).

## 5. Feedback / IA (diferenciação)
- Página com:
  - **Score circular grande** + delta vs sessão anterior.
  - Cards por dimensão (técnica, postura, ritmo) com barras.
  - Lista de "Pontos fortes" / "Erros detectados" / "Próximos passos" com ícones.
  - CTA "Iniciar plano de 6 semanas" → /plan.
- Histórico de scores (mini-chart SVG, sem libs).

## 6. Plan (programa curado)
- Lista das 6 semanas com check de conclusão, exercícios por sessão, % de progresso por semana.
- Botão "Marcar sessão concluída" alimenta streak e insights.

## 7. Profile / Settings
- Cabeçalho com avatar (upload), nome, esporte, nível, idioma.
- Seções: Conta, Preferências (tema, idioma, notificações), Plano ativo, Privacidade, Sobre.
- Toggle de notificações que dispara `Notification.requestPermission()` e agenda lembrete diário simples.
- Botão sair com confirmação (AlertDialog).

## 8. Engajamento
- **Streak diária** + badge ao bater marcos (3, 7, 30 dias) — armazenado em localStorage.
- **Meta semanal** configurável no perfil (default 4 sessões), exibida no anel da Home.
- **Toasts contextuais**: "+1 sessão • streak 5 dias", "Recorde de score!".
- Notificação local opcional 1x/dia se logado e sem treino do dia.

## 9. Estados (loading / erro / vazio)
- Skeletons em Home e History durante hidratação.
- ErrorBoundary por rota (TanStack `errorComponent`) com cópia útil + retry.
- EmptyState reutilizável com ícone, título, descrição e CTA.

## 10. i18n
- Auditar todas as chaves novas em PT/EN/ES/FR (insights, badges, toasts, settings).

## 11. Qualidade / produção
- Tipos estritos nos novos hooks (`useStreak`, `useWeeklyStats`, `useInsights`).
- Animações via CSS (sem libs extras).
- Sem emojis (regra já estabelecida) — todos os ícones via `lucide-react`.

## Detalhes técnicos
- Arquivos novos: `src/components/ui-app/{Button,Card,StatTile,SectionHeader,EmptyState,ProgressRing,Sheet}.tsx`, `src/lib/insights.ts`, `src/lib/streak.ts`, `src/hooks/useWeeklyStats.ts`.
- Arquivos editados: `src/styles.css` (tokens + escala tipográfica), `src/routes/index.tsx`, `home.tsx`, `training.tsx`, `feedback.tsx`, `plan.tsx`, `profile.tsx`, `onboarding.tsx`, `history.tsx`, `__root.tsx` (Sonner Toaster + ErrorBoundary), `TabBar.tsx` (ícones lucide + indicador animado), `i18n.tsx`.
- Sem novas dependências (lucide-react e sonner já estão no projeto).
- Dados continuam em localStorage (já temos Cloud, mas o overhaul é UX/UI; podemos plugar persistência depois sem reescrever telas).

Ao aprovar, eu implemento na sequência: design system → Home/TabBar → Training/Feedback → Plan/Profile → Engajamento (streak/insights) → polimento e i18n.
