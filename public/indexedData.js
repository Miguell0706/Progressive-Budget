const indexDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
let db;
const request = indexDB.open("budget", 1);
request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
    checkDB();
  }
};
request.onerror = function (event) {
  console.log("Error " + event.target.errorCode);
};
function saveRecord(record) {
  const store = db.transaction(["pending"], "readwrite").objectStore("pending");
  store.add(record);
}
function checkDB() {
  const get = db
    .transaction(["pending"], "readwrite")
    .objectStore("pending")
    .getAll();
  get.onsuccess = function () {
    if (get.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(get.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          return res.json();
        })
        .then(() => {
          db.transaction(["pending"], "readwrite")
            .objectStore("pending")
            .clear();
        });
    }
  };
}
window.addEventListener("online", checkDB);
