const DB_NAME = "SchoolLifeApp";
const DB_VERSION = 8;

const USER_STORE = "user";
const SUBJECT_STORE = "subjects";
const TIMETABLE_STORE = "timetable";
const BELONGINGS_STORE = "belongings";
const DAILY_BELONGINGS_STORE = "dailyBelongings";
const WEEKLY_TIMETABLE_STORE = "weeklyTimetable";
const DAILY_CHECK_STORE = "dailyBelongingChecks";
const EVENTS_STORE = "events";
const TODO_STORE = "todos";

// ==============================
// データベースを開く
// ==============================

function openDatabase() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {

      const db = event.target.result;


      // ユーザー
      if (!db.objectStoreNames.contains(USER_STORE)) {

        db.createObjectStore(USER_STORE, {
          keyPath: "id"
        });

      }


      // 教科・科目
      if (!db.objectStoreNames.contains(SUBJECT_STORE)) {

        db.createObjectStore(SUBJECT_STORE, {
          keyPath: "id"
        });

      }


      // 時間割
      if (!db.objectStoreNames.contains(TIMETABLE_STORE)) {

        db.createObjectStore(TIMETABLE_STORE, {
          keyPath: "id"
        });

      }
      // 日付ごとの持ち物チェック状態
      if (!db.objectStoreNames.contains(DAILY_CHECK_STORE)) {
  　　　db.createObjectStore(DAILY_CHECK_STORE, {
    　　　keyPath: "date"
  　　　});
　　　}

      // 教科ごとの持ち物
      if (!db.objectStoreNames.contains(BELONGINGS_STORE)) {

        db.createObjectStore(BELONGINGS_STORE, {
          keyPath: "subjectId"
        });

      }


      // 毎日持っていくもの
      if (!db.objectStoreNames.contains(DAILY_BELONGINGS_STORE)) {

        db.createObjectStore(DAILY_BELONGINGS_STORE, {
          keyPath: "id"
        });

      }

      // 高校の週別時間割
if (!db.objectStoreNames.contains(WEEKLY_TIMETABLE_STORE)) {
  db.createObjectStore(WEEKLY_TIMETABLE_STORE, {
    keyPath: "id"
  });
}

      // 予定
if (!db.objectStoreNames.contains(EVENTS_STORE)) {
  db.createObjectStore(EVENTS_STORE, {
    keyPath: "id"
  });
}

      // やることリスト
if (!db.objectStoreNames.contains(TODO_STORE)) {
  db.createObjectStore(TODO_STORE, {
    keyPath: "id"
  });
}

    };


    request.onsuccess = () => {

      resolve(request.result);

    };


    request.onerror = () => {

      reject(request.error);

    };

  });

}


// ==============================
// ユーザー情報
// ==============================

async function saveUser(user) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(USER_STORE, "readwrite");

    const store =
      transaction.objectStore(USER_STORE);

    store.put(user);

    transaction.oncomplete = () => {

      db.close();

      resolve();

    };

    transaction.onerror = () => {

      db.close();

      reject(transaction.error);

    };

  });

}


async function getUser() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(USER_STORE, "readonly");

    const store =
      transaction.objectStore(USER_STORE);

    const request =
      store.get("current");

    request.onsuccess = () => {

      db.close();

      resolve(request.result);

    };

    request.onerror = () => {

      db.close();

      reject(request.error);

    };

  });

}


// ==============================
// 教科・科目
// ==============================

async function saveSubjects(subjects) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(SUBJECT_STORE, "readwrite");

    const store =
      transaction.objectStore(SUBJECT_STORE);

    const clearRequest =
      store.clear();

    clearRequest.onsuccess = () => {

      subjects.forEach(subject => {

        store.put(subject);

      });

    };

    transaction.oncomplete = () => {

      db.close();

      resolve();

    };

    transaction.onerror = () => {

      db.close();

      reject(transaction.error);

    };

  });

}


async function getSubjects() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(SUBJECT_STORE, "readonly");

    const store =
      transaction.objectStore(SUBJECT_STORE);

    const request =
      store.getAll();

    request.onsuccess = () => {

      db.close();

      resolve(request.result);

    };

    request.onerror = () => {

      db.close();

      reject(request.error);

    };

  });

}


// ========================================
// 教科を1件ずつ保存
// ========================================

async function saveSubject(subject) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      SUBJECT_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(SUBJECT_STORE);

    store.put(subject);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
}


// ========================================
// 教科が使用中か確認して削除
// ========================================

