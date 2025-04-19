// filepath: /Users/teeho/Project/lotus-checkin/src/index.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if the app is already open
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open a new window if the app is not open
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});