
/* ==============================
   持ち物確認・今日と明日
============================== */

let availableSubjects = [];
let selectedDateType = "today";

const DAY_IDS = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday"
};

// 日付を YYYY-MM-DD に変換
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 曜日名を取得
function getJapaneseDay(date) {
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

// 週の月曜日を取得
function getWeekStart(date) {
  const monday = new Date(date);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return formatDate(monday);
}

// 指定日の時間割を取得
async function getTimetableForDate(date) {
  const hasWeekly = await hasWeeklyTimetable();
  const dayId = DAY_IDS[date.getDay()];

  if (hasWeekly) {
    const weekStart = getWeekStart(date);
    const timetable = await getWeeklyTimetable(weekStart);
    return timetable.filter(item => item.day === dayId);
  }

  if (date.getDay() === 0 || date.getDay() === 6) {
    return [];
  }

  const timetable = await getTimetable();
  return timetable.filter(item => item.day === dayId);
}

// 初期化
document.addEventListener("DOMContentLoaded", async () => {
  try {
    availableSubjects = await getSubjects();

    document
      .getElementById("todayButton")
      .addEventListener("click", async () => {
        selectedDateType = "today";
        updateDateButtons();
        await loadSelectedDateBelongings();
      });

    document
      .getElementById("tomorrowButton")
      .addEventListener("click", async () => {
        selectedDateType = "tomorrow";
        updateDateButtons();
        await loadSelectedDateBelongings();
      });

    updateDateButtons();
    await loadSelectedDateBelongings();
  } catch (error) {
    console.error("持ち物確認ページの初期化に失敗しました:", error);
  }
});

// 今日・明日の切り替えボタン
function updateDateButtons() {
  const todayButton = document.getElementById("todayButton");
  const tomorrowButton = document.getElementById("tomorrowButton");

  todayButton.classList.toggle("active", selectedDateType === "today");
  tomorrowButton.classList.toggle("active", selectedDateType === "tomorrow");

  todayButton.setAttribute(
    "aria-pressed",
    String(selectedDateType === "today")
  );

  tomorrowButton.setAttribute(
    "aria-pressed",
    String(selectedDateType === "tomorrow")
  );
}

// 持ち物を表示
async function loadSelectedDateBelongings() {
  const date = new Date();

  if (selectedDateType === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(0, 0, 0, 0);

  const container = document.getElementById("todayBelongings");
  container.innerHTML = "";

  const heading = document.createElement("p");
  heading.className = "belongings-date-heading";
  heading.textContent =
    `${date.getMonth() + 1}月${date.getDate()}日（${getJapaneseDay(date)}）の持ち物`;

  container.appendChild(heading);

  const timetable = await getTimetableForDate(date);
  const subjectBelongings = await getBelongings();
  const dailyBelongings = await getDailyBelongings();

  const dateKey = formatDate(date);
  const savedChecks = await getDailyBelongingChecks(dateKey);

  const list = document.createElement("div");
  list.className = "today-belongings-list";

  const displayedItems = new Set();

  // 毎日持っていくもの
  const dailyItems = [];

  dailyBelongings.forEach(item => {
    const name = String(item.name || "").trim();
    const key = name.toLowerCase();

    if (name && !displayedItems.has(key)) {
      displayedItems.add(key);
      dailyItems.push(name);
    }
  });

  if (dailyItems.length > 0) {
    renderBelongingGroup(
      list,
      "毎日持っていくもの",
      dailyItems,
      dateKey,
      savedChecks
    );
  }

  // 教科ごとの持ち物
  const subjectGroups = new Map();

  const sortedTimetable = timetable.slice().sort(
    (a, b) => (a.period || 0) - (b.period || 0)
  );

  sortedTimetable.forEach(classItem => {
    const subject = availableSubjects.find(
      item => String(item.id) === String(classItem.subjectId)
    );

    const subjectName = subject ? subject.name : "その他";

    const belonging = subjectBelongings.find(
      item => String(item.subjectId) === String(classItem.subjectId)
    );

    if (!belonging || !belonging.items || belonging.items.length === 0) {
      return;
    }

    const groupKey = String(classItem.subjectId);

    if (!subjectGroups.has(groupKey)) {
      subjectGroups.set(groupKey, {
        name: subjectName,
        items: []
      });
    }

    const group = subjectGroups.get(groupKey);

    belonging.items.forEach(item => {
      const name = String(item || "").trim();
      const key = `${groupKey}:${name.toLowerCase()}`;

      if (!name || displayedItems.has(key)) {
        return;
      }

      displayedItems.add(key);
      group.items.push(name);
    });
  });

  subjectGroups.forEach(group => {
    if (group.items.length === 0) return;

    renderBelongingGroup(
      list,
      group.name,
      group.items,
      dateKey,
      savedChecks
    );
  });

  // 持ち物がない場合
  if (displayedItems.size === 0) {
    const message = document.createElement("p");

    message.textContent = timetable.length === 0
      ? "この日の時間割は登録されていません。毎日の持ち物を登録すると、ここに表示されます。"
      : "必要な持ち物はまだ登録されていません。";

    container.appendChild(message);
    return;
  }

  container.appendChild(list);
}

// グループとチェックボックスを作成
function renderBelongingGroup(
  container,
  title,
  items,
  dateKey,
  savedChecks
) {
  const group = document.createElement("section");
  group.className = "belongings-subject-group";

  const heading = document.createElement("h3");
  heading.className = "belongings-subject-title";
  heading.textContent = title;

  const grid = document.createElement("div");
  grid.className = "belongings-items-grid";

  items.forEach(item => {
    const label = document.createElement("label");
    label.className = "belonging-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const checkKey = title === "毎日持っていくもの"
      ? item
      : `${title}:${item}`;

    checkbox.checked = savedChecks[checkKey] === true;

    const text = document.createElement("span");
    text.textContent = item;

    checkbox.addEventListener("change", async () => {
      try {
        const currentChecks = await getDailyBelongingChecks(dateKey);
        currentChecks[checkKey] = checkbox.checked;

        await saveDailyBelongingChecks(dateKey, currentChecks);
        savedChecks[checkKey] = checkbox.checked;
      } catch (error) {
        console.error("チェック状態の保存に失敗しました:", error);
        checkbox.checked = !checkbox.checked;
      }
    });

    label.append(checkbox, text);
    grid.appendChild(label);
  });

  group.append(heading, grid);
  container.appendChild(group);
}
