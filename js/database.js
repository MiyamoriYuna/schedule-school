// ========================================
// データベースの基本設定
// ========================================

const DB_NAME = "SchoolLifeApp";

const DB_VERSION = 2;

const USER_STORE = "user";

const SUBJECT_STORE = "subjects";


// ========================================
// データベースを開く
// ========================================

function openDatabase() {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );


    // データベースの新しいバージョンを
    // 作成するときに実行される

    request.onupgradeneeded = (event) => {

      const db = event.target.result;


      // ------------------------------
      // user
      // ------------------------------

      if (
        !db.objectStoreNames.contains(
          USER_STORE
        )
      ) {

        db.createObjectStore(
          USER_STORE,
          { keyPath: "id" }
        );

      }


      // ------------------------------
      // subjects
      // ------------------------------

      if (
        !db.objectStoreNames.contains(
          SUBJECT_STORE
        )
      ) {

        db.createObjectStore(
          SUBJECT_STORE,
          { keyPath: "id" }
        );

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


// ========================================
// ユーザー情報を保存
// ========================================

async function saveUser(user) {

  const db = await openDatabase();


  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        USER_STORE,
        "readwrite"
      );


    const store =
      transaction.objectStore(
        USER_STORE
      );


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


// ========================================
// ユーザー情報を取得
// ========================================

async function getUser() {

  const db = await openDatabase();


  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        USER_STORE,
        "readonly"
      );


    const store =
      transaction.objectStore(
        USER_STORE
      );


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


// ========================================
// 科目をまとめて保存
// ========================================

async function saveSubjects(subjects) {

  const db = await openDatabase();


  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        SUBJECT_STORE,
        "readwrite"
      );


    const store =
      transaction.objectStore(
        SUBJECT_STORE
      );


    // 現在の科目を一度削除

    const clearRequest =
      store.clear();


    clearRequest.onsuccess = () => {

      // 新しい科目を保存

      subjects.forEach((subject) => {

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


// ========================================
// 保存されている科目を取得
// ========================================

async function getSubjects() {

  const db = await openDatabase();


  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        SUBJECT_STORE,
        "readonly"
      );


    const store =
      transaction.objectStore(
        SUBJECT_STORE
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
