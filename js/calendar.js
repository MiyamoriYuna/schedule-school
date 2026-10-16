/* 月予定ページの処理
   database.js に saveEvent / getEvents / deleteEvent があることを前提にしています。
   予定データ:
   {
     id, name, date, startTime, endTime, belongings,
     recurrence: "once" | "weekly", skippedDates: []
   }
*/
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const monthLabel = $("#calendar-month");
  const daysContainer = $("#calendar-days");
  const selectedDateHeading = $("#selected-date-heading");
  const eventList = $("#event-list");
  const formCard = $("#event-form-card");
  const form = $("#event-form");
  const formTitle = $("#event-form-title");
  const idInput = $("#event-id");
  const nameInput = $("#event-name");
  const dateInput = $("#event-date");
  const repeatInput = $("#event-repeat");
  const startInput = $("#event-start");
  const endInput = $("#event-end");
  const belongingsInput = $("#event-belongings");
  const weeklyNote = $("#weekly-note");
  const formError = $("#form-error");

  const now = new Date();
  let shownMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let selectedDate = toDateKey(now);
  let events = [];

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function dateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDate(dateKey, includeWeekday = true) {
    const date = dateFromKey(dateKey);
    const options = { year: "numeric", month: "long", day: "numeric" };
    if (includeWeekday) options.weekday = "short";
    return new Intl.DateTimeFormat("ja-JP", options).format(date);
  }

  function getEventName(event) {
    return event.name || event.title || "名前のない予定";
  }

 function isRepeating(event) {
  return ["weekly", "biweekly", "monthly"]
    .includes(getRecurrence(event));
}

  function occursOn(event, dateKey, includeSkipped = false) {
  const recurrence = getRecurrence(event);

  // 1回だけの予定
  if (recurrence === "once") {
    return event.date === dateKey;
  }

  if (!event.date || dateKey < event.date) {
    return false;
  }

  // 休みに設定された日は表示しない
  const skippedDates = Array.isArray(event.skippedDates)
    ? event.skippedDates
    : [];

  if (!includeSkipped && skippedDates.includes(dateKey)) {
    return false;
  }

  const startDate = dateFromKey(event.date);
  const targetDate = dateFromKey(dateKey);

  // 毎週・2週間に1回
  if (recurrence === "weekly" || recurrence === "biweekly") {
    if (startDate.getDay() !== targetDate.getDay()) {
      return false;
    }

    const daysDifference = Math.round(
      (targetDate - startDate) / 86400000
    );

    const weeksDifference = Math.floor(daysDifference / 7);
    const interval = recurrence === "biweekly" ? 2 : 1;

    return weeksDifference % interval === 0;
  }

  // 毎月同じ日
  if (recurrence === "monthly") {
    return startDate.getDate() === targetDate.getDate();
  }

  return event.date === dateKey;
}

  function getEventsForDate(dateKey, includeSkipped = false) {
    return events
      .filter((event) => occursOn(event, dateKey, includeSkipped))
      .sort((a, b) => {
        const timeA = a.startTime || "99:99";
        const timeB = b.startTime || "99:99";
        return timeA.localeCompare(timeB) || getEventName(a).localeCompare(getEventName(b), "ja");
      });
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderCalendar() {
    monthLabel.textContent = `${shownMonth.getFullYear()}年${shownMonth.getMonth() + 1}月`;
    daysContainer.replaceChildren();

    const firstDay = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());

    const todayKey = toDateKey(new Date());

    for (let index = 0; index < 42; index += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = toDateKey(date);
      const dayEvents = getEventsForDate(dateKey);

      const button = makeElement("button", "calendar-day");
      button.type = "button";
      button.setAttribute("aria-label", `${formatDate(dateKey)}、予定${dayEvents.length}件`);
      button.setAttribute("aria-pressed", String(dateKey === selectedDate));

      if (date.getMonth() !== shownMonth.getMonth()) button.classList.add("is-outside");
      if (dateKey === todayKey) button.classList.add("is-today");
      if (dateKey === selectedDate) button.classList.add("is-selected");
      if (date.getDay() === 0) button.classList.add("is-sunday");
      if (date.getDay() === 6) button.classList.add("is-saturday");

      button.append(makeElement("span", "day-number", String(date.getDate())));
      if (dayEvents.length > 0) {
        button.append(makeElement("span", "event-dot"));
        button.append(makeElement("span", "event-count", `${dayEvents.length}件`));
      }

      button.addEventListener("click", () => {
        selectedDate = dateKey;
        if (date.getMonth() !== shownMonth.getMonth()) {
          shownMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        }
        renderAll();
      });
      daysContainer.append(button);
    }
  }

  function renderEventList() {
    selectedDateHeading.textContent = `${formatDate(selectedDate)}の予定`;
    eventList.replaceChildren();
    // 休みに設定した繰り返し予定も一覧には表示し、取り消せるようにする
    const todaysEvents = getEventsForDate(selectedDate, true);

    if (todaysEvents.length === 0) {
      eventList.append(makeElement("p", "empty-message", "この日の予定はありません。「＋ 予定を追加」から登録できます。"));
      return;
    }

    todaysEvents.forEach((event) => {
      const isSkippedOccurrence = getRecurrence(event) === "weekly"
        && Array.isArray(event.skippedDates)
        && event.skippedDates.includes(selectedDate);
      const item = makeElement("article", "event-item");
      if (isSkippedOccurrence) item.classList.add("is-skipped");
      const top = makeElement("div", "event-item-top");
      const details = makeElement("div");
      details.append(makeElement("h3", "", getEventName(event)));
      if (isSkippedOccurrence) {
        details.append(makeElement("p", "event-time", "この日は休みに設定されています"));
      }

      const start = event.startTime || "";
      const end = event.endTime || "";
      let timeText = "時刻未設定";
      if (start && end) timeText = `${start}〜${end}`;
      else if (start) timeText = `${start}〜`;
      else if (end) timeText = `〜${end}`;
      details.append(makeElement("p", "event-time", timeText));

      const badges = makeElement("div", "event-badges");
      const recurrence = getRecurrence(event);
const weekday = ["日", "月", "火", "水", "木", "金", "土"][
  dateFromKey(event.date).getDay()
];

let recurrenceLabel = "1回のみ";

if (recurrence === "weekly") {
  recurrenceLabel = `毎週${weekday}曜日`;
} else if (recurrence === "biweekly") {
  recurrenceLabel = `2週間に1回（${weekday}曜日）`;
} else if (recurrence === "monthly") {
  recurrenceLabel = `毎月${dateFromKey(event.date).getDate()}日`;
}

badges.append(
  makeElement("span", "event-badge", recurrenceLabel)
);
      if (Array.isArray(event.skippedDates) && event.skippedDates.length) {
        badges.append(makeElement("span", "event-badge", `休み設定 ${event.skippedDates.length}日`));
      }
      details.append(badges);
      top.append(details);
      item.append(top);

      const belongings = event.belongings || "";
      if (belongings.trim()) {
        item.append(makeElement("p", "event-belongings", `持ち物：\n${belongings.trim()}`));
      }

      const actions = makeElement("div", "event-actions");
      const editButton = makeElement("button", "small-button", "編集");
      editButton.type = "button";
      editButton.addEventListener("click", () => openEditForm(event));
      actions.append(editButton);

      if (getRecurrence(event) === "weekly") {
        const skipButton = makeElement("button", "small-button", "この日だけ休みにする");
        skipButton.type = "button";
        const isSkipped = isSkippedOccurrence;
        if (isSkipped) {
          skipButton.textContent = "この日の休みを取り消す";
        }
        skipButton.addEventListener("click", async () => {
          const skippedDates = Array.isArray(event.skippedDates) ? [...event.skippedDates] : [];
          if (isSkipped) {
            await saveSkippedDate(event, skippedDates.filter((date) => date !== selectedDate));
          } else {
            await saveSkippedDate(event, [...skippedDates, selectedDate]);
          }
        });
        actions.append(skipButton);
      }

      const deleteButton = makeElement("button", "small-button danger", "削除");
      deleteButton.type = "button";
      deleteButton.addEventListener("click", async () => {
        const message = getRecurrence(event) === "weekly"
          ? `「${getEventName(event)}」の繰り返し予定をすべて削除します。よろしいですか？`
          : `「${getEventName(event)}」を削除します。よろしいですか？`;
        if (!window.confirm(message)) return;
        try {
          await deleteEvent(event.id);
          await loadEvents();
        } catch (error) {
          console.error(error);
          window.alert("予定を削除できませんでした。database.js の deleteEvent 関数を確認してください。");
        }
      });
      actions.append(deleteButton);
      item.append(actions);
      eventList.append(item);
    });
  }

  async function saveSkippedDate(event, skippedDates) {
    try {
      const updated = { ...event, skippedDates };
      await saveEvent(updated);
      await loadEvents();
    } catch (error) {
      console.error(error);
      window.alert("休みの日を保存できませんでした。database.js の saveEvent 関数を確認してください。");
    }
  }

  function renderAll() {
    renderCalendar();
    renderEventList();
  }

  function openNewForm() {
    form.reset();
    idInput.value = "";
    dateInput.value = selectedDate;
    repeatInput.value = "once";
    formTitle.textContent = "予定を登録";
    formError.hidden = true;
    formError.textContent = "";
    weeklyNote.hidden = true;
    formCard.hidden = false;
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInput.focus();
  }

  function openEditForm(event) {
    form.reset();
    idInput.value = event.id;
    nameInput.value = getEventName(event);
    dateInput.value = event.date || selectedDate;
    repeatInput.value = getRecurrence(event);
    startInput.value = event.startTime || "";
    endInput.value = event.endTime || "";
    belongingsInput.value = event.belongings || "";
    formTitle.textContent = "予定を編集";
    formError.hidden = true;
    formError.textContent = "";
    weeklyNote.hidden = repeatInput.value !== "weekly";
    formCard.hidden = false;
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInput.focus();
  }

  function closeForm() {
    formCard.hidden = true;
    formError.hidden = true;
    formError.textContent = "";
  }

  repeatInput.addEventListener("change", () => {
    weeklyNote.hidden = repeatInput.value !== "weekly";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.hidden = true;
    formError.textContent = "";

    const name = nameInput.value.trim();
    const date = dateInput.value;
    const startTime = startInput.value;
    const endTime = endInput.value;

    if (!name || !date) {
      showFormError("予定名と日付を入力してください。");
      return;
    }
    if (startTime && endTime && endTime < startTime) {
      showFormError("終了時刻は開始時刻より後の時刻にしてください。");
      return;
    }

    const existing = idInput.value
      ? events.find((item) => String(item.id) === String(idInput.value))
      : null;

    const eventData = {
      id: existing ? existing.id : (window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `event-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      name,
      date,
      startTime,
      endTime,
      belongings: belongingsInput.value.trim(),
      recurrence: repeatInput.value,
      skippedDates: existing && repeatInput.value === "weekly" && getRecurrence(existing) === "weekly"
        ? (Array.isArray(existing.skippedDates) ? existing.skippedDates : [])
        : []
    };

    try {
      if (typeof window.saveEvent !== "function") {
        throw new Error("saveEvent 関数が見つかりません");
      }
      await window.saveEvent(eventData);
      selectedDate = date;
      shownMonth = new Date(dateFromKey(date).getFullYear(), dateFromKey(date).getMonth(), 1);
      closeForm();
      await loadEvents();
    } catch (error) {
      console.error(error);
      showFormError("予定を保存できませんでした。js/database.js に saveEvent 関数があるか確認してください。");
    }
  });

  function showFormError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  async function loadEvents() {
    try {
      if (typeof window.getEvents !== "function") {
        throw new Error("getEvents 関数が見つかりません");
      }
      events = await window.getEvents();
      if (!Array.isArray(events)) events = [];
      renderAll();
    } catch (error) {
      console.error(error);
      eventList.replaceChildren(makeElement("p", "empty-message", "予定を読み込めませんでした。js/database.js の getEvents 関数と events ストアを確認してください。"));
    }
  }

  $("#prev-month").addEventListener("click", () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
    renderAll();
  });
  $("#next-month").addEventListener("click", () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
    renderAll();
  });
  $("#new-event-button").addEventListener("click", openNewForm);
  $("#cancel-form-button").addEventListener("click", closeForm);
  $("#cancel-form-button-bottom").addEventListener("click", closeForm);

  loadEvents();
})();

