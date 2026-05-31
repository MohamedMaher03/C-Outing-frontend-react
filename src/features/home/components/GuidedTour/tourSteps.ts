export interface TourStep {
  id: string;
  target: string | null;
  placement: "top" | "bottom" | "left" | "right" | "center";
  accentIcon: "sparkles" | "heart" | "star" | "map" | "compass" | "wand";
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  badges?: {
    icon: "like" | "heart" | "star";
    label: { en: string; ar: string };
  }[];
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "tour-curated",
    target: "tour-curated",
    placement: "top",
    accentIcon: "star",
    title: {
      en: "Your personal Cairo radar.",
      ar: "رادارك الشخصي في القاهرة.",
    },
    body: {
      en: "Every card here is picked specifically for you — not random, not generic. Like, save, or review places and these recommendations sharpen over time.",
      ar: "كل بطاقة هنا اتختارت ليك إنت بالظبط — مش عشوائي ومش لحد تاني. أعجب، احفظ، أو قيّم وهتلاقي التوصيات بتتحسن مع كل خطوة.",
    },
    badges: [
      {
        icon: "like",
        label: { en: "Like a place", ar: "أعجب بمكان" },
      },
      {
        icon: "heart",
        label: { en: "Save for later", ar: "احفظه لبعدين" },
      },
      {
        icon: "star",
        label: { en: "Leave a review", ar: "اكتب رأيك" },
      },
    ],
  },

  {
    id: "tour-mood",
    target: "tour-mood",
    placement: "top",
    accentIcon: "wand",
    title: {
      en: "Pick a mood — we'll handle the rest.",
      ar: "إختار حالتك دلوقتي — وأحنا هنكمّل الشغل.",
    },
    body: {
      en: "Romantic evening? Lazy chill? Solo adventure? Pick your vibe and we instantly surface a lineup of places that match your energy — perfectly.",
      ar: "سهرة رومانسية؟ يوم راحة؟ طلعة لوحدك؟ اختار مزاجك وهنجهزلك على الفور قايمة أماكن بتتناسب مع حالتك بالظبط.",
    },
  },

  {
    id: "tour-discovery",
    target: "tour-discovery",
    placement: "top",
    accentIcon: "compass",
    title: {
      en: "5 ways to explore.",
      ar: "٥ طرق للاستكشاف.",
    },
    body: {
      en: "Switch between Top-Rated city-wide, Near Me, By District, By Venue Type, or By Budget. Every switch updates the feed instantly.",
      ar: "غيّر بين الأعلى تقييماً، الأقرب ليك، حسب الحي، نوع المكان، أو الميزانية. كل اختيار بيغيّر النتايج على الفور.",
    },
  },

  {
    id: "tour-similar",
    target: "tour-similar",
    placement: "top",
    accentIcon: "sparkles",
    title: {
      en: "Love a place? Find more places just like it.",
      ar: "عجبك مكان؟ هنجبلك أماكن تانية زيّه .",
    },
    body: {
      en: "Type any venue name in the Similar Places Studio and we instantly finds places that share the same vibe, quality, and price range.",
      ar: "اكتب اسم أي مكان في ستوديو الأماكن المشابهة واحنا هنجبلك أماكن بنفس الجو والجودة والسعر.",
    },
  },

  {
    id: "tour-group",
    target: "tour-group",
    placement: "bottom",
    accentIcon: "heart",
    title: {
      en: "Can't agree on where to go? Plan together.",
      ar: "مش قادرين تتفقوا فين تروحوا؟ خططوا مع بعض.",
    },
    body: {
      en: "Start a Group Session, invite your friends, and let everyone vote on venues in real time. The winning spot rises to the top — no arguments, just plans.",
      ar: "ابدأ جلسة جماعية، ادعوا أصحابك، وخلّوا كل واحد يصوّت على الأماكن في نفس الوقت. المكان اللي عجب الكل بيطلع فوق — من غير جدال، بس تخطيط.",
    },
  },

  {
    id: "tour-map-nav",
    target: "tour-map-nav",
    placement: "bottom",
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
