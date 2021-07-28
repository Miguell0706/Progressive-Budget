const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || windows.shimIndexedDB;

let db;

const request = indexDB.open("budget", 1);

request.onupgradeneeded = ({target})=>{
    let db = target.result;
    db.createObjectStore("pending", {autoIncrement: true});

}

request.onsucess = ({target})=> {
    db =  target.result;

    if(navigator.onLine){
        checkDB();
    }
}
request.onerror = function(e){
    console.log("error" + e.target.errorCode);
}

function saveRecord(record){
    const transaction = db.transaction(["pending"], "readwrite");
    const store= transaction.objectStore("pending")
    store.add(record);
};

function checkDB(){
   const get =  db.transaction(["pending"], "readwrite").objectStore("pending").getAll()

   get.onsuccess = function(){
       if (get.result.length > 0){
        fetch('/api/transaction/bulk', {
            method: "POST", 
            body: JSON.stringify(get.result),
            headers: {
                Accept:"application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        }).then(res => {
            return res.json();
        }).then(()=>{
            db.transaction(["pending"], "readwrite").objectStore('pending').clear()
        })
       }
   }
}

window.addEventListener('online', checkDB)