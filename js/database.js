// ========================================
// データベースの基本設定
// ========================================

// データベースの名前
const DB_NAME = "SchoolLifeApp";

// データベースのバージョン
const DB_VERSION = 1;

// データを保存する場所の名前
const USER_STORE = "user";


// ========================================
// データベースを開く
// ========================================

function openDatabase() {

  return new Promise((resolve, reject) => {

    // データベースを開く
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );


    // 初めてデータベースを作るとき
    request.onupgradeneeded = (event) => {

      const db = event.target.result;

      // userという保存場所を作る
      if (!db.objectStoreNames.contains(USER_STORE)) {

        db.createObjectStore(
          USER_STORE,
          { keyPath: "id" }
        );

      }

    };


    // データベースを開けた
    request.onsuccess = () => {

      resolve(request.result);

    };


    // エラー
    request.onerror = () => {

      reject(request.error);

    };

  });

}


// ========================================
// ユーザー情報を保存する
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
// ユーザー情報を取得する
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
