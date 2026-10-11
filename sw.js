const CACHE_NAME = 'baobao-life-v5'; // Tăng phiên bản (v2, v3...) mỗi lần sửa index.html để máy người dùng nhận bản mới
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Cài đặt Service Worker và lưu tài nguyên
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Lưu từng file; thiếu một file (vd: icon) thì bỏ qua chứ không làm hỏng cả service worker
      return Promise.all(ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => null)));
    })
  );
  self.skipWaiting();
});

// Kích hoạt và dọn dẹp cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('baobao-life-') && key !== CACHE_NAME) { // chỉ dọn cache CỦA APP NÀY, không đụng cache của app khác cùng tên miền
            return caches.delete(key); // xóa bản cache cũ của chính app này
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Chạy Offline bằng dữ liệu đã lưu trong Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Xử lý sự kiện khi bấm vào thông báo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./index.html')
  );
});
