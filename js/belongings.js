
/* ==============================
   持ち物設定・今日と明日の持ち物
============================== */

let availableSubjects = [];
let selectedDateType = "today";

// 曜日番号と時間割の曜日ID
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

// 日付の曜日名を取得
function getJapaneseDay(date) {
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

// 指定日の週の月曜日を取得
function getWeekStart(date) {
  const monday = new Date(date);
  const day = monday.getDay();

  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return formatDate(monday);
}

// 日付に対応する時間割を取得
async function getTimetableForDate(date) {
  const hasWeekly = await hasWeeklyTimetable();
  const dayId = DAY_IDS[date.getDay()];

  if (hasWeekly) {
    const weekStart = getWeekStart(date);
    const timetable = await getWeeklyTimetable(weekStart);

    return timetable.filter(item => item.day === dayId);
  }

  // 基本時間割を使う場合
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

    createSubjectBelongings();
    await loadBelongings();

    createDailyBelongings();
    await loadDailyBelongings();

    document
      .getElementById("saveBelongingsButton")
      .addEventListener("click", saveAllBelongings);

    document
      .getElementById("addDailyItemButton")
      .addEventListener("click", () => addDailyItem());

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
    console.error("持ち物ページの初期化に失敗しました:", error);
  }
});

// ==============================
// 教科ごとの持ち物入力欄
// ==============================

function createSubjectBelongings() {
  const container = document.getElementById("subjectBelongingsContainer");
  container.innerHTML = "";

  if (availableSubjects.length === 0) {
    container.innerHTML = "<p>先に教科・科目設定をしてください。</p>";
    return;
  }

  availableSubjects.forEach(subject => {
    const wrapper = document.createElement("div");
    wrapper.className = "belongings-subject-item";

    const title = document.createElement("h3");
    title.textContent = subject.name;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "subject-belongings-input";
    input.dataset.subjectId = subject.id;
    input.placeholder = "例：教科書、ノート、ファイル";

    wrapper.append(title, input);
    container.appendChild(wrapper);
  });
}

async function loadBelongings() {
  const belongings = await getBelongings();

  belongings.forEach(item => {
    const input = document.querySelector(
      `.subject-belongings-input[data-subject-id="${item.subjectId}"]`
    );

    if (input) {
      input.value = (item.items || []).join("、");
    }
  });
}

// ==============================
// 毎日の持ち物
// ==============================

function createDailyBelongings() {
  document.getElementById("dailyBelongingsContainer").innerHTML = "";
}

function addDailyItem(value = "") {
  const container = document.getElementById("dailyBelongingsContainer");

  const wrapper = document.createElement("div");
  wrapper.className = "daily-belonging-item";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "daily-belonging-input";
  input.placeholder = "例：筆箱";
  input.value = value;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "small-delete-button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => wrapper.remove());

  wrapper.append(input, deleteButton);
  container.appendChild(wrapper);
}

async function loadDailyBelongings() {
  const items = await getDailyBelongings();
  items.forEach(item => addDailyItem(item.name));
}

// ==============================
// 設定内容を保存
// ==============================

async function saveAllBelongings() {
  try {
    const inputs = document.querySelectorAll(".subject-belongings-input");
    const subjectBelongings = [];

    inputs.forEach(input => {
      const items = input.value
        .split(/[、,，]+/)
        .map(item => item.trim())
        .filter(Boolean);

      subjectBelongings.push({
        subjectId: input.dataset.subjectId,
        items
      });
    });

    await saveBelongings(subjectBelongings);

    const dailyInputs = document.querySelectorAll(".daily-belonging-input");
    const dailyItems = [];

    dailyInputs.forEach((input, index) => {
      const name = input.value.trim();

      if (name) {
        dailyItems.push({
          id: `daily-${index}`,
          name
        });
      }
    });

    await saveDailyBelongings(dailyItems);

    const message = document.getElementById("saveMessage");
    message.textContent = "持ち物設定を保存しました！";

    await loadSelectedDateBelongings();

    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  } catch (error) {
    console.error("持ち物設定の保存に失敗しました:", error);
    document.getElementById("saveMessage").textContent =
      "保存できませんでした。もう一度お試しください。";
  }
}

