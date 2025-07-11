
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: 'AIzaSyBEnN-GShNy0NEmUTaLDyjY3mfv8W2GsmE',
  authDomain: 'janox-d8c84.firebaseapp.com',
  projectId: 'janox-d8c84',
  storageBucket: 'janox-d8c84.firebasestorage.app',
  messagingSenderId: '240034663535',
  appId: '1:240034663535:web:7e0d98fb69f280af45d19a',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.data.titulo || "Notificación Janox";
  const notificationOptions = {
    body: payload.data.mensaje || "Mensaje en segundo plano",
    icon: "/janox.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
