import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCw5JCyFWsxCkn2Od6OySpAsdFbGm3oEhw",
    authDomain: "workoutapp-16676.firebaseapp.com",
    projectId: "workoutapp-16676",
    storageBucket: "workoutapp-16676.appspot.com",
    messagingSenderId: "732030897437",
    appId: "1:732030897437:web:63d43ac5fd9be03b89a5f4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});