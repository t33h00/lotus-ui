// filepath: /Users/teeho/Project/lotus-checkin/public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyA3Fjr82ZUWWIcYW9uBEfYAaQKucNc6Wis",
    authDomain: "lotuscheckin-343fc.firebaseapp.com",
    projectId: "lotuscheckin-343fc",
    storageBucket: "lotuscheckin-343fc.appspot.com",
    messagingSenderId: "893883420160",
    appId: "1:893883420160:web:cff5320fe78ff8151252e5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.data.name;
    const notificationOptions = {
        body: `${payload.data.service} - ${payload.data.app}`, // Combine service and app
        data: { url: payload.data.url } // Include URL in the notification options
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data.url;
    if (url) {
        event.waitUntil(clients.openWindow(url)); // Open the URL in a new window
    }
});

