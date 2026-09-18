// ========================================
// 今日の日付を表示する
// ========================================

function displayToday() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    now.getMonth() + 1;

  const date =
    now.getDate();


  const weekdays = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
  ];


  const weekday =
    weekdays[now.getDay()];


  const text =
    `${year}年${month}月${date}日（${weekday}）`;


  const todayElements =
    document.querySelectorAll(".today");


  todayElements.forEach((element) => {

    element.textContent = text;

  });

}


// ========================================
// 現在のページを選択状態にする
// ========================================

function setActiveNavigation() {

  const currentPage =
    location.pathname.split("/").pop()
    || "index.html";


  const navigationLinks =
    document.querySelectorAll(".nav-link");


  navigationLinks.forEach((link) => {

    const linkPage =
      link.getAttribute("href");


    if (linkPage === currentPage) {

      link.classList.add("active");

    }

  });

}


// ========================================
// 初期設定が完了しているか確認する
// ========================================

async function checkInitialSetup() {


  // 現在のページを取得

  const currentPage =
    location.pathname.split("/").pop()
    || "index.html";


  // 初期設定ページならチェックしない

  if (currentPage === "setup.html") {

    return;

  }


  try {

    // 保存されているユーザー情報を取得

    const user =
      await getUser();


    // 初期設定が完了していなければ
    // setup.htmlへ移動

    if (
      !user ||
      user.setupCompleted !== true
    ) {

      window.location.href =
        "setup.html";

    }

  } catch (error) {

    console.error(
      "初期設定の確認に失敗しました:",
      error
    );

  }

}


// ========================================
// ページ読み込み後に実行
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    displayToday();

    setActiveNavigation();

    await checkInitialSetup();

  }
);
