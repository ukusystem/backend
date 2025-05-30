import fs from 'fs';
import path from 'path';
import { appConfig } from '../configs';
import { ensureDirExists, toPosixPath } from '../utils/file';

const outputPath = path.join('public', 'firebase-messaging-sw.js');

const swContent = `
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: '${appConfig.fcm.web.api_key}',
  authDomain: '${appConfig.fcm.auth_domain}',
  projectId: '${appConfig.fcm.project_id}',
  storageBucket: '${appConfig.fcm.storage_bucket}',
  messagingSenderId: '${appConfig.fcm.messaging_sende_id}',
  appId: '${appConfig.fcm.web.app_id}',
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
`;

ensureDirExists(path.dirname(outputPath));

fs.writeFileSync(outputPath, swContent);
console.log('Service Worker generado en:', toPosixPath(outputPath));
