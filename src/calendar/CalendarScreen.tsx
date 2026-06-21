// Responsive monthly grid. Times are stored in the professor's local timezone
// (Asia/Taipei) as entered, so we group lessons directly by their `date`.
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "../types";
import { buildCalendarGrid, shiftMonth } from "../lib/calendarGrid";
import { formatMonthYear, weekdayHeaders } from "../lib/dates";
import { useI18n, intlLocale } from "../i18n";

interface Props {
  year: number;
  month: number;
  onChangeYearMonth: (year: number, month: number) => void;
  lessons: Lesson[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  today: string;
}

export function CalendarScreen({
  year,
  month,
  onChangeYearMonth,
  lessons,
  selectedDate,
  onSelectDate,
  today,
}: Props) {
  const { t, locale } = useI18n();
  const bcp47 = intlLocale(locale);
  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const weekdays = useMemo(() => weekdayHeaders(bcp47), [bcp47]);

  const countByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of lessons) {
      if (l.status === "cancelled") continue;
      m.set(l.date, (m.get(l.date) ?? 0) + 1);
    }
    return m;
  }, [lessons]);

  const goPrev = () => {
    const { year: y, month: mo } = shiftMonth(year, month, -1);
    onChangeYearMonth(y, mo);
  };
  const goNext = () => {
    const { year: y, month: mo } = shiftMonth(year, month, 1);
    onChangeYearMonth(y, mo);
  };
  const goToday = () => {
    const [y, mo] = today.split("-").map(Number);
    onChangeYearMonth(y, mo);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("calendar.prevMonth")}
            className="rounded-lg border border-content/20 p-1.5 hover:bg-content/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-2 text-base font-semibold sm:text-lg">
            {formatMonthYear(year, month, bcp47)}
          </span>
          <button
            type="button"
            onClick={goNext}
            aria-label={t("calendar.nextMonth")}
            className="rounded-lg border border-content/20 p-1.5 hover:bg-content/5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="rounded-lg border border-content/20 px-3 py-1.5 text-sm hover:bg-content/5"
        >
          {t("calendar.today")}
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((w, i) => (
          <div key={i} className="py-1 text-center text-[11px] font-medium text-content/50">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell) => {
          const isToday = cell.date === today;
          const isSelected = cell.date === selectedDate;
          const count = countByDate.get(cell.date) ?? 0;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`flex min-h-[3rem] flex-col rounded-md border p-1 text-left transition-colors sm:min-h-[4.5rem] ${
                cell.inMonth ? "bg-surface" : "bg-content/[0.02]"
              } ${
                isSelected ? "border-accent ring-2 ring-accent" : "border-content/10"
              } hover:bg-content/5`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-accent font-semibold text-white"
                    : cell.inMonth
                      ? "text-content"
                      : "text-content/30"
                }`}
              >
                {cell.day}
              </span>
              {count > 0 && (
                <span className="mt-auto self-start rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                  {t(count === 1 ? "calendar.lessonsOne" : "calendar.lessonsOther", { n: count })}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
