
 // ==============================
// 時間割設定
// ==============================

let currentGrade = "";
let availableSubjects = [];
let currentWeekStart = "";

// 曜日
const days = [
  { id: "monday", name: "月" },
  { id: "tuesday", name: "火" },
  { id: "wednesday", name: "水" },
  { id: "thursday", name: "木" },
  { id: "friday", name: "金" },
  { id: "saturday", name: "土" }
];

// ==============================
// 初期化
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUser();

    if (!user) {
      alert("先に設定画面で学年を登録してください。");
      return;
    }

    currentGrade = user.grade;

    document.getElementById("gradeInfo").textContent =
      `現在の学年：${currentGrade}`;

    const modeInfo =
      document.getElementById("timetableModeInfo");

    const weekSelector =
      document.getElementById("weekSelectorContainer");

    // 中学生：基本時間割
    if (currentGrade.startsWith("中学")) {
      modeInfo.textContent =
        "管理方式：基本時間割（通常は同じ時間割を使用します）";

      weekSelector.style.display = "none";
    }

    // 高校生：週別時間割
    else if (currentGrade.startsWith("高校")) {
      modeInfo.textContent =
        "管理方式：週別時間割（週ごとに時間割を設定します）";

      weekSelector.style.display = "block";

      currentWeekStart = getMondayDateString(new Date());

      const weekStartDate =
        document.getElementById("weekStartDate");

      weekStartDate.value = currentWeekStart;

      updateWeekInfo();

      // 選択した日付を含む週の時間割に切り替える
      weekStartDate.addEventListener("change", async (event) => {
        if (!event.target.value) {
          return;
        }

        const selectedDate =
          new Date(`${event.target.value}T00:00:00`);

        currentWeekStart =
          getMondayDateString(selectedDate);

        // 入力欄も月曜日の日付にそろえる
        event.target.value = currentWeekStart;

        updateWeekInfo();

        await loadTimetable();
      });
    }

    // 学年が正しく登録されていない場合
    else {
      modeInfo.textContent = "学年を確認してください。";
      return;
    }

    // 教科一覧を取得
    availableSubjects = await getSubjects();

    // 時間割の表を作成
    createTimetable();

    // 保存済みの時間割を読み込む
    await loadTimetable();

    // 保存ボタン
    document
      .getElementById("saveTimetableButton")
      .addEventListener("click", saveCurrentTimetable);

  } catch (error) {
    console.error("時間割設定の初期化に失敗しました:", error);

    alert(
      "時間割設定を読み込めませんでした。ページを再読み込みしてください。"
    );
  }
});

// ==============================
// 指定した日付を含む週の月曜日を取得
// ==============================

function getMondayDateString(date) {
  const monday = new Date(date);

  const day = monday.getDay();

  // 日曜日なら6日前、それ以外は月曜日まで戻す
  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}

// ==============================
// 対象の週を表示
// ==============================

function updateWeekInfo() {
  const date = new Date(`${currentWeekStart}T00:00:00`);

  // 月曜日から5日後の土曜日
  const saturday = new Date(date);
  saturday.setDate(date.getDate() + 5);

  const formatDate = (value) =>
    `${value.getMonth() + 1}/${value.getDate()}`;

  document.getElementById("weekInfo").textContent =
    `${formatDate(date)}〜${formatDate(saturday)} の時間割`;
}

// ==============================
// 時限数
// ==============================

function getPeriodCount() {
  // 中学生は6限まで
  if (currentGrade.startsWith("中学")) {
    return 6;
  }

  // 高校生
  if (currentGrade.startsWith("高校")) {
    // 高校3年生は8限まで
    if (
      currentGrade === "高校3年" ||
      currentGrade === "高校3年生"
    ) {
      return 8;
    }

    // 高校1・2年生は7限まで
    return 7;
  }

  return 6;
}

// ==============================
// 時限名
// ==============================

