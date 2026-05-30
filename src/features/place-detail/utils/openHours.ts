export const DAY_ORDER = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export interface ParsedDay {
  day: string;
  hours: string;
  isToday: boolean;
}

export interface GroupedHours {
  days: string[];
  hours: string;
  isToday: boolean;
}

export function parseHoursString(raw: string): ParsedDay[] {
  const todayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(new Date());

  const entries: ParsedDay[] = [];

  raw.split("|").forEach((segment) => {
    const trimmed = segment.trim();
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) return;

    const day = trimmed.slice(0, colonIdx).trim();
    const hours = trimmed.slice(colonIdx + 1).trim();
    entries.push({ day, hours, isToday: day === todayName });
  });

  entries.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return entries;
}

export function groupConsecutiveDays(days: ParsedDay[]): GroupedHours[] {
  const groups: GroupedHours[] = [];

  for (const entry of days) {
    const last = groups[groups.length - 1];
    if (last && last.hours === entry.hours) {
      last.days.push(entry.day);
      if (entry.isToday) last.isToday = true;
    } else {
      groups.push({
        days: [entry.day],
        hours: entry.hours,
        isToday: entry.isToday,
      });
    }
  }

  return groups;
}

export function formatDayRange(
  days: string[],
  localizeDay?: (day: string) => string,
): string {
  const displayDays = localizeDay ? days.map(localizeDay) : days;

  if (days.length === 1) return displayDays[0];
  if (days.length === 2) return `${displayDays[0]} & ${displayDays[1]}`;

  const indices = days.map((day) => DAY_ORDER.indexOf(day));
  const isConsecutive = indices.every(
    (idx, i) => i === 0 || idx === indices[i - 1] + 1,
  );

  if (isConsecutive)
    return `${displayDays[0]}-${displayDays[displayDays.length - 1]}`;

  return displayDays.join(", ");
}

const ARABIC_DIGITS: Record<string, string> = {
  "0": "٠",
  "1": "١",
  "2": "٢",
  "3": "٣",
  "4": "٤",
  "5": "٥",
  "6": "٦",
  "7": "٧",
  "8": "٨",
  "9": "٩",
};

function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[digit] ?? digit);
}

export function formatEgyptianHoursText(
  hours: string,
  isArabic: boolean,
): string {
  if (!isArabic || !hours) return hours;

  const timePattern = /(\d{1,2}(?::\d{2})?)\s*(AM|PM)/gi;

  return hours.replace(timePattern, (_, timeValue: string, marker: string) => {
    const normalizedMarker = marker.toUpperCase() === "AM" ? "ص" : "م";
    return `${toArabicDigits(timeValue)} ${normalizedMarker}`;
  });
}
