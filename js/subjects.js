
// ========================================
// 教科・科目設定ページ
// ========================================

let currentGrade = "";
let editingSubjectId = null;
let allSubjects = [];

// ========================================
// ページ読み込み
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUser();

    if (!user) {
      alert("先に設定画面で学年を登録してください。");
      return;
    }

    currentGrade = user.grade;

    document.getElementById("gradeTitle").textContent =
      `${currentGrade}の教科・科目`;

    // 検索
    document.getElementById("subjectSearch")
      .addEventListener("input", displaySubjects);

    // カテゴリ絞り込み
    document.getElementById("categoryFilter")
      .addEventListener("change", displaySubjects);

    // 登録・更新
    document.getElementById("addCustomSubjectButton")
      .addEventListener("click", saveSubjectFromForm);

    // 編集キャンセル
    document.getElementById("cancelEditButton")
      .addEventListener("click", cancelSubjectEdit);

    await loadSubjects();

  } catch (error) {
    console.error("教科設定の初期化に失敗しました:", error);
    alert("教科設定を読み込めませんでした。");
  }
});

// ========================================
// 教科一覧を読み込む
// ========================================

async function loadSubjects() {
  const subjects = await getSubjects();

  allSubjects = subjects.filter(subject =>
    subject.grade === currentGrade
  );

  updateCategoryFilter();
  displaySubjects();
}

// ========================================
// カテゴリの選択肢を更新
// ========================================

function updateCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  const selectedValue = select.value;

  const categories = [
    ...new Set(allSubjects.map(subject => subject.category))
  ].sort();

  select.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべて";
  select.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  if (categories.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

// ========================================
// 教科一覧を表示
// ========================================

function displaySubjects() {
  const container = document.getElementById("subjectContainer");
  const keyword = document.getElementById("subjectSearch")
    .value.trim().toLowerCase();

  const selectedCategory =
    document.getElementById("categoryFilter").value;

  container.innerHTML = "";

  const filteredSubjects = allSubjects.filter(subject => {
    const categoryMatches =
      selectedCategory === "all" ||
      subject.category === selectedCategory;

    const searchableText = [
      subject.category,
      subject.name,
      subject.officialName || "",
      ...(subject.aliases || [])
    ].join(" ").toLowerCase();

    return categoryMatches && searchableText.includes(keyword);
  });

  // カテゴリごとに分類
  const groups = new Map();

  filteredSubjects.forEach(subject => {
    if (!groups.has(subject.category)) {
      groups.set(subject.category, []);
    }

    groups.get(subject.category).push(subject);
  });

  groups.forEach((subjects, category) => {
    const card = document.createElement("section");
    card.className = "card subject-card";

    const heading = document.createElement("h2");
    heading.textContent = category;
    card.appendChild(heading);

    subjects.forEach(subject => {
      const item = document.createElement("div");
      item.className = "subject-option";

      const information = document.createElement("div");
      information.className = "subject-information";

      const name = document.createElement("strong");
      name.textContent = subject.name;
      information.appendChild(name);

      if (subject.officialName) {
        const official = document.createElement("p");
        official.textContent = `正式名称：${subject.officialName}`;
        information.appendChild(official);
      }

      if (subject.aliases && subject.aliases.length > 0) {
        const aliases = document.createElement("p");
        aliases.textContent =
          `別名：${subject.aliases.join("、")}`;
        information.appendChild(aliases);
      }

      const buttons = document.createElement("div");
      buttons.className = "subject-action-buttons";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "編集";
      editButton.addEventListener("click", () => {
        startSubjectEdit(subject);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "削除";
      deleteButton.addEventListener("click", () => {
        removeSubject(subject);
      });

      buttons.append(editButton, deleteButton);
      item.append(information, buttons);
      card.appendChild(item);
    });

    container.appendChild(card);
  });

  document.getElementById("subjectResultCount").textContent =
    `表示中：${filteredSubjects.length}科目`;

  if (filteredSubjects.length === 0) {
    const message = document.createElement("p");
    message.textContent = allSubjects.length === 0
      ? "教科・科目はまだ登録されていません。"
      : "該当する教科・科目はありません。";

    container.appendChild(message);
  }
}

// ========================================
// フォームの入力内容を取得
// ========================================

function getSubjectFormData() {
  const category =
    document.getElementById("customCategory").value.trim();

  const name =
    document.getElementById("customSubjectName").value.trim();

  const officialName =
    document.getElementById("customOfficialName").value.trim();

  const aliases =
    document.getElementById("customAliases").value
      .split(/[、,]/)
      .map(alias => alias.trim())
      .filter(alias => alias !== "");

  return {
    category,
    name,
    officialName,
    aliases
  };
}

// ========================================
// 教科を新規登録・編集保存
// ========================================

async function saveSubjectFromForm() {
  const message =
    document.getElementById("customSubjectMessage");

  const data = getSubjectFormData();

  if (!data.category || !data.name) {
    message.textContent = "教科分類と表示名を入力してください。";
    return;
  }

  // 同じ学年・分類・表示名の重複を確認
  const duplicate = allSubjects.some(subject =>
    subject.grade === currentGrade &&
    subject.category === data.category &&
    subject.name === data.name &&
    subject.id !== editingSubjectId
  );

  if (duplicate) {
    message.textContent =
      "同じ教科分類に同じ表示名が登録されています。";
    return;
  }

  try {
    let subject;

    if (editingSubjectId) {
      // 編集：既存IDを維持する
      const oldSubject = allSubjects.find(
        item => item.id === editingSubjectId
      );

      if (!oldSubject) {
        message.textContent = "編集対象の教科が見つかりません。";
        return;
      }

      subject = {
        ...oldSubject,
        category: data.category,
        name: data.name,
        officialName: data.officialName,
        aliases: data.aliases
      };

    } else {
      // 新規登録：新しいIDを発行する
      subject = {
        id: createSubjectId(),
        grade: currentGrade,
        category: data.category,
        name: data.name,
        officialName: data.officialName,
        aliases: data.aliases,
        custom: true
      };
    }

    await saveSubject(subject);

    message.textContent = editingSubjectId
      ? `「${data.name}」を更新しました。`
      : `「${data.name}」を登録しました。`;

    resetSubjectForm();
    await loadSubjects();

  } catch (error) {
    console.error("教科の保存に失敗しました:", error);
    message.textContent = "保存に失敗しました。";
  }
}

// ========================================
// 新しい教科IDを作成
// ========================================

function createSubjectId() {
  if (crypto.randomUUID) {
    return `subject-${crypto.randomUUID()}`;
  }

  return `subject-${Date.now()}-${Math.random()
    .toString(36).slice(2)}`;
}

// ========================================
// 教科の編集を開始
// ========================================

function startSubjectEdit(subject) {
  editingSubjectId = subject.id;

  document.getElementById("formTitle").textContent =
    "教科・科目を編集";

  document.getElementById("customCategory").value =
    subject.category;

  document.getElementById("customSubjectName").value =
    subject.name;

  document.getElementById("customOfficialName").value =
    subject.officialName || "";

  document.getElementById("customAliases").value =
    (subject.aliases || []).join("、");

  document.getElementById("addCustomSubjectButton").textContent =
    "変更を保存";

  document.getElementById("cancelEditButton").hidden = false;

  document.getElementById("subjectForm").scrollIntoView({
    behavior: "smooth"
  });
}

// ========================================
// 編集をキャンセル
// ========================================

function cancelSubjectEdit() {
  resetSubjectForm();

  document.getElementById("customSubjectMessage").textContent =
    "編集をキャンセルしました。";
}

// ========================================
// フォームを初期状態に戻す
// ========================================

function resetSubjectForm() {
  editingSubjectId = null;

  document.getElementById("customCategory").value = "";
  document.getElementById("customSubjectName").value = "";
  document.getElementById("customOfficialName").value = "";
  document.getElementById("customAliases").value = "";

  document.getElementById("formTitle").textContent =
    "教科・科目を追加";

  document.getElementById("addCustomSubjectButton").textContent =
    "登録する";

  document.getElementById("cancelEditButton").hidden = true;
}

// ========================================
// 教科を削除
// ========================================

async function removeSubject(subject) {
  const confirmed = confirm(
    `「${subject.name}」を削除しますか？\n\n` +
    "時間割や持ち物設定で使用中の場合は削除できません。"
  );

  if (!confirmed) return;

  const message =
    document.getElementById("customSubjectMessage");

  try {
    // 使用中かどうか確認し、安全に削除
    await deleteSubjectIfUnused(subject.id);

    message.textContent =
      `「${subject.name}」を削除しました。`;

    if (editingSubjectId === subject.id) {
      resetSubjectForm();
    }

    await loadSubjects();

  } catch (error) {
    console.error("教科の削除に失敗しました:", error);

    message.textContent = error.message ||
      "削除に失敗しました。";
  }
}