async function deleteSubjectIfUnused(subjectId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [
        SUBJECT_STORE,
        TIMETABLE_STORE,
        WEEKLY_TIMETABLE_STORE,
        BELONGINGS_STORE
      ],
      "readwrite"
    );

    const subjectStore =
      transaction.objectStore(SUBJECT_STORE);

    const timetableStore =
      transaction.objectStore(TIMETABLE_STORE);

    const weeklyStore =
      transaction.objectStore(WEEKLY_TIMETABLE_STORE);

    const belongingsStore =
      transaction.objectStore(BELONGINGS_STORE);

    let failed = false;

    const fail = (message) => {
      if (failed) return;

      failed = true;
      transaction.abort();
      reject(new Error(message));
    };

    const timetableRequest = timetableStore.getAll();
    const weeklyRequest = weeklyStore.getAll();
    const belongingsRequest = belongingsStore.getAll();

    let timetableLoaded = false;
    let weeklyLoaded = false;
    let belongingsLoaded = false;

    const checkAndDelete = () => {
      if (
        failed ||
        !timetableLoaded ||
        !weeklyLoaded ||
        !belongingsLoaded
      ) {
        return;
      }

      const targetId = String(subjectId);

      const isUsed = item =>
        String(item.subjectId) === targetId;

      const inTimetable =
        timetableRequest.result.some(isUsed);

      const inWeeklyTimetable =
        weeklyRequest.result.some(isUsed);

      const inBelongings =
        belongingsRequest.result.some(item =>
          String(item.subjectId) === targetId
        );

      if (inTimetable || inWeeklyTimetable || inBelongings) {
        fail(
          "この教科は時間割または持ち物設定で使用中のため削除できません。先に関連する設定を変更してください。"
        );
        return;
      }

      subjectStore.delete(subjectId);
    };

    timetableRequest.onsuccess = () => {
      timetableLoaded = true;
      checkAndDelete();
    };

    weeklyRequest.onsuccess = () => {
      weeklyLoaded = true;
      checkAndDelete();
    };

    belongingsRequest.onsuccess = () => {
      belongingsLoaded = true;
      checkAndDelete();
    };

    timetableRequest.onerror = () => {
      fail("時間割の確認に失敗しました。");
    };

    weeklyRequest.onerror = () => {
      fail("週別時間割の確認に失敗しました。");
    };

    belongingsRequest.onerror = () => {
      fail("持ち物設定の確認に失敗しました。");
    };

    transaction.oncomplete = () => {
      db.close();

      if (!failed) {
        resolve();
      }
    };

    transaction.onerror = () => {
      db.close();

      if (!failed) {
        reject(transaction.error);
      }
    };

    transaction.onabort = () => {
      db.close();
    };
  });
}



// ==============================
// 時間割
// ==============================

async function saveTimetable(timetable) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(TIMETABLE_STORE, "readwrite");

    const store =
      transaction.objectStore(TIMETABLE_STORE);

    const clearRequest =
      store.clear();

    clearRequest.onsuccess = () => {

      timetable.forEach(item => {

        store.put(item);

      });

    };

    transaction.oncomplete = () => {

      db.close();

      resolve();

    };

    transaction.onerror = () => {

      db.close();

      reject(transaction.error);

    };

  });

}


async function getTimetable() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(TIMETABLE_STORE, "readonly");

    const store =
      transaction.objectStore(TIMETABLE_STORE);

    const request =
      store.getAll();

    request.onsuccess = () => {

      db.close();

      resolve(request.result);

    };

    request.onerror = () => {

      db.close();

      reject(request.error);

    };

  });

}


// ==============================
// 教科ごとの持ち物
// ==============================

async function saveBelongings(belongings) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(BELONGINGS_STORE, "readwrite");

    const store =
      transaction.objectStore(BELONGINGS_STORE);

    const clearRequest =
      store.clear();

    clearRequest.onsuccess = () => {

      belongings.forEach(item => {

        store.put(item);

      });

    };

    transaction.oncomplete = () => {

      db.close();

      resolve();

    };

    transaction.onerror = () => {

      db.close();

      reject(transaction.error);

    };

  });

}


async function getBelongings() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(BELONGINGS_STORE, "readonly");

    const store =
      transaction.objectStore(BELONGINGS_STORE);

    const request =
      store.getAll();

    request.onsuccess = () => {

      db.close();

      resolve(request.result);

    };

    request.onerror = () => {

      db.close();

      reject(request.error);

    };

  });

}


// ==============================
// 毎日持っていくもの
// ==============================

