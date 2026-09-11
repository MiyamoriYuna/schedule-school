// ========================================
// 今日の日付を表示する
// ========================================

function displayToday() {

  // 現在の日時を取得する
  const now = new Date();

  // 年・月・日を取得する
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  // 曜日の一覧
  const weekdays = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
  ];

  // 今日の曜日を取得する
  const weekday = weekdays[now.getDay()];

  // 表示する文字を作る
  const text =
    `${year}年${month}月${date}日（${weekday}）`;

  // class="today"の要素を取得する
  const todayElements =
    document.querySelectorAll(".today");

  // 取得した要素に日付を表示する
  todayElements.forEach((element) => {

    element.textContent = text;

  });

}


// ========================================
// 現在のページを判定する
// ========================================

function setActiveNavigation() {

  // 現在開いているHTMLファイル名を取得する
  const currentPage =
    location.pathname.split("/").pop() || "index.html";


  // 下部ナビゲーションのボタンをすべて取得する
  const navigationLinks =
    document.querySelectorAll(".nav-link");


  // それぞれのボタンを確認する
  navigationLinks.forEach((link) => {

    // ボタンのリンク先を取得する
    const linkPage =
      link.getAttribute("href");


    // 現在のページとリンク先が同じなら
    if (linkPage === currentPage) {

      // activeクラスを追加する
      link.classList.add("active");

    }

  });

}


// ========================================
// ページの読み込みが完了したら実行
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // 今日の日付を表示
    displayToday();

    // 現在のページを選択状態にする
    setActiveNavigation();

  }
);
