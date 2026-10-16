
/* ==============================
   ホーム画面：今日と明日の時間割
============================== */

const weekdayIds = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday"
};

const weekdayNames = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日"
];

// ==============================
// 初期化
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  showTimetables();
  showHomeEvents();
});

// ==============================
// 日付から、その週の月曜日を取得
// ==============================

function getHomeMondayDateString(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}

// ==============================
// 今日と明日の時間割を読み込む
// ==============================

async function showTimetables() {
  try {
    const user = await getUser();

    if (!user) {
      showMessage("初期設定を行ってください。");
      return;
    }

    const subjects = await getSubjects();

    // 今日と明日の日付
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 日付の見出し
    document.getElementById("todayTitle").textContent =
      `今日（${today.getMonth() + 1}/${today.getDate()}・${weekdayNames[today.getDay()]}）`;

    document.getElementById("tomorrowTitle").textContent =
      `明日（${tomorrow.getMonth() + 1}/${tomorrow.getDate()}・${weekdayNames[tomorrow.getDay()]}）`;

    // 学年に応じた時限数
    let periodCount = 6;

    if (user.grade.startsWith("高校")) {
      periodCount = 7;

      if (
        user.grade === "高校3年" ||
        user.grade === "高校3年生"
      ) {
        periodCount = 8;
      }
    }

    // 日付ごとの時間割を取得
    const todayTimetable = await getTimetableForDate(
      user.grade,
      today
    );

    const tomorrowTimetable = await getTimetableForDate(
      user.grade,
      tomorrow
    );

    // 今日の時間割
    renderTimetable(
      "todayTimetable",
      today,
      todayTimetable,
      subjects,
      periodCount
    );

    // 明日の時間割
    renderTimetable(
      "tomorrowTimetable",
      tomorrow,
      tomorrowTimetable,
      subjects,
      periodCount
    );

  } catch (error) {
    console.error("時間割の読み込みに失敗しました:", error);
    showMessage("時間割を読み込めませんでした。設定や保存内容を確認してください。");
  }
}

// ==============================
// 指定した日付の時間割を取得
// ==============================

async function getTimetableForDate(grade, date) {
  // 高校生は、その日付が含まれる週の時間割を使用
  if (grade.startsWith("高校")) {
    const weekStart = getHomeMondayDateString(date);

    const weeklyTimetable = await getWeeklyTimetable(weekStart);

    // その週のデータが存在する場合は週別時間割を使う
    if (weeklyTimetable.length > 0) {
      return weeklyTimetable;
    }

    // 週別時間割がまだ一度も保存されていない場合のみ、
    // 以前の基本時間割を表示用の参考として使う
    const hasWeeklyData = await hasWeeklyTimetable();

    if (!hasWeeklyData) {
      return await getTimetable();
    }

    // 週別時間割のデータがない週は空として扱う
    return [];
  }

  // 中学生は基本時間割を使用
  return await getTimetable();
}

// ==============================
// 指定した日の時間割を表示
// ==============================

function renderTimetable(
  containerId,
  date,
  timetable,
  subjects,
  periodCount
) {
  const container = document.getElementById(containerId);
  const weekday = date.getDay();

  container.innerHTML = "";

  // 日曜日は学校の時間割を表示しない
  if (weekday === 0) {
    container.textContent = "学校の時間割はありません。";
    return;
  }

  const dayId = weekdayIds[weekday];

  const lessons = timetable.filter(
    item => item.day === dayId
  );

  // その週の時間割自体が未登録の場合
  if (lessons.length === 0) {
    container.textContent = "時間割は未登録です。";
    return;
  }

  const lessonsByPeriod = new Map();

  lessons.forEach(item => {
    lessonsByPeriod.set(Number(item.period), item);
  });

  const list = document.createElement("div");
  list.className = "today-timetable-list";

  for (let period = 1; period <= periodCount; period++) {
    const lesson = lessonsByPeriod.get(period);

    const row = document.createElement("div");
    row.className = "today-timetable-row";

    const periodLabel = document.createElement("span");
    periodLabel.className = "today-period";

    periodLabel.textContent =
      period === 8 ? "補習" : `${period}限`;

    const subjectLabel = document.createElement("span");
    subjectLabel.className = "today-subject";

    if (lesson) {
      const subject = subjects.find(
        item => item.id === lesson.subjectId
      );

      subjectLabel.textContent =
        subject ? subject.name : "未登録の教科";
    } else {
      subjectLabel.textContent = "未設定";
      row.classList.add("is-unset");
    }

    row.appendChild(periodLabel);
    row.appendChild(subjectLabel);
    list.appendChild(row);
  }

  container.appendChild(list);
}

