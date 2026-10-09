
/* ==============================
   ホーム画面：今日と明日の時間割
============================== */

const weekdayIds = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday"
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

document.addEventListener("DOMContentLoaded", () => {
  showTimetables();
});


async function showTimetables() {
  try {
    const user = await getUser();
    const subjects = await getSubjects();
    const timetable = await getTimetable();

    if (!user) {
      showMessage("初期設定を行ってください。");
      return;
    }

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

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 日付の見出し
    document.getElementById("todayTitle").textContent =
      `今日（${today.getMonth() + 1}/${today.getDate()}・${weekdayNames[today.getDay()]}）`;

    document.getElementById("tomorrowTitle").textContent =
      `明日（${tomorrow.getMonth() + 1}/${tomorrow.getDate()}・${weekdayNames[tomorrow.getDay()]}）`;

    // 今日の時間割
    renderTimetable(
      "todayTimetable",
      today,
      timetable,
      subjects,
      periodCount
    );

    // 明日の時間割
    renderTimetable(
      "tomorrowTimetable",
      tomorrow,
      timetable,
      subjects,
      periodCount
    );

  } catch (error) {
    console.error("時間割の読み込みに失敗しました:", error);
    showMessage("時間割を読み込めませんでした。");
  }
}


// 指定した日の時間割を表示
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

  // 土日
  if (weekday === 0 || weekday === 6) {
    container.textContent = "学校の時間割はありません。";
    return;
  }

  const dayId = weekdayIds[weekday];

  const lessons = timetable.filter(
    item => item.day === dayId
  );

  if (lessons.length === 0) {
    container.textContent = "時間割は未登録です。";
    return;
  }

  const lessonsByPeriod = new Map();

  lessons.forEach(item => {
    lessonsByPeriod.set(item.period, item);
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


// 初期設定がない場合などのメッセージ
function showMessage(message) {
  ["todayTimetable", "tomorrowTimetable"].forEach(id => {
    const container = document.getElementById(id);

    if (container) {
      container.textContent = message;
    }
  });
}
