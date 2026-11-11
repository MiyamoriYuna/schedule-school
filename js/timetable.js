// ==============================
// 時間割設定
// ==============================

let currentGrade = "";
let availableSubjects = [];
let currentWeekStart = "";

// 曜日
const days = [
  { id: "monday", name: "月" },
  { id: "tuesday", name: "火" },
  { id: "wednesday", name: "水" },
  { id: "thursday", name: "木" },
  { id: "friday", name: "金" },
  { id: "saturday", name: "土" }
];

// ==============================
// 初期化
// ==============================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await getUser();

    if (!user) {
      alert("先に設定画面で学年を登録してください。");
      return;
    }

    currentGrade = user.grade;

    document.getElementById("gradeInfo").textContent =
      `現在の学年：${currentGrade}`;

    const modeInfo =
      document.getElementById("timetableModeInfo");

    const weekSelector =
      document.getElementById("weekSelectorContainer");

    // 中学生：基本時間割
    if (currentGrade.startsWith("中学")) {
      modeInfo.textContent =
        "管理方式：基本時間割（通常は同じ時間割を使用します）";

      weekSelector.style.display = "none";
    }

    // 高校生：週別時間割
    else if (currentGrade.startsWith("高校")) {
      modeInfo.textContent =
        "管理方式：週別時間割（週ごとに時間割を設定します）";

      weekSelector.style.display = "block";

      currentWeekStart = getMondayDateString(new Date());

      const weekStartDate =
        document.getElementById("weekStartDate");

      weekStartDate.value = currentWeekStart;

      updateWeekInfo();

      // 選択した日付を含む週の時間割に切り替える
      weekStartDate.addEventListener("change", async (event) => {
        if (!event.target.value) {
          return;
        }

        const selectedDate =
          new Date(`${event.target.value}T00:00:00`);

        currentWeekStart =
          getMondayDateString(selectedDate);

        // 入力欄も月曜日の日付にそろえる
        event.target.value = currentWeekStart;

        updateWeekInfo();

        await loadTimetable();
      });
    }

    // 学年が正しく登録されていない場合
    else {
      modeInfo.textContent = "学年を確認してください。";
      return;
    }

    // 教科一覧を取得
    availableSubjects = await getSubjects();

    // 時間割の表を作成
    createTimetable();

    // 保存済みの時間割を読み込む
    await loadTimetable();

    // 保存ボタン
    document
      .getElementById("saveTimetableButton")
      .addEventListener("click", saveCurrentTimetable);

    // 写真プレビュー機能
    setupTimetablePhotoPreview();

  } catch (error) {
    console.error("時間割設定の初期化に失敗しました:", error);

    alert(
      "時間割設定を読み込めませんでした。ページを再読み込みしてください。"
    );
  }
});

// ==============================
// 指定した日付を含む週の月曜日を取得
// ==============================

function getMondayDateString(date) {
  const monday = new Date(date);

  const day = monday.getDay();

  // 日曜日なら6日前、それ以外は月曜日まで戻す
  const difference = day === 0 ? -6 : 1 - day;

  monday.setDate(monday.getDate() + difference);

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}

// ==============================
// 対象の週を表示
// ==============================

function updateWeekInfo() {
  const date = new Date(`${currentWeekStart}T00:00:00`);

  // 月曜日から5日後の土曜日
  const saturday = new Date(date);
  saturday.setDate(date.getDate() + 5);

  const formatDate = (value) =>
    `${value.getMonth() + 1}/${value.getDate()}`;

  document.getElementById("weekInfo").textContent =
    `${formatDate(date)}〜${formatDate(saturday)} の時間割`;
}

// ==============================
// 時限数
// ==============================

function getPeriodCount() {
  // 中学生は6限まで
  if (currentGrade.startsWith("中学")) {
    return 6;
  }

  // 高校生
  if (currentGrade.startsWith("高校")) {
    // 高校3年生は8限まで
    if (
      currentGrade === "高校3年" ||
      currentGrade === "高校3年生"
    ) {
      return 8;
    }

    // 高校1・2年生は7限まで
    return 7;
  }

  return 6;
}

// ==============================
// 時限名
// ==============================

function getPeriodName(period) {
  // 高校3年生の8限目は補習
  if (
    currentGrade.startsWith("高校") &&
    (
      currentGrade === "高校3年" ||
      currentGrade === "高校3年生"
    ) &&
    period === 8
  ) {
    return "補習";
  }

  return `${period}限`;
}

// ==============================
// 時間割の表を作成
// ==============================

