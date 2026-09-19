const DB_NAME = "SchoolLifeApp";
const DB_VERSION = 4;

const USER_STORE = "user";
const SUBJECT_STORE = "subjects";
const TIMETABLE_STORE = "timetable";
const BELONGINGS_STORE = "belongings";
const DAILY_BELONGINGS_STORE = "dailyBelongings";


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
