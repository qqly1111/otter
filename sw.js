/* 考公打卡 · 离线缓存 Service Worker
   作用：首次访问后把页面存到本机，之后打开秒开、断网也能用。
   注意：更新打卡表时，把下面的版本号 v1 往上加（v2、v3…），旧缓存会自动清掉。 */
var CACHE = 'daka-v1';
var ASSETS = ['./check.html'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then(function(hit){
      var net = fetch(req).then(function(res){
        try{
          if(res && res.status === 200 && req.url.indexOf(self.location.origin) === 0){
            var copy = res.clone();
            caches.open(CACHE).then(function(c){ c.put(req, copy); });
          }
        }catch(err){}
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
