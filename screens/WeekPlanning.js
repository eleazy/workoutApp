import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { colors, handleSelection, styles } from '../utils/utils.js';
import { weekObjFirebase, workoutsObjFirebase, getThemeValue, getLoggedUser } from '../data/dataHandling.js';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig.js';

const WeekPlanning = () => {
    const user = getLoggedUser();
    const color = colors[getThemeValue()];
    const [dayWorkouts, setDayWorkouts] = useState({ Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] });

    const [showWorkoutList, setShowWorkoutList] = useState([]);

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [isLoading, setIsLoading] = useState(true);
    const [weekObj, setWeekObj] = useState([]);
    const [weekObjId, setWeekObjId] = useState([]);
    const [workoutList, setWorkouList] = useState();
    const [saveButton, setSaveButton] = useState('');

    useEffect(() => {
        weekObjFirebase().then((data) => {
            setWeekObj(data[0]);
            setWeekObjId(data[1]);
            for (let i = 0; i < data[0].length; i++) {
                setDayWorkouts(prev => ({ ...prev, [data[1][i]]: data[0][i] }));
            }
            setIsLoading(false);
        })

        workoutsObjFirebase().then((data) => {
            setWorkouList(data[0].map((a, i) => ({ name: a.name, id: data[1][i] })));
        })
    }, []);

    const addToDb = () => {
        for (const day in dayWorkouts) {
            const workoutId = workoutList.filter(e => dayWorkouts[day].includes(e.name)).map(e => e.id);

            setDoc(doc(db, "users", user, "WeekPlanning", day), {
                workoutTitle: workoutId.map(id => doc(db, "users", user, "WorkoutLibrary", id))
            });
        }
    }

    return (
        <View className={` w-full h-[90vh] p-2`}>
            <Text style={styles.textWeakColor} className={`text-xl font-semibold self-center py-4`}>Week Planning</Text>
            <ScrollView>
                {!isLoading ?
                    <View className={`space-y-5 w-full rounded-lg bg-zinc-900 p-2`}>
                        {weekDays.map((day, i) => {
                            return (
                                <View key={i} className={` `}>
                                    <View style={styles.borderColor} className={`border-b `}>
                                        <View className={`flex flex-row items-center justify-between`}>
                                            <Text style={styles.textWeakColor} className={`text-base `}>{day} </Text>
                                            <Feather name="edit" size={25} color="#c4c4c4" onPress={() => handleSelection(day, showWorkoutList, setShowWorkoutList)} />
                                        </View>
                                        {weekObj[weekObjId.indexOf(day)]?.map((w, v) =>
                                            <View key={v} className={`flex flex-row items-center pl-6 pb-1`}>
                                                <Text style={{ color: color.styleTextColorWeak }} className={`text-lg font-semibold`}> {w} </Text>
                                            </View>
                                        )}

                                        {showWorkoutList.includes(day) &&
                                            <View style={styles.borderColor} className={`bg-zinc-900 flex flex-row flex-wrap `}>
                                                {workoutList.map((e, c) => {
                                                    const workout = e.name;
                                                    return (
                                                        <TouchableOpacity key={c} onPress={() => {
                                                            setSaveButton('SAVE CHANGES');
                                                            setDayWorkouts(() => {
                                                                let arr = dayWorkouts[day];
                                                                arr.includes(workout) ? arr.splice(arr.indexOf(workout), 1) : arr.push(workout);
                                                                return { ...dayWorkouts, [day]: arr };
                                                            })
                                                        }}>
                                                            <Text style={{ color: dayWorkouts[day].includes(workout) ? color.styleTextColorWeak : "#b3b3b3" }}
                                                                className={`text-sm mr-3 mb-1`}> {workout} </Text>
                                                        </TouchableOpacity>
                                                    )
                                                })}
                                            </View>
                                        }
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                    :
                    <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>Loading...</Text>
                }
            </ScrollView>
            <Pressable onPress={() => {
                if (saveButton === 'SAVE CHANGES') {
                    addToDb();
                    setSaveButton('CHANGES SAVED');
                }
            }
            } >
                {saveButton && <Text style={styles.textStrongColor} className={`pt-3 text-lg self-center font-semibold`}>{saveButton}</Text>}
            </Pressable>
        </View>
    )
}

export default WeekPlanning