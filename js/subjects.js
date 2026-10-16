// ========================================
// 教科・科目設定ページ
// ========================================


let currentGrade = "";

let allSubjectCategories = [];
let selectedCategory = "all";
let searchKeyword = "";



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

// 検索・絞り込み機能を設定
setupSubjectFilters();


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
  const container = document.getElementById("subjectContainer");

  const subjects = getSubjectsForGrade(currentGrade);

  container.innerHTML = "";
  allSubjectCategories = Object.entries(subjects);

  allSubjectCategories.forEach(([category, subjectList]) => {
    const card = document.createElement("section");
    card.className = "card subject-card";
    card.dataset.category = category;

    const title = document.createElement("h2");
    title.textContent = category;
    card.appendChild(title);

    subjectList.forEach((subjectName) => {
      const label = document.createElement("label");
      label.className = "subject-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "subject-checkbox";
      checkbox.dataset.category = category;
      checkbox.dataset.subject = subjectName;

      const text = document.createElement("span");
      text.textContent = subjectName;

      label.appendChild(checkbox);
      label.appendChild(text);
      card.appendChild(label);
    });

    container.appendChild(card);
  });

  createSubjectFilterButtons();
  filterSubjects();
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


/* ========================================
   検索・教科フィルター
======================================== */

// 教科フィルターのボタンを作成
function createSubjectFilterButtons() {
  const container = document.getElementById("subjectFilters");

  container.innerHTML = "";

  const categories = [
    ["all", "すべて"],
    ...allSubjectCategories.map(([category]) => [
      category,
      category
    ])
  ];

  categories.forEach(([category, labelText]) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "subject-filter";
    button.dataset.category = category;
    button.textContent = labelText;

    if (category === selectedCategory) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedCategory = category;

      container.querySelectorAll(".subject-filter")
        .forEach((filterButton) => {
          filterButton.classList.toggle(
            "active",
            filterButton.dataset.category === selectedCategory
          );
        });

      filterSubjects();
    });

    container.appendChild(button);
  });
}

// 検索欄を設定
function setupSubjectFilters() {
  const searchInput = document.getElementById("subjectSearch");

  searchInput.addEventListener("input", () => {
    searchKeyword = searchInput.value.trim().toLowerCase();
    filterSubjects();
  });
}

// 検索語と教科に合わせて表示
function filterSubjects() {
  const cards = document.querySelectorAll(".subject-card");
  let visibleCount = 0;
  let visibleCategoryCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const categoryMatches =
      selectedCategory === "all" ||
      category === selectedCategory;

    let cardHasVisibleSubject = false;

    const options = card.querySelectorAll(".subject-option");

    options.forEach((option) => {
      const checkbox = option.querySelector("input");
      const subjectName = checkbox.dataset.subject.toLowerCase();

      const keywordMatches =
        subjectName.includes(searchKeyword);

      const visible = categoryMatches && keywordMatches;

      option.hidden = !visible;

      if (visible) {
        cardHasVisibleSubject = true;
        visibleCount++;
      }
    });

    // 該当する科目がない教科カードは隠す
    card.hidden = !cardHasVisibleSubject;

    if (cardHasVisibleSubject) {
      visibleCategoryCount++;
    }
  });

  const count = document.getElementById("subjectResultCount");

  count.textContent =
    `表示中：${visibleCount}科目（${visibleCategoryCount}教科）`;
}

