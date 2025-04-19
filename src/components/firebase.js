// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { BASE_URL } from "../Service/Service";
import axios from "axios";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA3Fjr82ZUWWIcYW9uBEfYAaQKucNc6Wis",
    authDomain: "lotuscheckin-343fc.firebaseapp.com",
    projectId: "lotuscheckin-343fc",
    storageBucket: "lotuscheckin-343fc.appspot.com",
    messagingSenderId: "893883420160",
    appId: "1:893883420160:web:cff5320fe78ff8151252e5"
};
const SAVE_SUB = BASE_URL + "api/subscriber";

// Initialize Firebase
initializeApp(firebaseConfig);

export function registerUserFCM() {
    if (!("Notification" in window)) {
        // Check if the browser supports notifications
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a token for that user and send to server
       console.log("granted")
    } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
            // If the user accepts, create a token and send to server
            if (permission === "granted") {
                console.log("granted after asking");
            }
        });
    }
}

export const requestForToken = async (user) => {
    try {
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, {
            vapidKey: 'BDvsO7dFBGs-FiHvZO58Ur1GZdxuhm9SKX2x26rgrznYgztnVEKlA15Eo01wfjd2Uh2VRwp0CZfcpX0JlBkmWc4'
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);

            // Check if the token is already saved in localStorage
            // const savedToken = localStorage.getItem('fcm_token');
            // if (savedToken === currentToken) {
            //     return;
            // }

            // Prepare the payload
            const sub = {
                user_id: user.id,
                token: currentToken
            };

            // Save the token to the server
            try {
                const response = await axios.post(SAVE_SUB, sub);
                // Save the token in localStorage to avoid duplicate API calls
                localStorage.setItem('fcm_token', currentToken);
            } catch (err) {
                console.log('Error saving token:', err);
            }
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.log('An error occurred while retrieving token:', err);
    }
};