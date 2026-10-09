
/* ==============================
   ホーム画面：今日の時間割
============================== */

// 曜日とデータベースに保存する曜日IDの対応
const weekdayIds = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday"
};


// ホーム画面を初期化
document.addEventListener("DOMContentLoaded", () => {
  showTodayTimetable();
});


// 今日の時間割を表示
async function showTodayTimetable() {
  const container = document.getElementById("todayTimetable");

  if (!container) {
    return;
  }

  try {
    // 現在の曜日を取得
    const today = new Date();
    const weekday = today.getDay();

    // 土曜日・日曜日
    if (weekday === 0 || weekday === 6) {
      container.textContent =
        "今日は時間割の登録対象外です。";
      return;
    }

    const todayId = weekdayIds[weekday];

    // 保存済みのデータを取得
    const user = await getUser();
    const subjects = await getSubjects();
    const timetable = await getTimetable();

    if (!user) {
      container.textContent =
        "初期設定を行ってください。";
      return;
    }

    // 学年に応じて時限数を決める
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

    // 今日の授業だけを取り出す
    const todayLessons = timetable.filter(
      item => item.day === todayId
    );

    // 授業が一つも登録されていない場合
    if (todayLessons.length === 0) {
      container.textContent =
        "今日の時間割はまだ登録されていません。";
      return;
    }

    // 時限ごとに授業を整理
    const lessonsByPeriod = new Map();

    todayLessons.forEach(item => {
      lessonsByPeriod.set(item.period, item);
    });

    // 表示内容を作成
    container.innerHTML = "";

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

  } catch (error) {
    console.error("時間割の読み込みに失敗しました:", error);

    container.textContent =
      "時間割を読み込めませんでした。ページを再読み込みしてください。";
  }
}