// ==============================
// 今日・明日の切り替え
// ==============================

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

/* ==============================
   今日・明日の持ち物を表示
============================== */

async function loadSelectedDateBelongings() {
  const date = new Date();

  // 明日が選択されている場合は、日付を1日進める
  if (selectedDateType === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }

  date.setHours(0, 0, 0, 0);

  const container = document.getElementById("todayBelongings");
  container.innerHTML = "";

  // 日付を表示
  const heading = document.createElement("p");
  heading.className = "belongings-date-heading";
  heading.textContent =
    `${date.getMonth() + 1}月${date.getDate()}日（${getJapaneseDay(date)}）の持ち物`;

  container.appendChild(heading);

  // 時間割と持ち物設定を読み込む
  const timetable = await getTimetableForDate(date);
  const subjectBelongings = await getBelongings();
  const dailyBelongings = await getDailyBelongings();

  // その日付のチェック状態を読み込む
  const dateKey = formatDate(date);
  const savedChecks = await getDailyBelongingChecks(dateKey);

  // 持ち物を表示する場所
  const list = document.createElement("div");
  list.className = "today-belongings-list";

  // 同じ持ち物を重複して表示しないための集合
  const displayedItems = new Set();

  // 毎日の持ち物を先に表示する
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

  // 教科ごとに持ち物をまとめる
  const subjectGroups = new Map();

  // 時間割を授業の順番に並べる
  const sortedTimetable = timetable.slice().sort(
    (a, b) => (a.period || 0) - (b.period || 0)
  );

  sortedTimetable.forEach(classItem => {
    // 授業の教科・科目を調べる
    const subject = availableSubjects.find(
      item => String(item.id) === String(classItem.subjectId)
    );

    const subjectName = subject ? subject.name : "その他";

    // その教科に登録された持ち物を探す
    const belonging = subjectBelongings.find(
      item => String(item.subjectId) === String(classItem.subjectId)
    );

    if (!belonging || !belonging.items) {
      return;
    }

    // 持ち物が登録されていない教科は表示しない
    if (belonging.items.length === 0) {
      return;
    }

    const groupKey = String(classItem.subjectId);

    // まだグループがなければ作る
    if (!subjectGroups.has(groupKey)) {
      subjectGroups.set(groupKey, {
        name: subjectName,
        items: []
      });
    }

    const group = subjectGroups.get(groupKey);

    belonging.items.forEach(item => {
      const name = String(item || "").trim();
      const key = name.toLowerCase();

      // 空欄と重複する持ち物は追加しない
      if (!name || displayedItems.has(key)) {
        return;
      }

      displayedItems.add(key);
      group.items.push(name);
    });
  });

  // 教科ごとにグループを表示する
  subjectGroups.forEach(group => {
    if (group.items.length === 0) {
      return;
    }

    renderBelongingGroup(
      list,
      group.name,
      group.items,
      dateKey,
      savedChecks
    );
  });

  // 表示できる持ち物がない場合
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

// ==============================
// 重複を除いて追加
// ==============================

function addUniqueItem(items, itemKeys, item) {
  const name = String(item || "").trim();
  const key = name.toLowerCase();

  if (!key || itemKeys.has(key)) return;

  itemKeys.add(key);
  items.push(name);
}

/* ==============================
   持ち物グループとチェックボックスを作成
============================== */

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
    checkbox.checked = savedChecks[item] === true;

    const text = document.createElement("span");
    text.textContent = item;

    checkbox.addEventListener("change", async () => {
      try {
        const currentChecks =
          await getDailyBelongingChecks(dateKey);

        currentChecks[item] = checkbox.checked;

        await saveDailyBelongingChecks(
          dateKey,
          currentChecks
        );

        savedChecks[item] = checkbox.checked;
      } catch (error) {
        console.error(
          "チェック状態の保存に失敗しました:",
          error
        );
      }
    });

    label.append(checkbox, text);
    grid.appendChild(label);
  });

  group.append(heading, grid);
  container.appendChild(group);
}