function createTimetable() {
  const container =
    document.getElementById("timetableContainer");

  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "timetable-setting";

  // ------------------------------
  // ヘッダー
  // ------------------------------

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // 左上の空欄
  const emptyHeader = document.createElement("th");
  emptyHeader.textContent = "";
  headerRow.appendChild(emptyHeader);

  // 曜日
  days.forEach(day => {
    const th = document.createElement("th");
    th.textContent = `${day.name}曜日`;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ------------------------------
  // 時間割の入力欄
  // ------------------------------

  const tbody = document.createElement("tbody");
  const periodCount = getPeriodCount();

  for (let period = 1; period <= periodCount; period++) {
    const row = document.createElement("tr");

    // 時限
    const periodCell = document.createElement("th");
    periodCell.textContent = getPeriodName(period);
    row.appendChild(periodCell);

    // 各曜日の教科選択欄
    days.forEach(day => {
      const cell = document.createElement("td");
      const select = document.createElement("select");

      select.className = "timetable-select";
      select.dataset.day = day.id;
      select.dataset.period = period;

      // 未設定
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "未設定";
      select.appendChild(emptyOption);

      // 登録済みの教科
      availableSubjects.forEach(subject => {
        const option = document.createElement("option");

        option.value = subject.id;
        option.textContent = subject.name;

        select.appendChild(option);
      });

      cell.appendChild(select);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  container.appendChild(table);
}

// ==============================
// 保存されている時間割を読み込む
// ==============================

async function loadTimetable() {
  // 入力欄をいったん空にする
  document.querySelectorAll(".timetable-select").forEach(select => {
    select.value = "";
  });

  let timetable = [];

  if (currentGrade.startsWith("高校")) {
    // 高校生：選択中の週の時間割
    timetable = await getWeeklyTimetable(currentWeekStart);

    // 週別時間割がまだ一度も保存されていない場合は、
    // 従来の基本時間割を参考として表示する
    if (
      timetable.length === 0 &&
      !(await hasWeeklyTimetable())
    ) {
      timetable = await getTimetable();
    }
  } else {
    // 中学生：基本時間割
    timetable = await getTimetable();
  }

  // 取得したデータを入力欄に反映
  timetable.forEach(item => {
    const selector =
      `.timetable-select[data-day="${item.day}"][data-period="${item.period}"]`;

    const select = document.querySelector(selector);

    if (select) {
      select.value = item.subjectId;
    }
  });
}

// ==============================
// 時間割を保存
// ==============================

async function saveCurrentTimetable() {
  const selects =
    document.querySelectorAll(".timetable-select");

  const timetable = [];

  selects.forEach(select => {
    // 未設定の欄は保存しない
    if (!select.value) {
      return;
    }

    timetable.push({
      id: `${select.dataset.day}-${select.dataset.period}`,
      day: select.dataset.day,
      period: Number(select.dataset.period),
      subjectId: select.value
    });
  });

  const saveButton =
    document.getElementById("saveTimetableButton");

  const message =
    document.getElementById("saveMessage");

  try {
    saveButton.disabled = true;
    message.textContent = "保存しています……";

    if (currentGrade.startsWith("高校")) {
      // 高校生：週別の時間割として保存
      await saveWeeklyTimetable(currentWeekStart, timetable);
    } else {
      // 中学生：基本時間割として保存
      await saveTimetable(timetable);
    }

    message.textContent = "時間割を保存しました！";

  } catch (error) {
    console.error("時間割の保存に失敗しました:", error);

    message.textContent =
      "保存に失敗しました。データベースの設定を確認してください。";

  } finally {
    saveButton.disabled = false;
  }

  // メッセージを3秒後に消す
  setTimeout(() => {
    message.textContent = "";
  }, 3000);
}


// ==============================
// 時間割写真のプレビュー
// ==============================

let timetablePhotoUrl = null;

// 写真選択・取り消し機能を設定
function setupTimetablePhotoPreview() {
  const photoInput =
    document.getElementById("timetablePhoto");

  const preview =
    document.getElementById("timetablePhotoPreview");

  const previewImage =
    document.getElementById("timetablePhotoImage");

  const removeButton =
    document.getElementById("removeTimetablePhotoButton");

  const readButton =
    document.getElementById("readTimetablePhotoButton");

  if (
    !photoInput ||
    !preview ||
    !previewImage ||
    !removeButton ||
    !readButton
  ) {
    return;
  }

  // 写真を選択したとき
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    if (!file) {
      return;
    }

    // 写真を選択したら読み取りボタンを有効にする
    readButton.disabled = false;

    // 前回の読み取り結果を消す
    const status = document.getElementById("timetableOcrStatus");
    const resultArea = document.getElementById("timetableOcrResult");
    const resultText = document.getElementById("timetableOcrText");

    if (status) status.textContent = "";
    if (resultArea) resultArea.hidden = true;
    if (resultText) resultText.value = "";

    // 画像ファイルか確認
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");
      photoInput.value = "";
      readButton.disabled = true;
      return;
    }

    // 前の写真のURLを解放
    if (timetablePhotoUrl) {
      URL.revokeObjectURL(timetablePhotoUrl);
    }

    // 選択した写真を表示
    timetablePhotoUrl = URL.createObjectURL(file);

    previewImage.src = timetablePhotoUrl;
    preview.hidden = false;
  });

  // 写真を取り消したとき
  removeButton.addEventListener("click", () => {
    photoInput.value = "";
    readButton.disabled = true;

    previewImage.removeAttribute("src");
    preview.hidden = true;

    // 使用済みURLを解放
    if (timetablePhotoUrl) {
      URL.revokeObjectURL(timetablePhotoUrl);
      timetablePhotoUrl = null;
    }
  });

  // 読み取りボタンを押したとき
  readButton.addEventListener("click", readTimetablePhoto);
}

// ==============================
// 時間割写真の文字読み取り（OCR）
// 第1段階：現在の高校の時間割形式（月〜金・1〜7限）に対応
// ==============================

let timetableOcrWorker = null;
let timetableOcrWorkerPromise = null;

// OCRエンジンを必要なときだけ読み込む
async function loadTesseract() {
  if (window.Tesseract) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

    script.onload = resolve;
    script.onerror = () => reject(
      new Error("OCRエンジンを読み込めませんでした。")
    );

    document.head.appendChild(script);
  });
}

