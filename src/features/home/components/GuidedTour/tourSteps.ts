export interface TourStep {
  id: string;
  /** null = no spotlight (fullscreen modal step) */
  target: string | null;
  placement: "top" | "bottom" | "left" | "right" | "center";
  emoji: string;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  /** Optional icon name used for decoration */
  accentIcon?: "sparkles" | "heart" | "star" | "map" | "compass" | "wand";
  /** Interaction badges shown under body */
  badges?: { icon: string; label: { en: string; ar: string } }[];
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "tour-welcome",
    target: null,
    placement: "center",
    emoji: "✨",
    accentIcon: "sparkles",
    title: {
      en: "Your Cairo. Your vibe. Discovered.",
      ar: "القاهرة على مزاجك — اكتشفها بطريقتك.",
    },
    body: {
      en: "C-Outing learns what you love — from cafés to rooftops, budget bites to fine dining — and turns that into hand-picked recommendations that feel made just for you.",
      ar: "C-Outing بيتعلم ذوقك كويس — من المقاهي والروفتوب لحد المطاعم الفاخرة — وبيحولها في توصيات مخصوصة ليك إنت بالظبط، مش زيّ أي حد.",
    },
  },

  {
    id: "tour-interactions",
    target: null,
    placement: "center",
    emoji: "🎯",
    accentIcon: "heart",
    title: {
      en: "The more you interact, the smarter it gets.",
      ar: "كل ما تتفاعل أكتر، كل ما التوصيات بقت أذكى وأدق.",
    },
    body: {
      en: "Every action you take teaches the system your taste. Like a place, save it, or drop a review — and watch your recommendations sharpen over time.",
      ar: "كل حاجة بتعملها بتعلّم النظام ذوقك. أعجب بمكان، احفظه، أو اكتب رأيك — وهتلاقي التوصيات بتتحسن مع كل خطوة.",
    },
    badges: [
      {
        icon: "❤️",
        label: { en: "Like a place", ar: "أعجب بمكان" },
      },
      {
        icon: "🔖",
        label: { en: "Save for later", ar: "احفظه لبعدين" },
      },
      {
        icon: "⭐",
        label: { en: "Leave a review", ar: "اكتب رأيك" },
      },
    ],
  },

  {
    id: "tour-curated",
    target: "tour-curated",
    placement: "top",
    emoji: "🌟",
    accentIcon: "star",
    title: {
      en: "Curated for You — places that truly get you.",
      ar: "مختار ليك — أماكن بتفهمك من غير ما تشرح.",
    },
    body: {
      en: "This section is your personal radar. Every card here is picked specifically for you not random, not generic.",
      ar: "القسم ده هو رادارك الشخصي خالص. كل بطاقة فيه اتختارت ليك إنت مش عشوائي ولا موجّه لحد تاني غيرك.",
    },
  },

  {
    id: "tour-discovery",
    target: "tour-discovery",
    placement: "top",
    emoji: "🧭",
    accentIcon: "compass",
    title: {
      en: "Explore Cairo on your own terms.",
      ar: "استكشف القاهرة على مزاجك إنت.",
    },
    body: {
      en: "Switch between Top-Rated city-wide, best by district, by venue type, or by budget. Results update live — no refresh, no waiting.",
      ar: "غيّر بين الأعلى تقييماً في القاهرة كلها، أو الأفضل في حيّك، أو حسب النوع والميزانية. النتايج بتتحدث على طول — من غير ما تعمل ريفريش.",
    },
  },

  {
    id: "tour-mood",
    target: "tour-mood",
    placement: "top",
    emoji: "🎭",
    accentIcon: "wand",
    title: {
      en: "Pick a mood — we'll handle the rest.",
      ar: "إختار حالتك دلوقتي — وأحنا هنكمّل الشغل.",
    },
    body: {
      en: "Romantic evening? Lazy chill? Solo adventure? Pick your vibe and we instantly curate a playlist of places that match your energy — perfectly.",
      ar: "سهرة رومانسية؟ يوم راحة وكسل؟ طلعة لوحدك؟ اختار حالتك وهنجهزلك قايمة من الأماكن اللي بتناسب مزاجك بالظبط — على الفور.",
    },
  },

  {
    id: "tour-map-nav",
    target: "tour-map-nav",
    placement: "bottom",
    emoji: "🗺️",
    accentIcon: "map",
    title: {
      en: "See Cairo come alive on the map.",
      ar: "شوف القاهرة بعيونك — كل مكان على الخريطة.",
    },
    body: {
      en: "Tap Map to see every venue pinned live on an interactive map. Explore by neighborhood, spot hidden gems nearby, and plan your next outing at a glance.",
      ar: "اضغط على الخريطة وشوف كل الأماكن متحطوطة قدامك. استكشف حسب الحي، لقي أماكن قريبة منك مش معروفة، وخطّط طلعتك الجاية في لحظة.",
    },
  },
];
