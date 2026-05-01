import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Lightweight i18n: 4 languages, no dependency, persisted in storage */
/* ------------------------------------------------------------------ */

export const LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "pt", label: "Português", flag: "PT" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "fr", label: "Français", flag: "FR" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

/** Translation table. Missing keys fall back to the English copy, which then
 *  falls back to the key itself, so the app never shows a blank string. */
const dictionaries: Record<Lang, Dict> = {
  en: {
    /* Nav / common */
    "nav.method": "Method",
    "nav.capabilities": "Capabilities",
    "nav.disciplines": "Disciplines",
    "nav.signin": "Sign in",
    "nav.begin": "Begin",
    "nav.home": "Home",
    "nav.training": "Training",
    "nav.analyze": "Analyze",
    "nav.plan": "Plan",
    "nav.archive": "Archive",
    "nav.profile": "Profile",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.signout": "Sign out",
    "common.guest": "Guest",
    "common.signedin": "Signed in",
    "common.language": "Language",

    /* Landing */
    "landing.edition": "Edition 01 · Athletic Intelligence",
    "landing.hero.line1a": "Train with",
    "landing.hero.line1b": "clarity.",
    "landing.hero.line2a": "Improve with",
    "landing.hero.line2b": "intent.",
    "landing.hero.copy":
      "CourtMind is a quiet, deliberate system for athletes who measure progress in inches, not impressions. It reads your training, finds the gap, and tells you exactly what to do next.",
    "landing.cta.start": "Start your assessment",
    "landing.cta.preview": "Preview the system",
    "landing.philosophy.label": "A note on philosophy",
    "landing.capabilities.label": "Capabilities",
    "landing.capabilities.title.a": "Everything you need.",
    "landing.capabilities.title.b": "Nothing you don't.",
    "landing.capabilities.copy":
      "Four capabilities. Composed to feel like one quiet, intelligent companion.",
    "landing.method.label": "The Method",
    "landing.method.title.a": "Four movements,",
    "landing.method.title.b": "one continuous practice.",
    "landing.disciplines.label": "Disciplines",
    "landing.disciplines.title.a": "One system.",
    "landing.disciplines.title.b": "Many practices.",
    "landing.disciplines.copy":
      "Metrics, drills and feedback adapt to the discipline you actually train.",
    "landing.closing.title.a": "Stop guessing.",
    "landing.closing.title.b": "Start improving.",
    "landing.closing.note": "No credit card. Two minutes.",
    "footer.system": "System",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.tagline": "Train with clarity.",
    "footer.copy": "An intelligent training system for athletes who take performance seriously.",

    /* Auth */
    "auth.welcome": "Welcome",
    "auth.welcome.italic": "back.",
    "auth.create": "Create your",
    "auth.create.italic": "account.",
    "auth.subtitle.signin": "Sign in to continue your training.",
    "auth.subtitle.signup": "Start your athletic intelligence journey.",
    "auth.email": "you@email.com",
    "auth.password": "Password (min 6 chars)",
    "auth.signin": "Sign in",
    "auth.signup": "Create account",
    "auth.forgot": "Forgot password?",
    "auth.need.account": "Need an account? Create one",
    "auth.have.account": "Have an account? Sign in",

    /* Home */
    "home.greeting.morning": "Good morning",
    "home.greeting.afternoon": "Good afternoon",
    "home.greeting.evening": "Good evening",
    "home.headline.a": "Today is for",
    "home.headline.b": "precision.",
    "home.subhead":
      "A focused tennis session is queued. Your last analysis showed cleaner footwork — let's keep that line.",
    "home.section.today": "Today's training",
    "home.section.continue": "Continue where you left off",
    "home.section.programs": "Recommended programs",
    "home.section.journal": "From the journal",
    "home.cta.start": "Start training",
    "home.cta.send": "Send training",
    "home.cta.viewall": "View all →",
    "home.cta.explore": "Explore →",
    "home.plancompletion": "Plan completion",

    /* Training */
    "training.title": "Training",
    "training.headline.a": "Train with",
    "training.headline.b": "composure.",
    "training.subhead":
      "Seven sessions composed for this week. Check in every day to keep momentum honest.",
    "training.checkin.title": "Daily check-in",
    "training.checkin.energy": "Energy today",
    "training.checkin.soreness": "Soreness",
    "training.checkin.save": "Save check-in",
    "training.checkin.saved": "Saved · auto-synced",

    /* Plan */
    "plan.title": "Weekly plan",
    "plan.cta.generate": "Generate plan",
    "plan.cta.regenerate": "Regenerate plan",
    "plan.cta.composing": "Composing your week…",
    "plan.insights.cta": "Generate from my errors",
    "plan.insights.composing": "Composing…",

    /* Analyze */
    "analyze.title": "Analyze",

    /* 404 */
    "notfound.title": "This page doesn't exist.",
    "notfound.cta": "Return home",
  },

  pt: {
    "nav.method": "Método",
    "nav.capabilities": "Recursos",
    "nav.disciplines": "Modalidades",
    "nav.signin": "Entrar",
    "nav.begin": "Começar",
    "nav.home": "Início",
    "nav.training": "Treinos",
    "nav.analyze": "Analisar",
    "nav.plan": "Plano",
    "nav.archive": "Histórico",
    "nav.profile": "Perfil",
    "common.back": "Voltar",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.close": "Fechar",
    "common.signout": "Sair",
    "common.guest": "Convidado",
    "common.signedin": "Conectado",
    "common.language": "Idioma",

    "landing.edition": "Edição 01 · Inteligência Atlética",
    "landing.hero.line1a": "Treine com",
    "landing.hero.line1b": "clareza.",
    "landing.hero.line2a": "Evolua com",
    "landing.hero.line2b": "intenção.",
    "landing.hero.copy":
      "CourtMind é um sistema silencioso e deliberado para atletas que medem progresso em centímetros, não em impressões. Lê seu treino, encontra a lacuna e diz exatamente o próximo passo.",
    "landing.cta.start": "Começar avaliação",
    "landing.cta.preview": "Ver o sistema",
    "landing.philosophy.label": "Uma nota sobre filosofia",
    "landing.capabilities.label": "Recursos",
    "landing.capabilities.title.a": "Tudo o que você precisa.",
    "landing.capabilities.title.b": "Nada do que não precisa.",
    "landing.capabilities.copy":
      "Quatro recursos. Compostos para parecer um companheiro silencioso e inteligente.",
    "landing.method.label": "O Método",
    "landing.method.title.a": "Quatro movimentos,",
    "landing.method.title.b": "uma prática contínua.",
    "landing.disciplines.label": "Modalidades",
    "landing.disciplines.title.a": "Um sistema.",
    "landing.disciplines.title.b": "Muitas práticas.",
    "landing.disciplines.copy":
      "Métricas, exercícios e feedback se adaptam à modalidade que você realmente treina.",
    "landing.closing.title.a": "Pare de adivinhar.",
    "landing.closing.title.b": "Comece a evoluir.",
    "landing.closing.note": "Sem cartão de crédito. Dois minutos.",
    "footer.system": "Sistema",
    "footer.company": "Empresa",
    "footer.legal": "Legal",
    "footer.tagline": "Treine com clareza.",
    "footer.copy":
      "Um sistema de treino inteligente para atletas que levam a performance a sério.",

    "auth.welcome": "Bem-vindo de",
    "auth.welcome.italic": "volta.",
    "auth.create": "Crie sua",
    "auth.create.italic": "conta.",
    "auth.subtitle.signin": "Entre para continuar seu treino.",
    "auth.subtitle.signup": "Comece sua jornada de inteligência atlética.",
    "auth.email": "voce@email.com",
    "auth.password": "Senha (mín. 6 caracteres)",
    "auth.signin": "Entrar",
    "auth.signup": "Criar conta",
    "auth.forgot": "Esqueceu a senha?",
    "auth.need.account": "Não tem conta? Crie uma",
    "auth.have.account": "Já tem conta? Entrar",

    "home.greeting.morning": "Bom dia",
    "home.greeting.afternoon": "Boa tarde",
    "home.greeting.evening": "Boa noite",
    "home.headline.a": "Hoje é dia de",
    "home.headline.b": "precisão.",
    "home.subhead":
      "Sua sessão de hoje está pronta. Sua última análise mostrou movimentos mais limpos — vamos manter essa linha.",
    "home.section.today": "Treino de hoje",
    "home.section.continue": "Continue de onde parou",
    "home.section.programs": "Programas recomendados",
    "home.section.journal": "Do diário",
    "home.cta.start": "Iniciar treino",
    "home.cta.send": "Enviar treino",
    "home.cta.viewall": "Ver todos →",
    "home.cta.explore": "Explorar →",
    "home.plancompletion": "Plano concluído",

    "training.title": "Treinos",
    "training.headline.a": "Treine com",
    "training.headline.b": "compostura.",
    "training.subhead":
      "Sete sessões compostas para esta semana. Faça o check-in todo dia para manter o ritmo.",
    "training.checkin.title": "Check-in diário",
    "training.checkin.energy": "Energia hoje",
    "training.checkin.soreness": "Dor muscular",
    "training.checkin.save": "Salvar check-in",
    "training.checkin.saved": "Salvo · sincronizado",

    "plan.title": "Plano semanal",
    "plan.cta.generate": "Gerar plano",
    "plan.cta.regenerate": "Gerar novamente",
    "plan.cta.composing": "Compondo sua semana…",
    "plan.insights.cta": "Gerar a partir dos meus erros",
    "plan.insights.composing": "Compondo…",

    "analyze.title": "Analisar",

    "notfound.title": "Esta página não existe.",
    "notfound.cta": "Voltar ao início",
  },

  es: {
    "nav.method": "Método",
    "nav.capabilities": "Capacidades",
    "nav.disciplines": "Disciplinas",
    "nav.signin": "Entrar",
    "nav.begin": "Empezar",
    "nav.home": "Inicio",
    "nav.training": "Entrenos",
    "nav.analyze": "Analizar",
    "nav.plan": "Plan",
    "nav.archive": "Historial",
    "nav.profile": "Perfil",
    "common.back": "Volver",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.close": "Cerrar",
    "common.signout": "Salir",
    "common.guest": "Invitado",
    "common.signedin": "Conectado",
    "common.language": "Idioma",

    "landing.edition": "Edición 01 · Inteligencia Atlética",
    "landing.hero.line1a": "Entrena con",
    "landing.hero.line1b": "claridad.",
    "landing.hero.line2a": "Mejora con",
    "landing.hero.line2b": "intención.",
    "landing.hero.copy":
      "CourtMind es un sistema silencioso y deliberado para atletas que miden el progreso en centímetros, no en impresiones. Lee tu entrenamiento, encuentra la brecha y te dice exactamente qué hacer.",
    "landing.cta.start": "Comenzar evaluación",
    "landing.cta.preview": "Ver el sistema",
    "landing.philosophy.label": "Una nota sobre filosofía",
    "landing.capabilities.label": "Capacidades",
    "landing.capabilities.title.a": "Todo lo que necesitas.",
    "landing.capabilities.title.b": "Nada que no necesites.",
    "landing.capabilities.copy":
      "Cuatro capacidades. Compuestas para sentirse como un compañero silencioso e inteligente.",
    "landing.method.label": "El Método",
    "landing.method.title.a": "Cuatro movimientos,",
    "landing.method.title.b": "una práctica continua.",
    "landing.disciplines.label": "Disciplinas",
    "landing.disciplines.title.a": "Un sistema.",
    "landing.disciplines.title.b": "Muchas prácticas.",
    "landing.disciplines.copy":
      "Las métricas, ejercicios y feedback se adaptan a la disciplina que realmente entrenas.",
    "landing.closing.title.a": "Deja de adivinar.",
    "landing.closing.title.b": "Empieza a mejorar.",
    "landing.closing.note": "Sin tarjeta. Dos minutos.",
    "footer.system": "Sistema",
    "footer.company": "Empresa",
    "footer.legal": "Legal",
    "footer.tagline": "Entrena con claridad.",
    "footer.copy":
      "Un sistema de entrenamiento inteligente para atletas que toman en serio el rendimiento.",

    "auth.welcome": "Bienvenido de",
    "auth.welcome.italic": "vuelta.",
    "auth.create": "Crea tu",
    "auth.create.italic": "cuenta.",
    "auth.subtitle.signin": "Inicia sesión para continuar tu entrenamiento.",
    "auth.subtitle.signup": "Comienza tu viaje de inteligencia atlética.",
    "auth.email": "tu@email.com",
    "auth.password": "Contraseña (mín. 6 caracteres)",
    "auth.signin": "Entrar",
    "auth.signup": "Crear cuenta",
    "auth.forgot": "¿Olvidaste tu contraseña?",
    "auth.need.account": "¿No tienes cuenta? Crea una",
    "auth.have.account": "¿Tienes cuenta? Entra",

    "home.greeting.morning": "Buenos días",
    "home.greeting.afternoon": "Buenas tardes",
    "home.greeting.evening": "Buenas noches",
    "home.headline.a": "Hoy es día de",
    "home.headline.b": "precisión.",
    "home.subhead":
      "Tu sesión de hoy está lista. Tu último análisis mostró un juego de pies más limpio — sigamos esa línea.",
    "home.section.today": "Entreno de hoy",
    "home.section.continue": "Continúa donde lo dejaste",
    "home.section.programs": "Programas recomendados",
    "home.section.journal": "Del diario",
    "home.cta.start": "Empezar entreno",
    "home.cta.send": "Enviar entreno",
    "home.cta.viewall": "Ver todos →",
    "home.cta.explore": "Explorar →",
    "home.plancompletion": "Plan completado",

    "training.title": "Entrenos",
    "training.headline.a": "Entrena con",
    "training.headline.b": "compostura.",
    "training.subhead":
      "Siete sesiones compuestas para esta semana. Haz check-in cada día para mantener el ritmo.",
    "training.checkin.title": "Check-in diario",
    "training.checkin.energy": "Energía hoy",
    "training.checkin.soreness": "Dolor muscular",
    "training.checkin.save": "Guardar check-in",
    "training.checkin.saved": "Guardado · sincronizado",

    "plan.title": "Plan semanal",
    "plan.cta.generate": "Generar plan",
    "plan.cta.regenerate": "Regenerar plan",
    "plan.cta.composing": "Componiendo tu semana…",
    "plan.insights.cta": "Generar desde mis errores",
    "plan.insights.composing": "Componiendo…",

    "analyze.title": "Analizar",

    "notfound.title": "Esta página no existe.",
    "notfound.cta": "Volver al inicio",
  },

  fr: {
    "nav.method": "Méthode",
    "nav.capabilities": "Capacités",
    "nav.disciplines": "Disciplines",
    "nav.signin": "Connexion",
    "nav.begin": "Commencer",
    "nav.home": "Accueil",
    "nav.training": "Entraînement",
    "nav.analyze": "Analyser",
    "nav.plan": "Plan",
    "nav.archive": "Archives",
    "nav.profile": "Profil",
    "common.back": "Retour",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.close": "Fermer",
    "common.signout": "Déconnexion",
    "common.guest": "Invité",
    "common.signedin": "Connecté",
    "common.language": "Langue",

    "landing.edition": "Édition 01 · Intelligence Athlétique",
    "landing.hero.line1a": "Entraîne-toi avec",
    "landing.hero.line1b": "clarté.",
    "landing.hero.line2a": "Progresse avec",
    "landing.hero.line2b": "intention.",
    "landing.hero.copy":
      "CourtMind est un système discret et délibéré pour les athlètes qui mesurent le progrès en centimètres, pas en impressions. Il lit ton entraînement, trouve l'écart et te dit exactement quoi faire ensuite.",
    "landing.cta.start": "Commencer l'évaluation",
    "landing.cta.preview": "Aperçu du système",
    "landing.philosophy.label": "Une note sur la philosophie",
    "landing.capabilities.label": "Capacités",
    "landing.capabilities.title.a": "Tout ce qu'il vous faut.",
    "landing.capabilities.title.b": "Rien de superflu.",
    "landing.capabilities.copy":
      "Quatre capacités. Composées pour ressembler à un compagnon discret et intelligent.",
    "landing.method.label": "La Méthode",
    "landing.method.title.a": "Quatre mouvements,",
    "landing.method.title.b": "une pratique continue.",
    "landing.disciplines.label": "Disciplines",
    "landing.disciplines.title.a": "Un système.",
    "landing.disciplines.title.b": "Plusieurs pratiques.",
    "landing.disciplines.copy":
      "Métriques, exercices et retours s'adaptent à la discipline que vous pratiquez vraiment.",
    "landing.closing.title.a": "Arrête de deviner.",
    "landing.closing.title.b": "Commence à progresser.",
    "landing.closing.note": "Sans carte. Deux minutes.",
    "footer.system": "Système",
    "footer.company": "Entreprise",
    "footer.legal": "Légal",
    "footer.tagline": "Entraîne-toi avec clarté.",
    "footer.copy":
      "Un système d'entraînement intelligent pour les athlètes qui prennent la performance au sérieux.",

    "auth.welcome": "Bon retour",
    "auth.welcome.italic": "parmi nous.",
    "auth.create": "Créez votre",
    "auth.create.italic": "compte.",
    "auth.subtitle.signin": "Connectez-vous pour continuer votre entraînement.",
    "auth.subtitle.signup": "Commencez votre parcours d'intelligence athlétique.",
    "auth.email": "vous@email.com",
    "auth.password": "Mot de passe (min. 6 car.)",
    "auth.signin": "Se connecter",
    "auth.signup": "Créer un compte",
    "auth.forgot": "Mot de passe oublié ?",
    "auth.need.account": "Pas de compte ? Créez-en un",
    "auth.have.account": "Vous avez un compte ? Connectez-vous",

    "home.greeting.morning": "Bonjour",
    "home.greeting.afternoon": "Bon après-midi",
    "home.greeting.evening": "Bonsoir",
    "home.headline.a": "Aujourd'hui c'est",
    "home.headline.b": "précision.",
    "home.subhead":
      "Une séance de tennis t'attend. Ta dernière analyse montre un meilleur jeu de jambes — gardons cette ligne.",
    "home.section.today": "Entraînement du jour",
    "home.section.continue": "Reprends là où tu t'es arrêté",
    "home.section.programs": "Programmes recommandés",
    "home.section.journal": "Du journal",
    "home.cta.start": "Démarrer la séance",
    "home.cta.send": "Envoyer la séance",
    "home.cta.viewall": "Tout voir →",
    "home.cta.explore": "Explorer →",
    "home.plancompletion": "Plan complété",

    "training.title": "Entraînement",
    "training.headline.a": "Entraîne-toi avec",
    "training.headline.b": "calme.",
    "training.subhead":
      "Sept séances composées pour cette semaine. Check-in chaque jour pour garder l'élan.",
    "training.checkin.title": "Check-in quotidien",
    "training.checkin.energy": "Énergie du jour",
    "training.checkin.soreness": "Courbatures",
    "training.checkin.save": "Enregistrer",
    "training.checkin.saved": "Enregistré · synchronisé",

    "plan.title": "Plan hebdomadaire",
    "plan.cta.generate": "Générer le plan",
    "plan.cta.regenerate": "Régénérer",
    "plan.cta.composing": "Composition de ta semaine…",
    "plan.insights.cta": "Générer depuis mes erreurs",
    "plan.insights.composing": "Composition…",

    "analyze.title": "Analyser",

    "notfound.title": "Cette page n'existe pas.",
    "notfound.cta": "Retour à l'accueil",
  },
};

const STORAGE_KEY = "courtmind.lang.v1";

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && dictionaries[stored]) return stored;
  const nav = (window.navigator.language || "en").slice(0, 2).toLowerCase();
  if (nav === "pt" || nav === "es" || nav === "fr") return nav;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always render English on the server to keep SSR markup deterministic; the
  // client effect immediately swaps to the persisted/browser language.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectInitialLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {}
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang] ?? dictionaries.en;
      return dict[key] ?? dictionaries.en[key] ?? key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Defensive fallback so a missing provider never crashes a page.
    return {
      lang: "en" as Lang,
      setLang: () => {},
      t: (key: string) => dictionaries.en[key] ?? key,
    };
  }
  return ctx;
}