import React from "react";

export function bi(en: string, zh: string) {
  return `${en}\n${zh}`;
}

export function BiText({ text, className }: { text: string; className?: string }) {
  if (!text.includes("\n")) return React.createElement("span", { className }, text);
  const [en, zh] = text.split("\n");
  return React.createElement(
    "span",
    { className: `inline-flex flex-col leading-snug ${className || ""}` },
    React.createElement("span", null, en),
    React.createElement("span", { className: "text-[0.82em] opacity-65" }, zh)
  );
}

export const L = {
  appName: "EA Calendar",
  share: bi("Share", "分享"),
  subscribe: bi("Subscribe", "訂閱"),
  addEvent: bi("Add Event", "新增活動"),
  scanNotice: bi("Scan Notice", "掃描通告"),
  newEvent: bi("New Event", "新增活動"),
  editEvent: bi("Edit Event", "編輯活動"),
  eventDetails: bi("Event Details", "活動詳情"),
  confirmEvent: bi("Confirm Event", "確認活動"),
  saveEvent: bi("Save Event", "儲存活動"),
  saveChanges: bi("Save Changes", "儲存更改"),
  cancel: bi("Cancel", "取消"),
  close: bi("Close", "關閉"),
  edit: bi("Edit", "編輯"),
  delete: bi("Delete", "刪除"),
  deleting: bi("Deleting...", "刪除中..."),
  keep: bi("Keep", "保留"),
  duplicate: bi("Duplicate", "複製"),
  goBack: bi("Go Back", "返回"),
  continueSave: bi("Continue & Save", "繼續儲存"),
  save: bi("+ Save", "+ 儲存"),

  title: bi("Title", "標題"),
  titlePlaceholder: "e.g. Sports Day\n例如：運動會",
  category: bi("Category", "類別"),
  location: bi("Location", "地點"),
  locationPlaceholder: "e.g. School Hall\n例如：學校禮堂",
  allDay: bi("All day", "全日"),
  duration: bi("Duration", "時長"),
  start: bi("Start", "開始"),
  end: bi("End", "結束"),
  notes: bi("Notes", "備註"),
  notesPlaceholder: "Optional details...\n選填詳情...",
  repeat: bi("Repeat", "重複"),
  repeatOn: bi("Repeat on", "重複日"),
  frequency: bi("Frequency", "頻率"),
  ends: bi("Ends", "結束"),
  onDate: bi("On date", "指定日期"),
  noEnd: bi("No end", "不設結束"),

  doesNotRepeat: bi("Does not repeat", "不重複"),
  daily: bi("Daily", "每日"),
  weekly: bi("Weekly", "每週"),
  monthly: bi("Monthly", "每月"),
  yearly: bi("Yearly", "每年"),
  every: bi("Every", "每"),

  endDateError: "End date must be the same as or later than start date.\n結束日期必須等於或晚於開始日期。",
  endTimeError: "End time must be later than start time.\n結束時間必須晚於開始時間。",
  recEndError: "Repeat until must be later than the event end time.\n重複結束日期必須晚於活動結束時間。",
  recEndHint: "Leave empty to repeat for 1 year\n留空則重複一年",
  recNoEndHint: "Repeats for up to 2 years\n最多重複兩年",

  reviewHint: "Review and edit the details before saving.\n儲存前請檢查並編輯詳情。",
  deletePrompt: "Delete this event? This cannot be undone.\n刪除此活動？此操作無法撤銷。",
  recurringWarning: "This is a recurring event.\n這是一個重複活動。",
  deleteThisOnly: bi("Delete this event only", "只刪除此活動"),
  deleteThisOnlyHint: "Other events in the series will remain.\n系列中其他活動將保留。",
  deleteAll: bi("Delete all events in this series", "刪除此系列所有活動"),
  deleteAllHint: "This will remove every occurrence.\n這將刪除所有重複項。",
  deleteEvent: bi("Delete event", "刪除活動"),
  fromScan: bi("From notice scan", "來自通告掃描"),
  manuallyAdded: bi("Manually added", "手動新增"),

  failedToSave: "Failed to save event.\n儲存活動失敗。",
  networkError: "Network error. Please check your connection.\n網路錯誤，請檢查連線。",
  linkCopied: "Link copied to clipboard!\n連結已複製！",
  shareText: "Check out my school events calendar\n查看我的校園活動日曆",

  prepReminder: bi("Preparation Reminder", "準備提醒"),
  tapZoneHint: bi("Tap a zone to add items", "點選區域以新增物品"),
  strollerLabel: bi("Baby cart / Stroller", "嬰兒車"),
  addCustomPlaceholder: "Add custom item...\n新增自訂項目...",

  catSchool: bi("School", "學校"),
  catPlaygroup: bi("Playgroup", "遊戲班"),
  catMedical: bi("Medical", "醫療"),
  catFamily: bi("Family", "家庭"),
  catOther: bi("Other", "其他"),
};
