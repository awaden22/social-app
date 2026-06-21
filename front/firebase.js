const firebaseConfig = {
  apiKey: "AIzaSyADNPUVi5jrGZDScKfVdIFjMi14d6vbKDk",
  authDomain: "social-media-cfd83.firebaseapp.com",
  projectId: "social-media-cfd83",
  storageBucket: "social-media-cfd83.firebasestorage.app",
  messagingSenderId: "832891275785",
  appId: "1:832891275785:web:4882de086f4d7c0e4306d8",
  measurementId: "G-J9QVST90CL"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

export { messaging };