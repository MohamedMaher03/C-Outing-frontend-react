const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const pluralRulesCache = new Map<string, Intl.PluralRules>();

const METRO_STATION_TRANSLATIONS_AR: Record<string, string> = {
  abbassia: "العباسية",
  "abdou pasha": "عبده باشا",
  "adly mansour": "عدلي منصور",
  "ain helwan": "عين حلوان",
  "ain shams": "عين شمس",
  "alf maskan": "ألف مسكن",
  "al ahram": "الأهرام",
  "al bohy": "البوهي",
  "al demerdash": "الدمرداش",
  "al geish": "الجيش",
  "al haykestep": "الهايكستب",
  "al khalafawy": "الخلفاوي",
  "al kawmeiah": "القومية",
  "al malek al saleh": "الملك الصالح",
  "al maadi": "المعادي",
  "al maasara": "المعصرة",
  "al mezallat": "المظلات",
  "al monib": "المنيب",
  "al nozha": "النزهة",
  "al sayeda zeinab": "السيدة زينب",
  "al shohada": "الشهداء",
  "al tawfikia": "التوفيقية",
  "al zahraa": "الزهراء",
  attaba: "العتبة",
  "bab el shaaria": "باب الشعرية",
  behooth: "البحوث",
  "bulaq el dakroor": "بولاق الدكرور",
  "cairo fairground": "أرض المعارض",
  "cairo university": "جامعة القاهرة",
  "dar al salam": "دار السلام",
  dokki: "الدقي",
  "el-bohy": "البوهي",
  "el-demerdash": "الدمرداش",
  "el-geish": "الجيش",
  "el-haykestep": "الهايكستب",
  "el-maasara": "المعصرة",
  "el-matareyya": "المطرية",
  "el-monib": "المنيب",
  "el-nozha": "النزهة",
  "el-qawmia": "القومية",
  "el-zahraa": "الزهراء",
  "ezbet en nakhl": "عزبة النخل",
  faisal: "فيصل",
  "fair zone": "أرض المعارض",
  ghamra: "غمرة",
  giza: "الجيزة",
  haroun: "هارون",
  "hadayeq helwan": "حدائق حلوان",
  "hadayeq el zaitoun": "حدائق الزيتون",
  "hammamat el qobba": "حمامات القبة",
  heliopolis: "ميدان هليوبوليس",
  helwan: "حلوان",
  "helwan university": "جامعة حلوان",
  "helmeyet al zaitoun": "حلمية الزيتون",
  "hesham barakat": "هشام بركات",
  imbaba: "إمبابة",
  "kit-kat": "الكيت كات",
  "kit kat": "الكيت كات",
  kozzika: "كوتسيكا",
  "kobri al qobba": "كوبري القبة",
  "koliet el zeraa": "كلية الزراعة",
  "koleyet el banat": "كلية البنات",
  maadi: "المعادي",
  "maadi gardens": "حدائق المعادي",
  masarra: "مسرة",
  masbero: "ماسبيرو",
  "mar girgis": "مار جرجس",
  "mohamed naguib": "محمد نجيب",
  nasser: "جمال عبدالناصر",
  "new el marg": "المرج الجديدة",
  opera: "الأوبرا",
  "omm el misryeen": "أم المصريين",
  orabi: "أحمد عرابي",
  qobaa: "قباء",
  "rawd el farag": "روض الفرج",
  "rawd el farag axes": "محور روض الفرج",
  "rod el farag axes": "محور روض الفرج",
  "ring road": "الطريق الدائري",
  "saad zaghloul": "سعد زغلول",
  "sakiat mekki": "ساقية مكي",
  "sainte teresa": "سانت تريزا",
  "sakanat el maadi": "ثكنات المعادي",
  "sayyeda zeinab": "السيدة زينب",
  shuhada: "الشهداء",
  "shobra al kheima": "شبرا الخيمة",
  stadium: "الإستاد",
  sudan: "السودان",
  "thakanat el maadi": "ثكنات المعادي",
  "tora el asmant": "طرة الأسمنت",
  "tora el balad": "طرة البلد",
  "wadi el nile": "وادي النيل",
  "wadi hof": "وادي حوف",
  "al-kawmeiah": "القومية",
  "al-mezallat": "المظلات",
  "al-mounib": "المنيب",
  "al-tawfikia": "التوفيقية",
  "al-demerdash": "الدمرداش",
  "al-shohada": "الشهداء",
  "al-malek al-saleh": "الملك الصالح",
  "al-sayeda zeinab": "السيدة زينب",
  "al-zahraa": "الزهراء",
  "el shams club": "نادي الشمس",
  "el haykestep": "الهايكستب",
  "el nozzha": "النزهة",
  "gamat el dowal": "جامعة الدول العربية",
  "gamet el dowel": "جامعة الدول العربية",
  "heliopolis square": "ميدان هليوبوليس",
  "hammamat al qobba": "حمامات القبة",
  "manshiet al sadr": "منشية الصدر",
  "manshiet el sadr": "منشية الصدر",
  mezallat: "المظلات",
  "rod el farag corridor": "محور روض الفرج",
  "rod el-farag axes": "محور روض الفرج",
  "shubra el kheima": "شبرا الخيمة",
  "st. teresa": "سانت تريزا",
  tawfikia: "التوفيقية",
};

