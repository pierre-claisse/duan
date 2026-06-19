import { useMemo } from "react";
import { Plus, X } from "lucide-react";
import type { Lesson, LessonStatus } from "../types";
import { formatDateLong } from "../lib/calendarGrid";

const STATUS_META: Record<LessonStatus, { label: string; cls: string }> = {
  scheduled: { label: "Programmé", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  done: { label: "Effectué", cls: "bg-green-500/15 text-green-600 dark:text-green-300" },
  cancelled: { label: "Annulé", cls: "bg-content/10 text-content/40" },
};

interface Props {
  date: string;
  lessons: Lesson[];
  onAdd: () => void;
  onEdit: (id: number) => void;
  onClose: () => void;
}

export function DayLessonsPanel({ date, lessons, onAdd, onEdit, onClose }: Props) {
  const dayLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.date === date)
        .sort((a, b) =>
          a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : a.id - b.id,
        ),
    [lessons, date],
  );

  return (
    <div className="rounded-lg border border-content/10">
      <div className="flex items-start justify-between gap-2 border-b border-content/10 px-4 py-3">
        <p className="text-sm font-semibold capitalize text-content">{formatDateLong(date)}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-content/40 hover:bg-content/5 hover:text-content md:hidden"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onAdd}
          className="mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Ajouter un cours
        </button>

        {dayLessons.length === 0 ? (
          <p className="py-6 text-center text-sm text-content/30">Aucun cours ce jour</p>
        ) : (
          <ul className="space-y-2">
            {dayLessons.map((l) => {
              const meta = STATUS_META[l.status];
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onEdit(l.id)}
                    className="w-full rounded-lg border border-content/10 p-2.5 text-left transition-colors hover:border-accent/30 hover:bg-accent/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          l.status === "cancelled"
                            ? "text-content/50 line-through"
                            : "text-content"
                        }`}
                      >
                        {l.startTime} – {l.endTime}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-content/80">{l.studentName}</p>
                    {l.notes && (
                      <p className="mt-1 line-clamp-2 text-xs text-content/60">{l.notes}</p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
