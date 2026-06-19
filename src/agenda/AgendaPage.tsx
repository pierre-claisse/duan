// Professor-only agenda. The route is guarded (anonymous visitors are redirected
// to "/"), so we can assume an unlocked PAT here.
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth";
import { CalendarScreen } from "./CalendarScreen";
import { DayLessonsPanel } from "./DayLessonsPanel";
import { LessonDialog, type LessonDraft } from "./LessonDialog";
import { loadLessons, persistLessons } from "./lessonsRepo";
import { currentYearMonth, nowIso, todayInZone } from "../lib/dates";
import type { Lesson } from "../types";

interface DialogState {
  open: boolean;
  lesson: Lesson | null;
  defaultDate: string;
}

export function AgendaPage() {
  const { state } = useAuth();
  const pat = state.status === "unlocked" ? state.pat : null;

  const today = todayInZone();
  const [{ year, month }, setYM] = useState(() => currentYearMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sha, setSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    lesson: null,
    defaultDate: today,
  });

  useEffect(() => {
    if (!pat) return;
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await loadLessons(pat);
        if (alive) {
          setLessons(res.lessons);
          setSha(res.sha);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pat]);

  const persist = useCallback(
    async (next: Lesson[], message: string) => {
      if (!pat) return;
      setSaving(true);
      setError(null);
      try {
        const newSha = await persistLessons(pat, next, sha, message);
        setLessons(next);
        setSha(newSha);
        setDialog((d) => ({ ...d, open: false }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec de l'enregistrement.");
      } finally {
        setSaving(false);
      }
    },
    [pat, sha],
  );

  const handleSave = useCallback(
    (id: number | null, draft: LessonDraft) => {
      const now = nowIso();
      let next: Lesson[];
      if (id === null) {
        const lesson: Lesson = { id: Date.now(), ...draft, createdAt: now, modifiedAt: null };
        next = [...lessons, lesson];
      } else {
        next = lessons.map((l) => (l.id === id ? { ...l, ...draft, modifiedAt: now } : l));
      }
      void persist(
        next,
        id === null
          ? `agenda: nouveau cours (${draft.studentName})`
          : `agenda: modification du cours #${id}`,
      );
    },
    [lessons, persist],
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (!window.confirm("Supprimer ce cours ?")) return;
      void persist(lessons.filter((l) => l.id !== id), `agenda: suppression du cours #${id}`);
    },
    [lessons, persist],
  );

  const openAdd = () =>
    setDialog({ open: true, lesson: null, defaultDate: selectedDate ?? today });
  const openEdit = (id: number) => {
    const lesson = lessons.find((l) => l.id === id) ?? null;
    setDialog({ open: true, lesson, defaultDate: lesson?.date ?? today });
  };

  if (!pat) return null;

  return (
    <section className="py-2">
      <h1 className="mb-4 text-2xl font-semibold text-content">Agenda</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-content/40">Chargement…</p>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <CalendarScreen
              year={year}
              month={month}
              onChangeYearMonth={(y, m) => setYM({ year: y, month: m })}
              lessons={lessons}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              today={today}
            />
          </div>
          {selectedDate && (
            <div className="md:w-80 md:flex-shrink-0">
              <DayLessonsPanel
                date={selectedDate}
                lessons={lessons}
                onAdd={openAdd}
                onEdit={openEdit}
                onClose={() => setSelectedDate(null)}
              />
            </div>
          )}
        </div>
      )}

      <LessonDialog
        open={dialog.open}
        lesson={dialog.lesson}
        defaultDate={dialog.defaultDate}
        saving={saving}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />
    </section>
  );
}
