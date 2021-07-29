const APP_PREFIX = "my-site-cache-";
const VERSION = "v1";
const CACHE_name = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;
const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./styles.css",
  "./indexedData.js",
  "./index.js",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
];
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_name).then(function (cache) {
      console.log("installing cache : " + CACHE_name);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch((err) => {
              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let keeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      keeplist.push(CACHE_name);
      return Promise.all(
        keyList.map(function (key, i) {
          if (keeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
}); 
