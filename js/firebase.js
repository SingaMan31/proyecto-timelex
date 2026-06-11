const firebaseConfig = {
  apiKey: "AIzaSyDVetRyTWhjEFB6HhzdOmT3NH36ZFz1ZXs",
  authDomain: "timelex-4c35e.firebaseapp.com",
  projectId: "timelex-4c35e",
  storageBucket: "timelex-4c35e.firebasestorage.app",
  messagingSenderId: "222972686566",
  appId: "1:222972686566:web:da9c197a209cd9c3cd8b27"
};

firebase.initializeApp(firebaseConfig);
const fsDb = firebase.firestore();
const fsStorage = firebase.storage();