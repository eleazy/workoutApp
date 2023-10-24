import { View, Text, TouchableOpacity, Pressable, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import RecordCardList from "../components/RecordCardList.js";
import HeartRate from "../components/HeartRate.js";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { colors, styles, formatTime } from "../utils/utils.js";
import { workoutsObjFirebase, workoutHistoryObjFirebase, getThemeValue, getLoggedUser } from "../data/dataHandling.js";
import { db } from "../firebase/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { store, selectWorkout, triggerEnd } from "../redux/store";

const Workout = ({ route, navigation }) => {

  const user = getLoggedUser();
  const color = colors[getThemeValue()];

  const [isLoading, setIsLoading] = useState(true);
  const [exercisesData, setExercisesData] = useState();
  const [isTime, setIsTime] = useState();
  const [exercises, setExercises] = useState();
  const [repsTimeValue, setRepsTimeValue] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [activeExercise, setActiveExercise] = useState(-1);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [showInput, setShowInput] = useState("");
  const [workoutExercisesOut, setWorkoutExercisesOut] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const activeWorkoutId = store.getState().selectedWorkout.value;
  const allowEnd = store.getState().triggerEndSlice.value;
  const triggerRerender = route.params?.random;

  useEffect(() => {
    workoutsObjFirebase()
      .then((data) => {
        const activeWorkout = data[0][data[1].indexOf(activeWorkoutId)];
        const activeWorkoutExercisesInfo = Object.values(activeWorkout.exercises).map((b) => [b.sets, b.repsSet, b.timeSet, b.rest, b.weighted, b.tuck, b.exerciseTitle]);
        const v = activeWorkoutExercisesInfo.map((e, i) => e[1] ? e[1] : e[2]);
        setRepsTimeValue(v);

        const workoutExercises = [activeWorkoutExercisesInfo.map((c) => c[6])];
        setWorkoutExercisesOut(workoutExercises);

        const a = activeWorkoutExercisesInfo;
        setExercisesData(workoutExercises[0].map((e, i) => [0, 0, a[i][0], v[i]])); // [total, setCount, setQuantity, repsSet || timeSet]
        setIsTime(workoutExercises[0].map((e, i) => (a[i][2] ? true : false)));
        setExercises(workoutExercises[0].map((e, i) => [e, a[i][4] > 0 && `+${a[i][4]}Kg`, a[i][5] && "Tuck",]));
        setWorkoutTitle(activeWorkout.name);
        setActiveExercise(-1);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, [activeWorkoutId, refreshing])

  useEffect(() => {
    allowEnd && endWorkout();
  }, [triggerRerender])

  const handleCount = (sign, index, quant) => () => {
    setActiveExercise(index);
    if (sign === "+") {
      setExercisesData(exercisesData.map((e, i) => i === index ? [e[0], e[1], e[2], e[3] + quant] : e));
    } else {
      if (exercisesData[index][3] - quant <= 0) quant = exercisesData[index][3];
      exercisesData[index][3] > 0 &&
        setExercisesData(exercisesData.map((e, i) => i === index ? [e[0], e[1], e[2], e[3] - quant] : e));
    }
  };

  const addToDb = () => {
    const newWorkoutHistory = {
      workoutId: store.getState().selectedWorkout.value,
      workoutTitle: workoutTitle,
      exerciseData: Object.fromEntries(
        exercisesData.map((e, i) => [
          i + 1,
          {
            //exerciseId: workoutExercisesOut[1][i],
            exerciseTitle: workoutExercisesOut[0][i],
            time: isTime[i] ? e[0] : -1,
            reps: !isTime[i] ? e[0] : -1,
            sets: e[1],
          },
        ])
      ),
      date: new Date().toDateString()
    };
    workoutHistoryObjFirebase().then((data) => {
      let idArray = data[1][0] > -1 ? data[1] : [-1];
      const nextId = Math.max(...idArray.map((a) => Number(a))) + 1;
      setDoc(doc(db, "users", user, "WorkoutHistory", String(nextId)), newWorkoutHistory);

      setRefreshing(!refreshing);
    });
  };

  const endWorkout = async () => {
    try {
      const userResponse = await new Promise((resolve, reject) => {
        Alert.alert("End Workout?", "", [
          { text: "End and Save", onPress: () => resolve("endSave") },
          { text: "End and Discard", onPress: () => resolve("end") },
          { text: "Cancel", onPress: () => reject("Cancel") },
        ],
          { cancelable: true },
          { onDismiss: () => reject("Cancel") }
        );
      });

      if (userResponse === "endSave") {
        addToDb();
      }
      if (userResponse === "end") {
        setRefreshing(!refreshing);
      }

      store.dispatch(triggerEnd());
      store.dispatch(selectWorkout('-1'));
      navigation.navigate("Home");
    } catch (error) {
      store.dispatch(triggerEnd());
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}  >
      <View className={` h-full p-2 items-center space-y-4`}>
        {!isLoading ?
          <View className={` w-full ${showRecords ? 'h-[407px]' : 'h-[550px]'}  `}>
            <ScrollView showsVerticalScrollIndicator={false} >

              {exercises.map((exercise, i) => {
                const exercise_size = exercise[0].length > 20 ? 'text-sm' : 'text-xl';

                return (
                  <View key={i} style={{ borderColor: "#b3b3b3" }} className={`p-2 px-4 w-full ${activeExercise !== i ? 'bg-zinc-900 ' : 'bg-black'} rounded-lg border-b `}>

                    <View className={` flex-row pb-1`}>
                      <View className={`flex-row items-end w-3/4 `}>
                        <Text style={{ color: activeExercise === i ? "#fafafa" : "#b3b3b3" }} className={` ${exercise_size} font-semibold `}>{exercise[0]} </Text>
                        {exercise[1] && <Text style={styles.textWeakColor} className={` text-sm font-semibold pl-3`}>{exercise[1]}</Text>}
                        {exercise[2] && <Text style={styles.textWeakColor} className={` text-sm font-semibold pl-2`}>{exercise[2]}</Text>}
                      </View>
                      <View className={`flex flex-row justify-between w-24 items-center space-x-2`}>
                        <View className={`flex-row items-center`}>
                          <Text style={{ color: "#7d7d7d" }} className={`text-sm font-semibold pr-2`}>SET</Text>
                          <Text style={styles.textWeakColor} className={`text-lg font-medium`}>{exercisesData[i][2] > 0 ? `${exercisesData[i][1]}/${exercisesData[i][2]}` : `${exercisesData[i][1]}`}</Text>
                        </View>
                        <Ionicons name="checkmark-circle-outline" size={26} color="#e6e6e6" onPress={() => {
                          setActiveExercise(i)
                          exercisesData[i][3] > 0 && setExercisesData(exercisesData.map((e, iL) => iL === i ? [e[0] + e[3], e[1] + 1, e[2], e[3] = repsTimeValue[i]] : e))
                        }} />
                      </View>

                    </View>
                    {!isTime[i] ?
                      <View className={`flex flex-row justify-between w-full items-end mt-1`}>
                        <View className={`flex-row items-center `}>
                          <Text style={{ color: "#7d7d7d" }} className={`text-sm font-semibold mr-2`}>TOTAL</Text>
                          <Text style={{ color: color.styleTextColorWeak }} className={` text-xl font-semibold mr-1`}>{exercisesData[i][0]}</Text>
                        </View>
                        <View className={` flex-row space-x-2 mr-1 items-center`}>
                          <TouchableOpacity onPress={handleCount('-', i, 10)}><Text style={styles.textWeakColor} className={` text-xs `}>-10</Text></TouchableOpacity>
                          <Ionicons name="chevron-down-sharp" size={30} color="white" onPress={handleCount('-', i, 1)} />
                          <Text style={{ color: color.styleTextColorWeak }} className={`text-2xl font-semibold`}>{exercisesData[i][3]} </Text>
                          <Ionicons name="chevron-up-sharp" size={30} color="white" onPress={handleCount('+', i, 1)} />
                          <TouchableOpacity onPress={handleCount('+', i, 10)}><Text style={styles.textWeakColor} className={` text-xs `}>+10</Text></TouchableOpacity>
                        </View>
                      </View>
                      :///////////TIME
                      <View className={`flex flex-row justify-between w-full items-end mt-2`}>
                        <View className={`flex-row, items-start `}>
                          <Text style={{ color: "#7d7d7d" }} className={`text-xs font-semibold mr-1`}>TOTAL</Text>
                          <Text style={{ color: color.styleTextColorWeak }} className={` text-base font-semibold mr-1`}>{formatTime(exercisesData[i][0]).join(':')}</Text>
                        </View>
                        <View className={`flex flex-row space-x-1 mr-1 items-center`}>
                          <TouchableOpacity onPress={handleCount('-', i, 60)}><Text style={styles.textWeakColor} className={` text-xs `}>-60</Text></TouchableOpacity>
                          <TouchableOpacity onPress={handleCount('-', i, 30)}><Text style={styles.textWeakColor} className={` text-xs `}>-30</Text></TouchableOpacity>
                          <Ionicons name="chevron-down-sharp" size={30} color="white" onPress={handleCount('-', i, 1)} />

                          {showInput === `${exercise}_showInput` ?
                            <TextInput
                              style={{ color: color.styleTextColorWeak }}
                              className={`bg-transparent px-2 py-1v text-xl font-semibold`}
                              inputMode='numeric'
                              placeholder={'0'}
                              placeholderTextColor={color.styleTextColorWeak}
                              autoFocus={true}
                              onChangeText={(a) => {
                                setExercisesData(exercisesData.map((e, iL) => iL === i ? [e[0], e[1], e[2], parseInt(a)] : e))
                              }}
                              onEndEditing={() => setShowInput(``)}
                            />
                            : <TouchableOpacity onPress={() => setShowInput(`${exercise}_showInput`)}>
                              <Text style={{ color: color.styleTextColorWeak }} className={`text-xl font-semibold`}>{formatTime(exercisesData[i][3]).join(':')} </Text>
                            </TouchableOpacity>
                          }
                          <Ionicons name="chevron-up-sharp" size={30} color="white" onPress={handleCount('+', i, 1)} />
                          <TouchableOpacity onPress={handleCount('+', i, 30)}><Text style={styles.textWeakColor} className={` text-xs `}>+30</Text></TouchableOpacity>
                          <TouchableOpacity onPress={handleCount('+', i, 60)}><Text style={styles.textWeakColor} className={` text-xs `}>+60</Text></TouchableOpacity>
                        </View>
                      </View>
                    }
                  </View>
                )
              })}
            </ScrollView>
          </View>
          :
          <Text style={styles.textWeakColor} className={`text-lg font-semibold `}>Loading Workout</Text>
        }

        <View className={` items-center w-full px-4 py-1 bg-zinc-900 rounded-lg`}>
          <View className={` flex-row items-center mb-2`}>
            <Pressable onPress={() => setShowRecords(!showRecords)} >
              <Text style={styles.textWeakColor} className={` text-base `}>{showRecords ? 'HIDE RECORDS' : 'SHOW RECORDS'}</Text>
            </Pressable>
          </View>

          {showRecords && <RecordCardList workout={workoutTitle} />}
        </View>
        <View className={` w-full bg-zinc-900 rounded-lg`}>
          <HeartRate />
        </View>
      </View>
    </ScrollView>
  )
};

export default Workout;