async function saveDailyBelongings(items) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(DAILY_BELONGINGS_STORE, "readwrite");

    const store =
      transaction.objectStore(DAILY_BELONGINGS_STORE);

    const clearRequest =
      store.clear();

    clearRequest.onsuccess = () => {

      items.forEach(item => {

        store.put(item);

      });

    };

    transaction.oncomplete = () => {

      db.close();

      resolve();

    };

    transaction.onerror = () => {

      db.close();

      reject(transaction.error);

    };

  });

}


async function getDailyBelongings() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        DAILY_BELONGINGS_STORE,
        "readonly"
      );

    const store =
      transaction.objectStore(
        DAILY_BELONGINGS_STORE
      );

    const request =
      store.getAll();

    request.onsuccess = () => {

      db.close();

      resolve(request.result);

    };

    request.onerror = () => {

      db.close();

      reject(request.error);

    };

  });

}


/* ==============================
   高校の週別時間割
============================== */

// 指定した週の時間割を保存
async function saveWeeklyTimetable(weekStart, timetable) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      WEEKLY_TIMETABLE_STORE,
      "readwrite"
    );

    const store = transaction.objectStore(
      WEEKLY_TIMETABLE_STORE
    );

    // 同じ週のデータだけを削除する
    const request = store.getAll();

    request.onsuccess = () => {
      request.result
        .filter(item => item.weekStart === weekStart)
        .forEach(item => store.delete(item.id));

      // 新しい時間割を保存する
      timetable.forEach(item => {
        store.put({
          ...item,
          id: `${weekStart}-${item.day}-${item.period}`,
          weekStart
        });
      });
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("保存に失敗しました"));
    };
  });
}


// 指定した週の時間割を読み込む
async function getWeeklyTimetable(weekStart) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      WEEKLY_TIMETABLE_STORE,
      "readonly"
    );

    const store = transaction.objectStore(
      WEEKLY_TIMETABLE_STORE
    );

    const request = store.getAll();

    request.onsuccess = () => {
      const timetable = request.result.filter(
        item => item.weekStart === weekStart
      );

      db.close();
      resolve(timetable);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}


// 週別時間割が登録済みか確認する
async function hasWeeklyTimetable() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      WEEKLY_TIMETABLE_STORE,
      "readonly"
    );

    const store = transaction.objectStore(
      WEEKLY_TIMETABLE_STORE
    );

    const request = store.count();

    request.onsuccess = () => {
      db.close();
      resolve(request.result > 0);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}


// ==============================
// 日付ごとの持ち物チェック状態
// ==============================

// チェック状態を保存する
async function saveDailyBelongingChecks(date, checkedItems) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      DAILY_CHECK_STORE,
      "readwrite"
    );

    transaction.objectStore(DAILY_CHECK_STORE).put({
      date: date,
      checkedItems: checkedItems
    });

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("保存に失敗しました"));
    };
  });
}

// 指定した日のチェック状態を読み込む
async function getDailyBelongingChecks(date) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      DAILY_CHECK_STORE,
      "readonly"
    );

    const request = transaction
      .objectStore(DAILY_CHECK_STORE)
      .get(date);

    request.onsuccess = () => {
      db.close();

      resolve(
        request.result?.checkedItems || {}
      );
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/* ==============================
   予定の保存・取得・削除
============================== */

// 予定を保存する
async function saveEvent(eventData) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      EVENTS_STORE,
      "readwrite"
    );

    transaction.objectStore(EVENTS_STORE).put(eventData);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("予定の保存に失敗しました"));
    };
  });
}

// すべての予定を取得する
async function getEvents() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      EVENTS_STORE,
      "readonly"
    );

    const request = transaction
      .objectStore(EVENTS_STORE)
      .getAll();

    request.onsuccess = () => {
      const events = request.result;
      db.close();
      resolve(events);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// 指定した予定を削除する
async function deleteEvent(eventId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      EVENTS_STORE,
      "readwrite"
    );

    transaction.objectStore(EVENTS_STORE).delete(eventId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

// ==============================
// やることリスト
// ==============================

// やることを1件保存・更新する
async function saveTodo(todo) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TODO_STORE, "readwrite");
    transaction.objectStore(TODO_STORE).put(todo);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("保存に失敗しました"));
    };
  });
}

// すべてのやることを取得する
async function getTodos() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TODO_STORE, "readonly");
    const request = transaction.objectStore(TODO_STORE).getAll();

    request.onsuccess = () => {
      const todos = request.result;
      db.close();
      resolve(todos);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// やることを削除する
async function deleteTodo(todoId) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TODO_STORE, "readwrite");
    transaction.objectStore(TODO_STORE).delete(todoId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
