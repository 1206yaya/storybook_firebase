// firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import {
  Functions,
  connectFunctionsEmulator,
  getFunctions,
} from "firebase/functions";

export const firebaseConfig = {
  apiKey: "AIzaSyCRhywe00DE96G7L6kHdRSdieu66WwkEm4",
  authDomain: "storybook-firebase-70993.firebaseapp.com",
  projectId: "storybook-firebase-70993",
  storageBucket: "storybook-firebase-70993.appspot.com",
  messagingSenderId: "632650751252",
  appId: "1:632650751252:web:72c0f1e77fc66e1af93601",
  measurementId: "G-Y321FVW0XC",
};

//* Step 1: Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

//* Step 2: Get instance
const db: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);

//* Step 3: Connect to Emulator if the environment variable is set
if (process.env.FIRESTORE_EMULATOR_HOST) {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
export { app, db, functions };
