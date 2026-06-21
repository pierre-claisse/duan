// Calendar persistence: the whole calendar is one JSON array in `sessions.json`
// in the private repo. Read-modify-write the entire array (trivial with a single
// editor; on the rare conflict we re-read the latest SHA and retry once).
import { CALENDAR } from "../config";
import { getFile, putFile, GithubError } from "../github/client";
import type { Lesson } from "../types";

const SESSIONS_PATH = "sessions.json";

export interface LoadedLessons {
  lessons: Lesson[];
  sha: string | null;
}

export async function loadLessons(pat: string): Promise<LoadedLessons> {
  const blob = await getFile(pat, CALENDAR.owner, CALENDAR.repo, SESSIONS_PATH);
  if (!blob) return { lessons: [], sha: null };
  try {
    const parsed = JSON.parse(blob.content) as Lesson[];
    return { lessons: Array.isArray(parsed) ? parsed : [], sha: blob.sha };
  } catch {
    return { lessons: [], sha: blob.sha };
  }
}

export async function persistLessons(
  pat: string,
  lessons: Lesson[],
  sha: string | null,
  message: string,
): Promise<string> {
  const content = JSON.stringify(lessons, null, 2);
  try {
    return (await putFile(pat, CALENDAR.owner, CALENDAR.repo, SESSIONS_PATH, content, sha, message)).sha;
  } catch (e) {
    if (e instanceof GithubError && e.conflict) {
      const latest = await getFile(pat, CALENDAR.owner, CALENDAR.repo, SESSIONS_PATH);
      return (await putFile(pat, CALENDAR.owner, CALENDAR.repo, SESSIONS_PATH, content, latest?.sha ?? null, message)).sha;
    }
    throw e;
  }
}
