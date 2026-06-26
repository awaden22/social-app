importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyADNPUVi5jrGZDScKfVdIFjMi14d6vbKDk",
  authDomain: "social-media-cfd83.firebaseapp.com",
  projectId: "social-media-cfd83",
  storageBucket: "social-media-cfd83.firebasestorage.app",
  messagingSenderId: "832891275785",
  appId: "1:832891275785:web:4882de086f4d7c0e4306d8",
  measurementId: "G-J9QVST90CL"
});

const messaging = firebase.messaging();

// ✅ Background Notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  self.registration.showNotification(
    payload.data?.title || "New Notification",
    {
      body: payload.data?.body || "You have a message",
      icon: "/firebase-logo.png"
    }
  );
});