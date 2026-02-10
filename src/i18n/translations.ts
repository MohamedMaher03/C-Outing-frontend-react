/**
 * i18n Translations
 * English and Arabic translations for the application
 * Support for Arabic RTL layout
 */

export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      recommendations: "Recommendations",
      search: "Search",
      profile: "Profile",
      favorites: "Favorites",
      logout: "Logout",
    },

    // Authentication
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Full Name",
      age: "Age",
      loginButton: "Sign In",
      registerButton: "Create Account",
      noAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
    },

    // Recommendations
    recommendations: {
      title: "Recommended for You",
      loading: "Loading recommendations...",
      noResults: "No recommendations found",
      moodLabel: "What is your mood?",
      companionLabel: "Who are you going with?",
      budgetLabel: "Your budget?",
      timeLabel: "When do you want to go?",
    },

    // Venue Details
    venue: {
      rating: "Rating",
      sentiment: "Sentiment",
      category: "Category",
      location: "Location",
      distance: "Distance",
      hours: "Hours",
      phone: "Phone",
      website: "Website",
      reviews: "Reviews",
      viewDetails: "View Details",
      addToFavorites: "Add to Favorites",
      removeFromFavorites: "Remove from Favorites",
      rateThisVenue: "Rate This Venue",
    },

    // Common
    common: {
      loading: "Loading...",
      error: "An error occurred",
      retry: "Retry",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
    },

    // Moods
    moods: {
      relaxed: "Relaxed",
      energetic: "Energetic",
      social: "Social",
      romantic: "Romantic",
    },

    // Companions
    companions: {
      solo: "Solo",
      friends: "With Friends",
      family: "With Family",
      partner: "With Partner",
    },

    // Budget
    budget: {
      low: "Budget",
      medium: "Moderate",
      high: "Luxury",
    },

    // Time
    time: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
    },
  },

  ar: {
    // Navigation
    nav: {
      home: "الرئيسية",
      recommendations: "التوصيات",
      search: "بحث",
      profile: "الملف الشخصي",
      favorites: "المفضلة",
      logout: "تسجيل الخروج",
    },

    // Authentication
    auth: {
      login: "تسجيل الدخول",
      register: "تسجيل جديد",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      name: "الاسم الكامل",
      age: "العمر",
      loginButton: "دخول",
      registerButton: "إنشاء حساب",
      noAccount: "ليس لديك حساب؟",
      alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    },

    // Recommendations
    recommendations: {
      title: "موصى به لك",
      loading: "جاري تحميل التوصيات...",
      noResults: "لم يتم العثور على توصيات",
      moodLabel: "ما مزاجك؟",
      companionLabel: "مع من ستذهب؟",
      budgetLabel: "ميزانيتك؟",
      timeLabel: "متى تريد الذهاب؟",
    },

    // Venue Details
    venue: {
      rating: "التقييم",
      sentiment: "المشاعر",
      category: "الفئة",
      location: "الموقع",
      distance: "المسافة",
      hours: "ساعات العمل",
      phone: "الهاتف",
      website: "الموقع الإلكتروني",
      reviews: "التقييمات",
      viewDetails: "عرض التفاصيل",
      addToFavorites: "إضافة إلى المفضلة",
      removeFromFavorites: "إزالة من المفضلة",
      rateThisVenue: "قيم هذا المكان",
    },

    // Common
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ ما",
      retry: "إعادة محاولة",
      close: "إغلاق",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      search: "بحث",
      filter: "تصفية",
      sort: "فرز",
    },

    // Moods
    moods: {
      relaxed: "مرتاح",
      energetic: "نشيط",
      social: "اجتماعي",
      romantic: "رومانسي",
    },

    // Companions
    companions: {
      solo: "وحده",
      friends: "مع الأصدقاء",
      family: "مع العائلة",
      partner: "مع الشريك",
    },

    // Budget
    budget: {
      low: "اقتصادي",
      medium: "متوسط",
      high: "فاخر",
    },

    // Time
    time: {
      morning: "الصباح",
      afternoon: "بعد الظهر",
      evening: "المساء",
      night: "الليل",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["en"];

/**
 * Get translation for a given key and language
 */
export function t(key: string, language: Language): string {
  const keys = key.split(".");
  let value: unknown = translations[language];

  for (const k of keys) {
    if (typeof value === "object" && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === "string" ? value : key;
}