const METRO_TIME_PATTERN =
  /^(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes|m|km|hr|hrs|hour|hours)?$/i;

const normalizeMetroStationKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getLocale = (): string => {
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang?.trim();
    if (lang) return lang;
  }

  if (typeof navigator !== "undefined") {
    return navigator.language || "en";
  }

  return "en";
};

const toValidDate = (input: Date | string | number): Date | null => {
  const parsed = input instanceof Date ? input : new Date(input);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};

const getDateFormatter = (
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const locale = getLocale();
  const cacheKey = `${locale}:${JSON.stringify(options)}`;
  const cached = dateFormatterCache.get(cacheKey);
  if (cached) return cached;

  const next = new Intl.DateTimeFormat(locale, options);
  dateFormatterCache.set(cacheKey, next);
  return next;
};

const getNumberFormatter = (): Intl.NumberFormat => {
  const locale = getLocale();
  const cached = numberFormatterCache.get(locale);
  if (cached) return cached;

  const next = new Intl.NumberFormat(locale);
  numberFormatterCache.set(locale, next);
  return next;
};

const getPluralRules = (): Intl.PluralRules => {
  const locale = getLocale();
  const cached = pluralRulesCache.get(locale);
  if (cached) return cached;

  const next = new Intl.PluralRules(locale);
  pluralRulesCache.set(locale, next);
  return next;
};

export const formatShortDate = (
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale?: string,
): string => {
  const date = toValidDate(input);
  if (!date) return "-";

  if (locale) {
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  return getDateFormatter(options).format(date);
};

export const formatInteger = (value: number): string =>
  getNumberFormatter().format(Number.isFinite(value) ? value : 0);

export const formatCountLabel = (
  value: number,
  singular: string,
  plural = `${singular}s`,
): string => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const rule = getPluralRules().select(safeValue);
  return `${formatInteger(safeValue)} ${rule === "one" ? singular : plural}`;
};

export const isMetroMetricMissing = (value: string | undefined | null): boolean => {
  const trimmed = value?.trim() ?? "";
  return trimmed.length === 0 || trimmed === "-";
};

export const formatMetroStationTime = (
  value: string,
  locale?: string,
): string => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") return "-";

  if (!locale?.startsWith("ar")) {
    return trimmed;
  }

  const match = trimmed.match(METRO_TIME_PATTERN);
  if (!match) {
    return trimmed;
  }

  const duration = Number(match[1]);
  if (!Number.isFinite(duration)) {
    return trimmed;
  }

  const unit = match[2]?.toLowerCase();
  const formattedDuration = new Intl.NumberFormat(locale).format(duration);

  switch (unit) {
    case "min":
    case "mins":
    case "minute":
    case "minutes":
      return `${formattedDuration} ${duration === 1 ? "دقيقة" : "دقائق"}`;
    case "hr":
    case "hrs":
    case "hour":
    case "hours":
      return `${formattedDuration} ${duration === 1 ? "ساعة" : "ساعات"}`;
    case "m":
      return `${formattedDuration} م`;
    case "km":
      return `${formattedDuration} كم`;
    default:
      return formattedDuration;
  }
};

export const formatMetroStationName = (
  value: string,
  locale?: string,
): string => {
  const trimmed = value.trim();
  if (!trimmed) return "-";

  if (!locale?.startsWith("ar")) {
    return trimmed;
  }

  const normalized = normalizeMetroStationKey(trimmed);
  return METRO_STATION_TRANSLATIONS_AR[normalized] ?? trimmed;
};
