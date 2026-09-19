// ==============================
// 持ち物設定
// ==============================

let availableSubjects = [];


// ==============================
// 初期化
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    availableSubjects =
      await getSubjects();

    createSubjectBelongings();

    await loadBelongings();

    createDailyBelongings();

    await loadDailyBelongings();

    await loadTodayBelongings();

    document
      .getElementById(
        "saveBelongingsButton"
      )
      .addEventListener(
        "click",
        saveAllBelongings
      );

    document
      .getElementById(
        "addDailyItemButton"
      )
      .addEventListener(
        "click",
        addDailyItem
      );

  }
);


// ==============================
// 教科ごとの持ち物入力欄
// ==============================

function createSubjectBelongings() {

  const container =
    document.getElementById(
      "subjectBelongingsContainer"
    );

  container.innerHTML = "";


  if (availableSubjects.length === 0) {

    container.innerHTML = `
      <p>
        先に教科・科目設定をしてください。
      </p>
    `;

    return;

  }


  availableSubjects.forEach(subject => {

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "belongings-subject-item";


    const title =
      document.createElement("h3");

    title.textContent =
      subject.name;


    const input =
      document.createElement("input");

    input.type = "text";

    input.className =
      "subject-belongings-input";

    input.dataset.subjectId =
      subject.id;

    input.placeholder =
      "例：教科書、ノート、ファイル";


    wrapper.appendChild(title);

    wrapper.appendChild(input);

    container.appendChild(wrapper);

  });

}


// ==============================
// 保存されている教科の持ち物を読み込む
// ==============================

async function loadBelongings() {

  const belongings =
    await getBelongings();


  belongings.forEach(item => {

    const input =
      document.querySelector(
        `.subject-belongings-input[data-subject-id="${item.subjectId}"]`
      );


    if (input) {

      input.value =
        item.items.join("、");

    }

  });

}


// ==============================
// 毎日の持ち物
// ==============================

function createDailyBelongings() {

  const container =
    document.getElementById(
      "dailyBelongingsContainer"
    );

  container.innerHTML = "";

}


// ==============================
// 毎日の持ち物を追加
// ==============================

function addDailyItem(value = "") {

  const container =
    document.getElementById(
      "dailyBelongingsContainer"
    );


  const wrapper =
    document.createElement("div");

  wrapper.className =
    "daily-belonging-item";


  const input =
    document.createElement("input");

  input.type = "text";

  input.className =
    "daily-belonging-input";

  input.placeholder =
    "例：筆箱";

  input.value = value;


  const deleteButton =
    document.createElement("button");

  deleteButton.type = "button";

  deleteButton.className =
    "small-delete-button";

  deleteButton.textContent =
    "削除";


  deleteButton.addEventListener(
    "click",
    () => {

      wrapper.remove();

    }
  );


  wrapper.appendChild(input);

  wrapper.appendChild(deleteButton);

  container.appendChild(wrapper);

}


// ==============================
// 毎日の持ち物を読み込む
// ==============================

async function loadDailyBelongings() {

  const items =
    await getDailyBelongings();


  items.forEach(item => {

    addDailyItem(item.name);

  });

}


// ==============================
// 全保存
// ==============================

async function saveAllBelongings() {

  // ------------------------------
  // 教科ごとの持ち物
  // ------------------------------

  const inputs =
    document.querySelectorAll(
      ".subject-belongings-input"
    );


  const subjectBelongings = [];


  inputs.forEach(input => {

    const text =
      input.value.trim();


    const items =
      text
        .split(/[、,，]+/)
        .map(item => item.trim())
        .filter(item => item !== "");


    subjectBelongings.push({

      subjectId:
        input.dataset.subjectId,

      items:
        items

    });

  });


  await saveBelongings(
    subjectBelongings
  );


  // ------------------------------
  // 毎日の持ち物
  // ------------------------------

  const dailyInputs =
    document.querySelectorAll(
      ".daily-belonging-input"
    );


  const dailyItems = [];


  dailyInputs.forEach((input, index) => {

    const name =
      input.value.trim();


    if (!name) {
      return;
    }


    dailyItems.push({

      id:
        `daily-${index}`,

      name:
        name

    });

  });


  await saveDailyBelongings(
    dailyItems
  );


  // ------------------------------
  // メッセージ
  // ------------------------------

  const message =
    document.getElementById(
      "saveMessage"
    );


  message.textContent =
    "持ち物設定を保存しました！";


  setTimeout(() => {

    message.textContent = "";

  }, 3000);


  // 今日の持ち物も更新
  await loadTodayBelongings();

}


// ==============================
// 今日の持ち物を自動生成
// ==============================

async function loadTodayBelongings() {

  const container =
    document.getElementById(
      "todayBelongings"
    );


  container.innerHTML = "";


  const timetable =
    await getTimetable();


  const today =
    new Date();


  const dayNumber =
    today.getDay();


  // 土曜日・日曜日
  if (
    dayNumber === 0 ||
    dayNumber === 6
  ) {

    container.innerHTML = `
      <p>
        今日は土曜日・日曜日です。
      </p>
    `;

    return;

  }


  const dayIds = {

    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday"

  };


  const todayId =
    dayIds[dayNumber];


  // 今日の授業
  const todayClasses =
    timetable.filter(
      item => item.day === todayId
    );


  if (todayClasses.length === 0) {

    container.innerHTML = `
      <p>
        今日の時間割が設定されていません。
      </p>
    `;

    return;

  }


  // 教科ごとの持ち物
  const subjectBelongings =
    await getBelongings();


  // 毎日の持ち物
  const dailyBelongings =
    await getDailyBelongings();


  const items = [];

  const itemKeys =
    new Set();


  // ------------------------------
  // 毎日の持ち物
  // ------------------------------

  dailyBelongings.forEach(item => {

    addUniqueItem(
      items,
      itemKeys,
      item.name
    );

  });


  // ------------------------------
  // 授業ごとの持ち物
  // ------------------------------

  todayClasses
    .sort(
      (a, b) =>
        a.period - b.period
    )
    .forEach(classItem => {

      const belonging =
        subjectBelongings.find(
          item =>
            item.subjectId ===
            classItem.subjectId
        );


      if (!belonging) {
        return;
      }


      belonging.items.forEach(item => {

        addUniqueItem(
          items,
          itemKeys,
          item
        );

      });

    });


  // ------------------------------
  // 表示
  // ------------------------------

  if (items.length === 0) {

    container.innerHTML = `
      <p>
        今日必要な持ち物はまだ登録されていません。
      </p>
    `;

    return;

  }


  const list =
    document.createElement("div");

  list.className =
    "today-belongings-list";


  items.forEach(item => {

    const label =
      document.createElement("label");

    label.className =
      "belonging-checkbox";


    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";


    const text =
      document.createElement("span");

    text.textContent =
      item;


    label.appendChild(checkbox);

    label.appendChild(text);

    list.appendChild(label);

  });


  container.appendChild(list);

}


// ==============================
// 重複を除いて追加
// ==============================

function addUniqueItem(
  items,
  itemKeys,
  item
) {

  const key =
    item
      .trim()
      .toLowerCase();


  if (!key) {
    return;
  }


  if (itemKeys.has(key)) {
    return;
  }


  itemKeys.add(key);

  items.push(item);

}
