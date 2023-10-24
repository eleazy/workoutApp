import { collection, addDoc, doc, setDoc, getDocs, getDoc, deleteDoc, DocumentReference } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig.js";
import data from "./initialData.json";

//from local JSON
export const exerciseList = Object.values(data.exerciseLibrary).map((a) => a.name);
export const exercisesObj = Object.values(data.exerciseLibrary);

let loggedUser = null;
export const setLoggedUser = (value) => loggedUser = value;
export const getLoggedUser = () => loggedUser;

let themeValue = null;
export const setThemeValue = (value) => themeValue = value;
export const getThemeValue = () => themeValue;

//
let maxHR = null;
export const setMaxHR = (value) => maxHR = value;
export const getMaxHR = () => maxHR;

//From Firebase
export const exercisesObjFirebase = async () => {
  const arr = [[], []];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "ExerciseLibrary"));
  querySnapshot.forEach((doc) => {
    arr[0].push(doc.data());
    arr[1].push(doc.id);
  });

  return arr;
};

export const workoutsObjFirebase = async () => {
  const arr = [[], []];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "WorkoutLibrary"));
  querySnapshot.forEach((doc) => {
    arr[0].push(doc.data());
    arr[1].push(doc.id);
  });

  return arr;
};

export const recordsObjFirebase = async () => {
  const arr = [[], []];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "RecordsLibrary"));
  querySnapshot.forEach((doc) => {
    arr[0].push(doc.data());
    arr[1].push(doc.id);
  });

  return arr;
};

export const weekObjFirebase = async () => {
  const arr = [[], []];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "WeekPlanning"));

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    let finalData = [];

    for (let i = 0; i < data.workoutTitle.length; i++) {
      const referencedDoc = await getDoc(data.workoutTitle[i]);
      const referencedData = referencedDoc.data();
      finalData.push(referencedData.name);
    }

    arr[0].push(finalData);
    arr[1].push(doc.id);
  }
  return arr;
};

export const workoutHistoryObjFirebase = async () => {
  const arr = [[], []];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "WorkoutHistory"));
  querySnapshot.forEach((doc) => {
    arr[0].push(doc.data());
    arr[1].push(doc.id);
  });

  return arr;
};

export const settingsFirebase = async () => {
  const arr = [];

  const querySnapshot = await getDocs(collection(db, "users", loggedUser, "Settings"));
  querySnapshot.forEach((doc) => {
    arr.push(doc.data());
  });

  return arr;
};

export const usersObjFirebase = async () => {
  const arr = [[], []];
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    arr[0].push(doc.data());
    arr[1].push(doc.id);
  });
  return arr;
};

export const setInitialData = (email, age) => {
  const workoutTitle = ['Pull Workout', 'Push Workout', 'Leg Workout'];
  const exer = [['Pull Up', 'Front Lever', 'Chin Up', 'Australian Pull Up', 'Muscle Up'], ['Dips', 'Diamond Push Up', 'Push Up', 'Full Planche'], ['Squats', 'Wall Sit', 'Pistol Squat', 'Calf Raise']];

  for (let j = 0; j < 3; j++) {
    const newWorkout = {
      name: workoutTitle[j],
      exercises: Object.fromEntries(
        exer[j].map((e, i) => [
          i + 1,
          {
            exerciseTitle: e,
            weighted: false,
            tuck: false,
            sets: 5,
            repsSet: !['Front Lever', 'Full Planche', 'Wall Sit'].includes(e) ? 10 : 0,
            timeSet: ['Front Lever', 'Full Planche', 'Wall Sit'].includes(e) ? 40 : 0,
            rest: 40,
          },
        ])
      ),
    };
    setDoc(doc(db, "users", email, "WorkoutLibrary", String(j)), newWorkout);
  }

  setDoc(doc(db, "users", email, "Settings", "0"), { theme: 0 });
  setDoc(doc(db, "users", email, "Settings", "1"), { age: Number(age) });

  const records = {
    0: { name: ["Pull Up", ""], type: "Max Reps", value: ["1", "0"] },
    1: { name: ["Front Lever", ""], type: "Max Hold", value: ["", "1"] },
    2: { name: ["Chin Up", ""], type: "Max Reps", value: ["1", "0"] },
    3: { name: ["Australian Pull Up", ""], type: "Max Reps", value: ["1", "0"] },
    4: { name: ["Muscle Up", ""], type: "Max Reps", value: ["1", "0"] },
    5: { name: ["Dips", ""], type: "Max Reps", value: ["1", "0"] },
    6: { name: ["Diamond Push Up", ""], type: "Max Reps", value: ["1", "0"] },
    7: { name: ["Push Up", ""], type: "Max Reps", value: ["1", "0"] },
    8: { name: ["Full Planche", ""], type: "Max Hold", value: ["", "1"] },
    9: { name: ["Squats", ""], type: "Max Reps", value: ["1", "0"] },
    10: { name: ["Wall Sit", ""], type: "Max Hold", value: ["", "1"] },
    11: { name: ["Pistol Squat", ""], type: "Max Reps", value: ["1", "0"] },
    12: { name: ["Calf Raise", ""], type: "Max Reps", value: ["1", "0"] },
  };

  for (const record in records) {
    setDoc(doc(db, "users", email, "RecordsLibrary", record), records[record]);
  }

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  for (const day of weekDays) {
    setDoc(doc(db, "users", email, "WeekPlanning", day), { workoutTitle: [] });
  }

};