// ==============================
// 初期設定がない場合などのメッセージ
// ==============================

function showMessage(message) {
  ["todayTimetable", "tomorrowTimetable"].forEach(id => {
    const container = document.getElementById(id);

    if (container) {
      container.textContent = message;
    }
  });
}

// ==============================
// 今日と明日の部活動・個人予定を表示
// ==============================

async function showHomeEvents() {
  const todayContainer = document.getElementById("todayEvents");
  const tomorrowContainer = document.getElementById("tomorrowEvents");

  if (!todayContainer || !tomorrowContainer) return;

  try {
    const events = await getEvents();

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    renderHomeEvents(todayContainer, events, today);
    renderHomeEvents(tomorrowContainer, events, tomorrow);

  } catch (error) {
    console.error("予定の読み込みに失敗しました:", error);
    todayContainer.textContent = "予定を読み込めませんでした。";
    tomorrowContainer.textContent = "予定を読み込めませんでした。";
  }
}

// 日付を YYYY-MM-DD 形式に変換
function getHomeDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 指定した日の予定を表示
function renderHomeEvents(container, events, date) {
  const dateKey = getHomeDateKey(date);

  container.replaceChildren();

  const matchingEvents = events
    .filter(event => homeEventOccursOn(event, dateKey))
    .sort((a, b) => {
      return (a.startTime || "99:99")
        .localeCompare(b.startTime || "99:99");
    });

  if (matchingEvents.length === 0) {
    container.textContent = "予定はありません。";
    return;
  }

  matchingEvents.forEach(event => {
    const item = document.createElement("div");
    item.className = "home-event-item";

    const name = document.createElement("h4");
    name.textContent = event.name || event.title || "名前のない予定";
    item.appendChild(name);

    const time = document.createElement("p");
    time.className = "home-event-time";

    if (event.startTime && event.endTime) {
      time.textContent = `${event.startTime}〜${event.endTime}`;
    } else if (event.startTime) {
      time.textContent = `${event.startTime}〜`;
    } else if (event.endTime) {
      time.textContent = `〜${event.endTime}`;
    } else {
      time.textContent = "時刻未設定";
    }

    item.appendChild(time);

    if (event.belongings && event.belongings.trim()) {
      const belongings = document.createElement("p");
      belongings.className = "home-event-belongings";
      belongings.textContent = `持ち物：${event.belongings}`;
      item.appendChild(belongings);
    }

    container.appendChild(item);
  });
}

// 繰り返し予定が指定日に該当するか判定
function homeEventOccursOn(event, dateKey) {
  const recurrence = event.recurrence || "once";

  if (recurrence === "once") {
    return event.date === dateKey;
  }

  if (!event.date || dateKey < event.date) {
    return false;
  }

  const skippedDates = Array.isArray(event.skippedDates)
    ? event.skippedDates
    : [];

  if (skippedDates.includes(dateKey)) {
    return false;
  }

  const [year, month, day] = event.date.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);

  const [targetYear, targetMonth, targetDay] =
    dateKey.split("-").map(Number);

  const targetDate = new Date(
    targetYear,
    targetMonth - 1,
    targetDay
  );

  if (recurrence === "weekly" || recurrence === "biweekly") {
    if (startDate.getDay() !== targetDate.getDay()) {
      return false;
    }

    const daysDifference = Math.round(
      (targetDate - startDate) / 86400000
    );

    const weeksDifference = Math.floor(daysDifference / 7);

    return weeksDifference % (recurrence === "biweekly" ? 2 : 1) === 0;
  }

  if (recurrence === "monthly") {
    return startDate.getDate() === targetDate.getDate();
  }

  return event.date === dateKey;
}