function getPeriodName(period) {
  // 高校3年生の8限目は補習
  if (
    currentGrade.startsWith("高校") &&
    (
      currentGrade === "高校3年" ||
      currentGrade === "高校3年生"
    ) &&
    period === 8
  ) {
    return "補習";
  }

  return `${period}限`;
}

// ==============================
// 時間割の表を作成
// ==============================

function createTimetable() {
  const container =
    document.getElementById("timetableContainer");

  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "timetable-setting";

  // ------------------------------
  // ヘッダー
  // ------------------------------

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // 左上の空欄
  const emptyHeader = document.createElement("th");
  emptyHeader.textContent = "";
  headerRow.appendChild(emptyHeader);

  // 曜日
  days.forEach(day => {
    const th = document.createElement("th");
    th.textContent = `${day.name}曜日`;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ------------------------------
  // 時間割の入力欄
  // ------------------------------

  const tbody = document.createElement("tbody");
  const periodCount = getPeriodCount();

  for (let period = 1; period <= periodCount; period++) {
    const row = document.createElement("tr");

    // 時限
    const periodCell = document.createElement("th");
    periodCell.textContent = getPeriodName(period);
    row.appendChild(periodCell);

    // 各曜日の教科選択欄
    days.forEach(day => {
      const cell = document.createElement("td");
      const select = document.createElement("select");

      select.className = "timetable-select";
      select.dataset.day = day.id;
      select.dataset.period = period;

      // 未設定
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "未設定";
      select.appendChild(emptyOption);

      // 登録済みの教科
      availableSubjects.forEach(subject => {
        const option = document.createElement("option");

        option.value = subject.id;
        option.textContent = subject.name;

        select.appendChild(option);
      });

      cell.appendChild(select);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  container.appendChild(table);
}

// ==============================
// 保存されている時間割を読み込む
// ==============================

async function loadTimetable() {
  // 入力欄をいったん空にする
  document.querySelectorAll(".timetable-select").forEach(select => {
    select.value = "";
  });

  let timetable = [];

  if (currentGrade.startsWith("高校")) {
    // 高校生：選択中の週の時間割
    timetable = await getWeeklyTimetable(currentWeekStart);

    // 週別時間割がまだ一度も保存されていない場合は、
    // 従来の基本時間割を参考として表示する
    if (
      timetable.length === 0 &&
      !(await hasWeeklyTimetable())
    ) {
      timetable = await getTimetable();
    }
  } else {
    // 中学生：基本時間割
    timetable = await getTimetable();
  }

  // 取得したデータを入力欄に反映
  timetable.forEach(item => {
    const selector =
      `.timetable-select[data-day="${item.day}"][data-period="${item.period}"]`;

    const select = document.querySelector(selector);

    if (select) {
      select.value = item.subjectId;
    }
  });
}

// ==============================
// 時間割を保存
// ==============================

async function saveCurrentTimetable() {
  const selects =
    document.querySelectorAll(".timetable-select");

  const timetable = [];

  selects.forEach(select => {
    // 未設定の欄は保存しない
    if (!select.value) {
      return;
    }

    timetable.push({
      id: `${select.dataset.day}-${select.dataset.period}`,
      day: select.dataset.day,
      period: Number(select.dataset.period),
      subjectId: select.value
    });
  });

  const saveButton =
    document.getElementById("saveTimetableButton");

  const message =
    document.getElementById("saveMessage");

  try {
    saveButton.disabled = true;
    message.textContent = "保存しています……";

    if (currentGrade.startsWith("高校")) {
      // 高校生：週別の時間割として保存
      await saveWeeklyTimetable(currentWeekStart, timetable);
    } else {
      // 中学生：基本時間割として保存
      await saveTimetable(timetable);
    }

    message.textContent = "時間割を保存しました！";

  } catch (error) {
    console.error("時間割の保存に失敗しました:", error);

    message.textContent =
      "保存に失敗しました。データベースの設定を確認してください。";

  } finally {
    saveButton.disabled = false;
  }

  // メッセージを3秒後に消す
  setTimeout(() => {
    message.textContent = "";
  }, 3000);
}