// 日本語OCRワーカーを作成（2回目以降は再利用）
async function getTesseractWorker(statusElement) {
  if (timetableOcrWorker) {
    return timetableOcrWorker;
  }

  if (!timetableOcrWorkerPromise) {
    timetableOcrWorkerPromise = (async () => {
      await loadTesseract();

      return await Tesseract.createWorker("jpn", 1, {
        logger: (message) => {
          if (!statusElement) return;

          if (message.status === "loading language traineddata") {
            statusElement.textContent = "日本語データを読み込んでいます...";
          } else if (message.status === "recognizing text") {
            statusElement.textContent =
              `文字を読み取っています... ${Math.round(message.progress * 100)}%`;
          } else if (message.status === "initializing tesseract") {
            statusElement.textContent = "OCRエンジンを準備しています...";
          }
        }
      });
    })().catch((error) => {
      timetableOcrWorkerPromise = null;
      throw error;
    });
  }

  timetableOcrWorker = await timetableOcrWorkerPromise;
  return timetableOcrWorker;
}

// 写真内の表から、曜日・時限ごとのマスを切り出す
// 座標は今回の高校の時間割写真に合わせた割合
const SCHOOL_TIMETABLE_TEMPLATE = {
  x: [0.137, 0.306, 0.473, 0.641, 0.809, 0.988],
  y: [0.222, 0.328, 0.434, 0.544, 0.651, 0.758, 0.865, 0.975],
  dayIds: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  dayNames: ["月", "火", "水", "木", "金"]
};

