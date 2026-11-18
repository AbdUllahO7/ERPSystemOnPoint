export const WEEK_DAYS = [
  { key: "Sunday", en: "Sunday", ar: "الأحد" },
  { key: "Monday", en: "Monday", ar: "الإثنين" },
  { key: "Tuesday", en: "Tuesday", ar: "الثلاثاء" },
  { key: "Wednesday", en: "Wednesday", ar: "الأربعاء" },
  { key: "Thursday", en: "Thursday", ar: "الخميس" },
  { key: "Friday", en: "Friday", ar: "الجمعة" },
  { key: "Saturday", en: "Saturday", ar: "السبت" },
];

export const ABSENCE_POLICIES = [
  { value: "Standard", en: "Standard Deduction", ar: "خصم قياسي" },
  { value: "FullDayDeduction", en: "Full Day Deduction", ar: "خصم يوم كامل" },
  { value: "HalfDayDeduction", en: "Half Day Deduction", ar: "خصم نصف يوم" },
  { value: "SalaryPercentage", en: "Salary Deduction", ar: "خصم من الراتب" },
  { value: "Warning", en: "Warning Letter", ar: "إنذار إداري" },
  { value: "None", en: "No Action", ar: "بدون إجراء" },
];

/**
 * Convert time string "HH:mm" or "HH:mm:ss" to TimeSpan ticks (1 tick = 100ns)
 */
export function timeStringToTicks(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(":");
  const hours = Number(parts[0]) || 0;
  const minutes = Number(parts[1]) || 0;
  const seconds = Number(parts[2]) || 0;
  // 1 second = 10,000,000 ticks
  return (hours * 3600 + minutes * 60 + seconds) * 10_000_000;
}

/**
 * Convert ticks (or TimeSpan object or string) to "HH:mm"
 */
export function ticksToTimeString(ticksOrObj) {
  if (!ticksOrObj) return "00:00";

  // If already string like "09:00:00" or "09:00"
  if (typeof ticksOrObj === "string") {
    const parts = ticksOrObj.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return ticksOrObj;
  }

  // If object has hours and minutes directly
  if (typeof ticksOrObj === "object") {
    if (ticksOrObj.hours !== undefined && ticksOrObj.minutes !== undefined) {
      const h = String(ticksOrObj.hours).padStart(2, "0");
      const m = String(ticksOrObj.minutes).padStart(2, "0");
      return `${h}:${m}`;
    }
  }

  const ticks = typeof ticksOrObj === "object" ? ticksOrObj.ticks : ticksOrObj;
  if (!ticks || isNaN(ticks)) return "00:00";

  const totalSeconds = Math.floor(Number(ticks) / 10_000_000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Normalizes weekend days into an array of day names
 */
export function parseWeekendDays(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }
  return [];
}
