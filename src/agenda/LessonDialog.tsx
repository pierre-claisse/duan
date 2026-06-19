import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Lesson, LessonStatus } from "../types";

export interface LessonDraft {
  date: string;
  startTime: string;
  endTime: string;
  studentName: string;
  status: LessonStatus;
  notes: string | null;
}

interface Props {
  open: boolean;
  lesson: Lesson | null; // null = create
  defaultDate: string;
  saving: boolean;
  onSave: (id: number | null, draft: LessonDraft) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const STATUSES: { value: LessonStatus; label: string }[] = [
  { value: "scheduled", label: "Programmé" },
  { value: "done", label: "Effectué" },
  { value: "cancelled", label: "Annulé" },
];
const MAX_NOTES = 5000;

export function LessonDialog({
  open,
  lesson,
  defaultDate,
  saving,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<LessonStatus>("scheduled");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    if (lesson) {
      setDate(lesson.date);
      setStartTime(lesson.startTime);
      setEndTime(lesson.endTime);
      setStudentName(lesson.studentName);
      setStatus(lesson.status);
      setNotes(lesson.notes ?? "");
    } else {
      setDate(defaultDate);
      setStartTime("");
      setEndTime("");
      setStudentName("");
      setStatus("scheduled");
      setNotes("");
    }
  }, [open, lesson, defaultDate]);

  if (!open) return null;

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const validTimes = startTime !== "" && endTime !== "" && endTime > startTime;
  const canSave = !saving && validDate && validTimes && studentName.trim().length > 0;
  const isEditing = !!lesson;

  const handleSave = () => {
    if (!canSave) return;
    onSave(lesson?.id ?? null, {
      date,
      startTime,
      endTime,
      studentName: studentName.trim(),
      status,
      notes: notes.trim() ? notes.trim() : null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-xl border border-content/20 bg-surface shadow-xl sm:rounded-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-content/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-content">
            {isEditing ? "Modifier le cours" : "Ajouter un cours"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-content/40 hover:bg-content/5 hover:text-content"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs text-content/60">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-content/20 bg-content/5 px-2 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-content/60">Début</span>
              <input
                type="time"
                step={900}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-content/20 bg-content/5 px-2 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-content/60">Fin</span>
              <input
                type="time"
                step={900}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-content/20 bg-content/5 px-2 py-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>
          {startTime !== "" && endTime !== "" && !validTimes && (
            <p className="text-xs text-red-500">L'heure de fin doit suivre l'heure de début.</p>
          )}

          <label className="block">
            <span className="mb-1 block text-xs text-content/60">Élève</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nom de l'élève"
              className="w-full rounded border border-content/20 bg-content/5 px-2 py-2 text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs text-content/60">Statut</span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    status === s.value
                      ? "border-accent bg-accent/10 text-content"
                      : "border-content/20 text-content/60 hover:bg-content/5"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs text-content/60">Notes</span>
            <textarea
              rows={3}
              maxLength={MAX_NOTES}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (facultatif)…"
              className="w-full resize-none rounded border border-content/20 bg-content/5 px-2 py-2 text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-content/10 px-5 py-3">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={() => onDelete(lesson.id)}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-content/60 hover:text-content"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
