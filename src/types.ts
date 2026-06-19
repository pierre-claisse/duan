// Domain types shared across the app.

export type LessonStatus = "scheduled" | "done" | "cancelled";

/** A private lesson the professor records in her agenda. Stored as one entry in
 *  `sessions.json` (a single JSON array) in the private agenda repo. Times are
 *  wall-clock in the professor's timezone (Asia/Taipei), stored as entered. */
export interface Lesson {
  id: number; // Date.now() at creation
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  studentName: string;
  status: LessonStatus;
  notes: string | null;
  createdAt: string; // ISO 8601
  modifiedAt: string | null;
}

/** A blog article. Stored as `articles/<slug>.json` in the public blog repo. */
export interface Article {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD" publication date
  body: string; // markdown
  published: boolean; // false = draft (professor-only)
  createdAt: string;
  modifiedAt: string | null;
}

/** Lightweight entry in `articles/index.json` — used to render the list without
 *  downloading every article body. */
export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  published: boolean;
}