// マスの画像を切り出して拡大する
function makeTimetableCellCanvas(source, x1, y1, x2, y2) {
  const width = x2 - x1;
  const height = y2 - y1;

  const padX = Math.round(width * 0.045);
  const padY = Math.round(height * 0.09);

  const left = Math.max(0, x1 + padX);
  const top = Math.max(0, y1 + padY);

  const cropWidth = Math.max(1, width - padX * 2);
  const cropHeight = Math.max(1, height - padY * 2);

  const scale = Math.min(
    4,
    Math.max(2, 1000 / Math.max(cropWidth, cropHeight))
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(cropWidth * scale);
  canvas.height = Math.round(cropHeight * scale);

  const context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    source,
    left,
    top,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

// OCR結果を科目名と照合するための表記ゆれ整理
function normalizeOcrSubjectName(value) {
  return String(value || "")
    .replace(/[\s　]/g, "")
    .replace(/[‐‑‒–—ー]/g, "")
    .replace(/[ⅠＩ]/g, "I")
    .replace(/[Ⅱ]/g, "II")
    .replace(/[Ⅲ]/g, "III")
    .replace(/[αΑ]/g, "α")
    .replace(/[βΒ]/g, "β")
    .replace(/[()（）「」『』【】]/g, "");
}

// 読み取った内容のうち、登録済み科目と完全一致するものだけ時間割に反映
function applyTimetableOcrResult() {
  const resultText =
    document.getElementById("timetableOcrText");

  const message =
    document.getElementById("timetableOcrApplyMessage");

  if (!resultText) return;

  const subjectMap = new Map(
    availableSubjects.map(subject => [
      normalizeOcrSubjectName(subject.name),
      subject.id
    ])
  );

  const dayMap = {
    月: "monday",
    火: "tuesday",
    水: "wednesday",
    木: "thursday",
    金: "friday"
  };

  let applied = 0;
  let unmatched = 0;

  resultText.value.split("\n").forEach(line => {
    const match = line.match(/^【([月火水木金])・([1-7])限】\s*(.*)$/);

    if (!match) return;

    const [, dayName, periodText, rawSubject] = match;

    const subjectId =
      subjectMap.get(normalizeOcrSubjectName(rawSubject));

    if (!subjectId) {
      if (
        rawSubject.trim() &&
        rawSubject.trim() !== "（空欄）"
      ) {
        unmatched++;
      }

      return;
    }

    const selector =
      `.timetable-select[data-day="${dayMap[dayName]}"][data-period="${Number(periodText)}"]`;

    const select = document.querySelector(selector);

    if (select) {
      select.value = subjectId;
      applied++;
    }
  });

  if (message) {
    message.textContent =
      `科目名が一致した ${applied} マスを入力しました。` +
      `${unmatched ? ` 予定・未登録科目など ${unmatched} マスは手動で確認してください。` : ""}`;
  }
}

// ==============================
// 時間割写真を読み取る
// ==============================

async function readTimetablePhoto() {
  const photoInput =
    document.getElementById("timetablePhoto");

  const status =
    document.getElementById("timetableOcrStatus");

  const resultArea =
    document.getElementById("timetableOcrResult");

  const resultText =
    document.getElementById("timetableOcrText");

  const readButton =
    document.getElementById("readTimetablePhotoButton");

  const file = photoInput?.files?.[0];

  if (!file) {
    alert("先に時間割の写真を選択してください。");
    return;
  }

  if (!status || !resultArea || !resultText || !readButton) {
    return;
  }

  readButton.disabled = true;
  resultArea.hidden = true;
  status.textContent = "写真を準備しています...";

  let imageUrl = null;

  try {
    const worker = await getTesseractWorker(status);

    const image = new Image();
    imageUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      image.onload = resolve;

      image.onerror = () => reject(
        new Error("写真を開けませんでした。")
      );

      image.src = imageUrl;
    });

    const source = document.createElement("canvas");

    source.width = image.naturalWidth;
    source.height = image.naturalHeight;

    source.getContext("2d").drawImage(image, 0, 0);

    // 今回のテンプレートは横長写真を想定
    // 大きく異なる場合は誤認識を防ぐため停止
    const ratio = source.width / source.height;

    if (ratio < 1.55 || ratio > 2.25) {
      throw new Error(
        "写真の縦横比が想定と異なります。時間割の表全体が入るように、横向きで撮影してください。"
      );
    }

    const template = SCHOOL_TIMETABLE_TEMPLATE;

    const cells = [];
    const total = 35;

    let done = 0;

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        const x1 =
          Math.round(template.x[col] * source.width);

        const x2 =
          Math.round(template.x[col + 1] * source.width);

        const y1 =
          Math.round(template.y[row] * source.height);

        const y2 =
          Math.round(template.y[row + 1] * source.height);

        const crop = makeTimetableCellCanvas(
          source,
          x1,
          y1,
          x2,
          y2
        );

        status.textContent =
          `授業欄を読み取っています... ${++done}/${total}`;

        const result = await worker.recognize(crop);

        const text = result.data.text
          .replace(/[\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        cells.push({
          day: template.dayNames[col],
          period: row + 1,
          text: text || "（空欄）"
        });
      }
    }

    resultText.value = cells
      .map(cell =>
        `【${cell.day}・${cell.period}限】${cell.text}`
      )
      .join("\n");

    resultArea.hidden = false;

    status.textContent =
      "読み取りが完了しました。文字を確認・修正し、「時間割に反映」を押してください。行事や特別時間割は通常の科目として自動登録しません。";

  } catch (error) {
    console.error("時間割のOCRに失敗しました:", error);

    status.textContent =
      error.message ||
      "読み取りに失敗しました。通信環境を確認してください。";

  } finally {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    readButton.disabled = false;
  }
}

// ==============================
// OCR結果を時間割に反映するボタン
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const applyButton =
    document.getElementById("applyTimetableOcrButton");

  if (applyButton) {
    applyButton.addEventListener(
      "click",
      applyTimetableOcrResult
    );
  }
});
