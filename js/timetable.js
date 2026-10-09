// ==============================
// 時間割設定
// ==============================

let currentGrade = "";
let availableSubjects = [];
let currentWeekStart = "";


// 曜日

const days = [
  {
    id: "monday",
    name: "月"
  },
  {
    id: "tuesday",
    name: "火"
  },
  {
    id: "wednesday",
    name: "水"
  },
  {
    id: "thursday",
    name: "木"
  },
  {
    id: "friday",
    name: "金"
  },
  {
    id: "saturday",
    name: "土"
  }
];


// ==============================
// 初期化
// ==============================


document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUser();

    if (!user) {
      return;
    }

    currentGrade = user.grade;

    document.getElementById("gradeInfo").textContent =
      `現在の学年：${currentGrade}`;

    const modeInfo = document.getElementById("timetableModeInfo");
    const weekSelector = document.getElementById("weekSelectorContainer");

    if (currentGrade.startsWith("中学")) {
      modeInfo.textContent =
        "管理方式：基本時間割（通常は同じ時間割を使用します）";

      weekSelector.style.display = "none";

    } else if (currentGrade.startsWith("高校")) {
      modeInfo.textContent =
        "管理方式：週別時間割（週ごとに時間割を設定します）";

      weekSelector.style.display = "block";

      currentWeekStart = getMondayDateString(new Date());

      document.getElementById("weekStartDate").value =
        currentWeekStart;

      updateWeekInfo();

      document
        .getElementById("weekStartDate")
        .addEventListener("change", async (event) => {
          if (!event.target.value) {
            return;
          }

          const selectedDate =
            new Date(`${event.target.value}T00:00:00`);

          currentWeekStart =
            getMondayDateString(selectedDate);

          event.target.value = currentWeekStart;

          updateWeekInfo();

          await loadTimetable();
        });

    } else {
      modeInfo.textContent =
        "学年を確認してください。";
      return;
    }

    availableSubjects = await getSubjects();

    createTimetable();

    await loadTimetable();

    document
      .getElementById("saveTimetableButton")
      .addEventListener("click", saveCurrentTimetable);

  } catch (error) {
    console.error("時間割設定の初期化に失敗しました:", error);
    alert("時間割設定を読み込めませんでした。ページを再読み込みしてください。");
  }
});


// 指定した日付を含む週の月曜日を取得する
function getMondayDateString(date) {
  const monday = new Date(date);

  const day = monday.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}


// 対象の週を表示する
function updateWeekInfo() {
  const date = new Date(`${currentWeekStart}T00:00:00`);
  const saturday = new Date(date);

  saturday.setDate(date.getDate() + 5);

  const formatDate = (value) =>
    `${value.getMonth() + 1}/${value.getDate()}`;

  document.getElementById("weekInfo").textContent =
    `${formatDate(date)}〜${formatDate(saturday)} の時間割`;
});


// ==============================
// 時限数
// ==============================

function getPeriodCount() {

  // 中学校
  if (currentGrade.startsWith("中学")) {
    return 6;
  }

  // 高校
  if (currentGrade.startsWith("高校")) {

    // 高校3年生
    if (
      currentGrade === "高校3年" ||
      currentGrade === "高校3年生"
    ) {
      return 8;
    }

    return 7;
  }

  return 6;
}


// ==============================
// 時限名
// ==============================

function getPeriodName(period) {

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
// 時間割作成
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


  const emptyHeader = document.createElement("th");

  emptyHeader.textContent = "";

  headerRow.appendChild(emptyHeader);


  days.forEach(day => {

    const th = document.createElement("th");

    th.textContent = `${day.name}曜日`;

    headerRow.appendChild(th);

  });


  thead.appendChild(headerRow);

  table.appendChild(thead);


  // ------------------------------
  // 本体
  // ------------------------------

  const tbody = document.createElement("tbody");

  const periodCount = getPeriodCount();


  for (let period = 1; period <= periodCount; period++) {

    const row = document.createElement("tr");


    // 時限
    const periodCell = document.createElement("th");

    periodCell.textContent =
      getPeriodName(period);

    row.appendChild(periodCell);


    // 曜日
    days.forEach(day => {

      const cell = document.createElement("td");

      const select =
        document.createElement("select");


      select.className = "timetable-select";


      select.dataset.day = day.id;
      select.dataset.period = period;


      // 未設定
      const emptyOption =
        document.createElement("option");

      emptyOption.value = "";

      emptyOption.textContent = "未設定";

      select.appendChild(emptyOption);


      // 教科
      availableSubjects.forEach(subject => {

        const option =
          document.createElement("option");

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

  const timetable =
    await getTimetable();


  timetable.forEach(item => {

    const selector =
      `.timetable-select[data-day="${item.day}"][data-period="${item.period}"]`;


    const select =
      document.querySelector(selector);


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

    if (!select.value) {
      return;
    }


    timetable.push({

      id:
        `${select.dataset.day}-${select.dataset.period}`,

      day:
        select.dataset.day,

      period:
        Number(select.dataset.period),

      subjectId:
        select.value

    });

  });


  await saveTimetable(timetable);


  const message =
    document.getElementById("saveMessage");

  message.textContent =
    "時間割を保存しました！";


  setTimeout(() => {

    message.textContent = "";

  }, 3000);
}
