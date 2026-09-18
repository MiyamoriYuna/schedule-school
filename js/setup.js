// ========================================
// 初期設定ページ
// ========================================


// HTMLの読み込みが終わったら実行

document.addEventListener(
  "DOMContentLoaded",
  () => {


    // 初期設定完了ボタンを取得

    const setupButton =
      document.getElementById("setupButton");


    // ボタンが押されたとき

    setupButton.addEventListener(
      "click",
      completeSetup
    );

  }
);


// ========================================
// 初期設定を完了する
// ========================================

async function completeSetup() {


  // ----------------------------------------
  // 入力された情報を取得
  // ----------------------------------------

  const name =
    document.getElementById(
      "nameInput"
    ).value.trim();


  const grade =
    document.getElementById(
      "gradeInput"
    ).value;


  // ----------------------------------------
  // 通知設定を取得
  // ----------------------------------------

  const notificationElement =
    document.querySelector(
      'input[name="notification"]:checked'
    );


  // ----------------------------------------
  // エラーメッセージを取得
  // ----------------------------------------

  const errorMessage =
    document.getElementById(
      "errorMessage"
    );


  // 一度エラーを消す

  errorMessage.textContent = "";


  // ----------------------------------------
  // 入力チェック
  // ----------------------------------------

  if (name === "") {

    errorMessage.textContent =
      "名前・ニックネームを入力してください。";

    return;

  }


  if (grade === "") {

    errorMessage.textContent =
      "学年を選択してください。";

    return;

  }


  if (!notificationElement) {

    errorMessage.textContent =
      "通知を受け取るかどうか選択してください。";

    return;

  }


  // ----------------------------------------
  // ユーザー情報を作成
  // ----------------------------------------

  const user = {

    id: "current",

    name: name,

    grade: grade,

    notification:
      notificationElement.value,

    setupCompleted: true

  };


  // ----------------------------------------
  // データベースに保存
  // ----------------------------------------

  try {

    await saveUser(user);


    // 保存できたらホームへ移動

    window.location.href =
      "index.html";


  } catch (error) {

    console.error(
      "初期設定の保存に失敗しました:",
      error
    );


    errorMessage.textContent =
      "保存に失敗しました。もう一度試してください。";

  }

}
