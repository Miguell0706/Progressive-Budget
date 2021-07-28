const APP_PREFIX = 'my-system-cache-';
const VERSION = 'v1';
const CACHE_name = APP_PREFIX + VERSION;
const DATA_NAME = "data-cache-" + VERSION;

const FILES_TO_CACHE = [
  "./index.html",
  "./styles.css",
  "./indexedData.js",
  "./index.js",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_name)
      .then(function(data){
          console.log("adding files: " + CACHE_name)
          return data.addAll(FILES_TO_CACHE);
        })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      let keepList = cacheNames.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });

      keepList.push(CACHE_name);

      return Promise.all(
        cacheNames.map((key, i) => {
          if (keepList.indexOf(key) === -1) {
            return caches.delete(cacheNames[i]);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.include('/api/')) {
      event.respondWith(
        caches.open(DATA_NAME).then(data =>{
            return fetch(event.request).then(response =>{
                 if (response.status === 200) {
             data.put(event.request.url, response.clone())
          }
          return response
            }).catch( err => {
                return data.match(event.request)
            }).catch( err => console.log(err) )


        })
      );
      return;
    }

    event.respondWith(
        fetch(event.request).catch(function(){
        return caches.match(event.request).then(function(res){
            if (res){
                return res
            } else if(event.request.headers.get('accept').includes('text/html')){
                return caches.match("/")
            }
        })
    }))

  });
  
