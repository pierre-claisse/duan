// UI string catalogue. Two locales: Taiwanese Mandarin (Traditional Chinese,
// the default) and English. Strings are written to read naturally in each
// language — not literal translations of one another.
//
// `zhTW` is typed against the keys of `en`, so the compiler flags any key that
// is missing from (or extra in) either locale.

export type Locale = "zh-TW" | "en";
export const LOCALES: Locale[] = ["zh-TW", "en"];
export const DEFAULT_LOCALE: Locale = "zh-TW";

/** Language names shown in the switcher (each in its own script, locale-stable). */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  "zh-TW": "中文",
  en: "English",
};

const en = {
  brand: "Duan",

  "nav.home": "Home",
  "nav.blog": "Blog",
  "nav.calendar": "Calendar",
  "nav.teacherLogin": "Teacher sign-in",
  "nav.logout": "Sign out",
  "nav.menu": "Menu",
  "nav.darkMode": "Dark mode",
  "nav.lightMode": "Light mode",

  "common.loading": "Loading…",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saving": "Saving…",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.close": "Close",
  "common.loadFailed": "Couldn't load.",
  "common.saveFailed": "Couldn't save.",
  "common.deleteFailed": "Couldn't delete.",

  "home.text": "The home page is on its way — check back soon.",

  "login.title": "Teacher sign-in",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.submitting": "Signing in…",
  "login.wrongPassword": "That password isn't right.",
  "login.loadError": "Couldn't load your credentials: {msg}",

  "blog.title": "Blog",
  "blog.rebuildIndex": "Rebuild index",
  "blog.newPost": "New post",
  "blog.empty": "No posts yet.",
  "blog.draft": "Draft",

  "article.back": "Back to the blog",
  "article.notFound": "We couldn't find that post.",

  "editor.editTitle": "Edit post",
  "editor.newTitle": "New post",
  "editor.title": "Title",
  "editor.titlePlaceholder": "Post title",
  "editor.date": "Date",
  "editor.published": "Published (visible to everyone)",
  "editor.content": "Content (Markdown)",
  "editor.preview": "Preview",
  "editor.editTab": "Edit",
  "editor.bodyPlaceholder": "Write your post in Markdown…",
  "editor.empty": "(empty)",
  "editor.confirmDelete": "Delete this post for good?",
  "editor.notFound": "We couldn't find that post.",

  "calendar.title": "Calendar",

  "calendar.today": "Today",
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.lessonsOne": "{n} lesson",
  "calendar.lessonsOther": "{n} lessons",

  "day.addLesson": "Add a lesson",
  "day.empty": "No lessons this day.",

  "lesson.editTitle": "Edit lesson",
  "lesson.addTitle": "Add a lesson",
  "lesson.date": "Date",
  "lesson.start": "Start",
  "lesson.end": "End",
  "lesson.timeError": "The end time has to be after the start time.",
  "lesson.student": "Student",
  "lesson.studentPlaceholder": "Student's name",
  "lesson.status": "Status",
  "lesson.notes": "Notes",
  "lesson.notesPlaceholder": "Notes (optional)…",
  "lesson.confirmDelete": "Delete this lesson?",

  "status.scheduled": "Scheduled",
  "status.done": "Done",
  "status.cancelled": "Cancelled",
} as const;

export type MsgKey = keyof typeof en;

const zhTW: Record<MsgKey, string> = {
  brand: "段",

  "nav.home": "首頁",
  "nav.blog": "部落格",
  "nav.calendar": "行事曆",
  "nav.teacherLogin": "教師登入",
  "nav.logout": "登出",
  "nav.menu": "選單",
  "nav.darkMode": "深色模式",
  "nav.lightMode": "淺色模式",

  "common.loading": "載入中…",
  "common.cancel": "取消",
  "common.save": "儲存",
  "common.saving": "儲存中…",
  "common.delete": "刪除",
  "common.edit": "編輯",
  "common.close": "關閉",
  "common.loadFailed": "載入失敗。",
  "common.saveFailed": "儲存失敗。",
  "common.deleteFailed": "刪除失敗。",

  "home.text": "首頁籌備中，敬請期待。",

  "login.title": "教師登入",
  "login.password": "密碼",
  "login.submit": "登入",
  "login.submitting": "登入中…",
  "login.wrongPassword": "密碼不正確。",
  "login.loadError": "無法載入登入資訊：{msg}",

  "blog.title": "部落格",
  "blog.rebuildIndex": "重建索引",
  "blog.newPost": "撰寫文章",
  "blog.empty": "目前還沒有文章。",
  "blog.draft": "草稿",

  "article.back": "返回部落格",
  "article.notFound": "找不到這篇文章。",

  "editor.editTitle": "編輯文章",
  "editor.newTitle": "撰寫文章",
  "editor.title": "標題",
  "editor.titlePlaceholder": "文章標題",
  "editor.date": "日期",
  "editor.published": "發布（所有人皆可閱讀）",
  "editor.content": "內容（Markdown）",
  "editor.preview": "預覽",
  "editor.editTab": "編輯",
  "editor.bodyPlaceholder": "以 Markdown 撰寫內容…",
  "editor.empty": "（空白）",
  "editor.confirmDelete": "確定要永久刪除這篇文章嗎？",
  "editor.notFound": "找不到這篇文章。",

  "calendar.title": "行事曆",

  "calendar.today": "今天",
  "calendar.prevMonth": "上個月",
  "calendar.nextMonth": "下個月",
  "calendar.lessonsOne": "{n} 堂課",
  "calendar.lessonsOther": "{n} 堂課",

  "day.addLesson": "新增課程",
  "day.empty": "這天沒有課程。",

  "lesson.editTitle": "編輯課程",
  "lesson.addTitle": "新增課程",
  "lesson.date": "日期",
  "lesson.start": "開始",
  "lesson.end": "結束",
  "lesson.timeError": "結束時間必須晚於開始時間。",
  "lesson.student": "學生",
  "lesson.studentPlaceholder": "學生姓名",
  "lesson.status": "狀態",
  "lesson.notes": "備註",
  "lesson.notesPlaceholder": "備註（選填）…",
  "lesson.confirmDelete": "確定要刪除這堂課嗎？",

  "status.scheduled": "已排定",
  "status.done": "已完成",
  "status.cancelled": "已取消",
};

export const messages: Record<Locale, Record<MsgKey, string>> = {
  "zh-TW": zhTW,
  en,
};
