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
            const percent = Math.round(message.progress * 100);
            statusElement.textContent =
              `文字を読み取っています... ${percent}%`;
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

// 画像の罫線位置を調べ、マスごとにOCRする
function findGridLines(canvas, direction) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;
  const isHorizontal = direction === "horizontal";
  const length = isHorizontal ? h : w;
  const cross = isHorizontal ? w : h;
  const threshold = Math.max(12, Math.floor(cross * 0.48));
  const candidates = [];

  for (let pos = 0; pos < length; pos++) {
    let dark = 0;

    for (let i = 0; i < cross; i++) {
      const x = isHorizontal ? i : pos;
      const y = isHorizontal ? pos : i;
      const k = (y * w + x) * 4;

      const gray =
        (data[k] * 299 + data[k + 1] * 587 + data[k + 2] * 114) / 1000;

      if (gray < 105) dark++;
    }

    if (dark >= threshold) candidates.push(pos);
  }

  // 太い罫線は中央付近の1本にまとめる
  const groups = [];

  for (const value of candidates) {
    const last = groups[groups.length - 1];

    if (!last || value - last.end > 3) {
      groups.push({
        start: value,
        end: value,
        sum: value,
        count: 1
      });
    } else {
      last.end = value;
      last.sum += value;
      last.count++;
    }
  }

  return groups.map(g => Math.round(g.sum / g.count));
}

// マスの画像を切り出して拡大する
function makeCellCanvas(source, x1, y1, x2, y2) {
  const padX = Math.max(2, Math.round((x2 - x1) * 0.06));
  const padY = Math.max(2, Math.round((y2 - y1) * 0.10));

  const left = Math.max(0, x1 + padX);
  const top = Math.max(0, y1 + padY);

  const width = Math.max(1, x2 - x1 - padX * 2);
  const height = Math.max(1, y2 - y1 - padY * 2);

  const scale = Math.min(
    3,
    Math.max(1.5, 900 / Math.max(width, height))
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    source,
    left,
    top,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

// ==============================
// 時間割写真を読み取る
// ==============================

async function readTimetablePhoto() {
  const photoInput = document.getElementById("timetablePhoto");
  const status = document.getElementById("timetableOcrStatus");
  const resultArea = document.getElementById("timetableOcrResult");
  const resultText = document.getElementById("timetableOcrText");
  const readButton = document.getElementById("readTimetablePhotoButton");

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

  try {
    const worker = await getTesseractWorker(status);

    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    try {
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

      status.textContent = "表の罫線を検出しています...";

      const horizontal = findGridLines(source, "horizontal");
      const vertical = findGridLines(source, "vertical");

      if (horizontal.length < 3 || vertical.length < 3) {
        throw new Error(
          "表の罫線を十分に検出できませんでした。表が大きく写る写真をお試しください。"
        );
      }

      const cells = [];

      const rowCount = horizontal.length - 1;
      const colCount = vertical.length - 1;
      const total = rowCount * colCount;

      let done = 0;

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const x1 = vertical[col];
          const x2 = vertical[col + 1];

          const y1 = horizontal[row];
          const y2 = horizontal[row + 1];

          if (x2 - x1 < 24 || y2 - y1 < 18) {
            continue;
          }

          const crop = makeCellCanvas(
            source,
            x1,
            y1,
            x2,
            y2
          );

          status.textContent =
            `マスを読み取っています... ${++done}/${total}`;

          const result = await worker.recognize(crop);

          const text = result.data.text
            .replace(/\s+/g, " ")
            .trim();

          cells.push({
            row: row + 1,
            col: col + 1,
            text
          });
        }
      }

      // OCR結果を位置情報付きで表示
      resultText.value = cells
        .map(cell =>
          `【${cell.row}行・${cell.col}列】${cell.text || "（空欄）"}`
        )
        .join("\n");

      resultArea.hidden = false;

      status.textContent =
        `読み取り完了：${cells.length}マス。曜日・時限の対応と科目名を確認してから入力してください。`;

    } finally {
      URL.revokeObjectURL(imageUrl);
    }

  } catch (error) {
    console.error("時間割のOCRに失敗しました:", error);

    status.textContent =
      error.message ||
      "読み取りに失敗しました。通信環境を確認してください。";

  } finally {
    readButton.disabled = false;
  }
}
