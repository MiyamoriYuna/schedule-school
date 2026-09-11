// ========================================
// 設定ページ
// ========================================


// HTMLの読み込みが終わったら実行

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // 保存されているユーザー情報を取得
    const user = await getUser();


    // データが存在する場合
    if (user) {

      document.getElementById("nameInput").value =
        user.name || "";

      document.getElementById("gradeInput").value =
        user.grade || "";

    }

  }
);


// ========================================
// 保存ボタン
// ========================================

document
  .getElementById("saveButton")
  .addEventListener("click", async () => {


    // 入力された名前
    const name =
      document.getElementById("nameInput").value;


    // 選択された学年
    const grade =
      document.getElementById("gradeInput").value;


    // ユーザー情報を作成

    const user = {

      id: "current",

      name: name,

      grade: grade

    };


    // データベースに保存

    await saveUser(user);


    // 保存完了メッセージ

    document.getElementById(
      "saveMessage"
    ).textContent =
      "保存しました！";

  });
