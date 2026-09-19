// ========================================
// 教科・科目設定ページ
// ========================================


let currentGrade = "";


// ========================================
// ページ読み込み
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // ユーザー情報を取得

    const user =
      await getUser();


    if (!user) {

      return;

    }


    // 学年を保存

    currentGrade =
      user.grade;


    // 学年表示

    document.getElementById(
      "gradeTitle"
    ).textContent =
      `${currentGrade}の教科・科目`;


    // 教科一覧を表示

    displaySubjects();


    // 保存されている科目を
    // チェック状態にする

    await loadSavedSubjects();


    // 保存ボタン

    document
      .getElementById(
        "saveSubjectsButton"
      )
      .addEventListener(
        "click",
        saveSelectedSubjects
      );

  }
);


// ========================================
// 教科・科目を画面に表示
// ========================================

function displaySubjects() {


  const container =
    document.getElementById(
      "subjectContainer"
    );


  // 学年に対応するデータ

  const subjects =
    getSubjectsForGrade(
      currentGrade
    );


  // 一度空にする

  container.innerHTML = "";


  // 教科ごとに処理

  Object.entries(subjects)
    .forEach(
      ([category, subjectList]) => {


        // 教科カードを作る

        const card =
          document.createElement(
            "section"
          );


        card.className =
          "card subject-card";


        // 教科名

        const title =
          document.createElement(
            "h2"
          );


        title.textContent =
          category;


        card.appendChild(title);


        // 科目一覧

        subjectList.forEach(
          (subjectName) => {


            // label

            const label =
              document.createElement(
                "label"
              );


            label.className =
              "subject-option";


            // checkbox

            const checkbox =
              document.createElement(
                "input"
              );


            checkbox.type =
              "checkbox";


            checkbox.className =
              "subject-checkbox";


            checkbox.dataset.category =
              category;


            checkbox.dataset.subject =
              subjectName;


            // 科目名

            const text =
              document.createElement(
                "span"
              );


            text.textContent =
              subjectName;


            // labelに追加

            label.appendChild(
              checkbox
            );

            label.appendChild(
              text
            );


            // カードに追加

            card.appendChild(
              label
            );

          }
        );


        // 全体に追加

        container.appendChild(
          card
        );

      }
    );

}


// ========================================
// 保存されている科目を読み込む
// ========================================

async function loadSavedSubjects() {


  const savedSubjects =
    await getSubjects();


  savedSubjects.forEach(
    (savedSubject) => {


      const checkbox =
        document.querySelector(
          `input[data-subject="${savedSubject.name}"]`
        );


      if (checkbox) {

        checkbox.checked = true;

      }

    }
  );

}


// ========================================
// 選択された科目を保存
// ========================================

async function saveSelectedSubjects() {


  // チェックされたものだけ取得

  const checked =
    document.querySelectorAll(
      ".subject-checkbox:checked"
    );


  const subjects = [];


  checked.forEach(
    (checkbox) => {


      const category =
        checkbox.dataset.category;


      const name =
        checkbox.dataset.subject;


      // データを作る

      subjects.push({

        id:
          `${currentGrade}-${category}-${name}`,

        grade:
          currentGrade,

        category:
          category,

        name:
          name

      });

    }
  );


  // データベースに保存

  try {

    await saveSubjects(
      subjects
    );


    document.getElementById(
      "saveMessage"
    ).textContent =
      "保存しました！";


  } catch (error) {

    console.error(
      "科目の保存に失敗しました:",
      error
    );


    document.getElementById(
      "saveMessage"
    ).textContent =
      "保存に失敗しました。";

  }

}
