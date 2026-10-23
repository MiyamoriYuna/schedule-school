
/* ==============================
   持ち物設定
============================== */

let availableSubjects = [];

// 初期化
document.addEventListener("DOMContentLoaded", async () => {
  try {
    availableSubjects = await getSubjects();

    createSubjectBelongings();
    await loadBelongings();

    createDailyBelongings();
    await loadDailyBelongings();

    document
      .getElementById("saveBelongingsButton")
      .addEventListener("click", saveAllBelongings);

    document
      .getElementById("addDailyItemButton")
      .addEventListener("click", () => addDailyItem());
  } catch (error) {
    console.error("持ち物設定ページの初期化に失敗しました:", error);
  }
});

// ==============================
// 教科ごとの持ち物入力欄
// ==============================

function createSubjectBelongings() {
  const container = document.getElementById("subjectBelongingsContainer");
  container.innerHTML = "";

  if (availableSubjects.length === 0) {
    container.innerHTML = "<p>先に教科・科目設定をしてください。</p>";
    return;
  }

  availableSubjects.forEach(subject => {
    const wrapper = document.createElement("div");
    wrapper.className = "belongings-subject-item";

    const title = document.createElement("h3");
    title.textContent = subject.name;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "subject-belongings-input";
    input.dataset.subjectId = subject.id;
    input.placeholder = "例：教科書、ノート、ファイル";

    wrapper.append(title, input);
    container.appendChild(wrapper);
  });
}

// 保存済みの教科ごとの持ち物を読み込む
async function loadBelongings() {
  const belongings = await getBelongings();

  belongings.forEach(item => {
    const input = document.querySelector(
      `.subject-belongings-input[data-subject-id="${item.subjectId}"]`
    );

    if (input) {
      input.value = (item.items || []).join("、");
    }
  });
}

// ==============================
// 毎日の持ち物
// ==============================

function createDailyBelongings() {
  document.getElementById("dailyBelongingsContainer").innerHTML = "";
}

// 入力欄を追加
function addDailyItem(value = "") {
  const container = document.getElementById("dailyBelongingsContainer");

  const wrapper = document.createElement("div");
  wrapper.className = "daily-belonging-item";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "daily-belonging-input";
  input.placeholder = "例：筆箱";
  input.value = value;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "small-delete-button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => wrapper.remove());

  wrapper.append(input, deleteButton);
  container.appendChild(wrapper);
}

// 保存済みの毎日の持ち物を読み込む
async function loadDailyBelongings() {
  const items = await getDailyBelongings();
  items.forEach(item => addDailyItem(item.name));
}

// ==============================
// 設定内容を保存
// ==============================

async function saveAllBelongings() {
  const saveButton = document.getElementById("saveBelongingsButton");
  const message = document.getElementById("saveMessage");

  saveButton.disabled = true;
  message.textContent = "";

  try {
    // 教科ごとの持ち物
    const inputs = document.querySelectorAll(".subject-belongings-input");
    const subjectBelongings = [];

    inputs.forEach(input => {
      const items = input.value
        .split(/[、,，]+/)
        .map(item => item.trim())
        .filter(Boolean);

      subjectBelongings.push({
        subjectId: input.dataset.subjectId,
        items
      });
    });

    await saveBelongings(subjectBelongings);

    // 毎日の持ち物
    const dailyInputs = document.querySelectorAll(".daily-belonging-input");
    const dailyItems = [];

    dailyInputs.forEach((input, index) => {
      const name = input.value.trim();

      if (name) {
        dailyItems.push({
          id: `daily-${index}`,
          name
        });
      }
    });

    await saveDailyBelongings(dailyItems);

    message.textContent = "持ち物設定を保存しました！";
  } catch (error) {
    console.error("持ち物設定の保存に失敗しました:", error);
    message.textContent =
      "保存できませんでした。もう一度お試しください。";
  } finally {
    saveButton.disabled = false;
  }
}
