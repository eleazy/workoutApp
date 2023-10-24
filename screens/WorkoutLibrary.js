import { View, Text, TouchableOpacity, BackHandler, Alert, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { colors, styles, plainSearchText, formatTime } from '../utils/utils.js';
import CreateEditWorkout from '../components/CreateEditWorkout';
import { workoutsObjFirebase, getThemeValue } from '../data/dataHandling.js';
import { store, selectWorkout } from "../redux/store";

const WorkoutLibrary = ({ navigation }) => {
    const color = colors[getThemeValue()];

    const [isLoading, setIsLoading] = useState(true);
    const [originalWorkoutInfo, setOriginalWorkoutInfo] = useState([]);
    const [workoutInfo, setWorkoutInfo] = useState([]);
    const [workoutId, setWorkoutId] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showCreateEdit, setShowCreateEdit] = useState(false);
    const [expand, setExpand] = useState([]);
    const [editProps, setEditProps] = useState(['', [[], [], [], []]]);

    useEffect(() => {
        setIsLoading(true);
        workoutsObjFirebase()
            .then((data) => {
                setOriginalWorkoutInfo(data[0]);
                setWorkoutId(data[1]);
                setIsLoading(false)
            })
    }, [showCreateEdit]);

    useEffect(() => {
        if (originalWorkoutInfo.length > 0) {
            setWorkoutInfo(originalWorkoutInfo.filter((e) => plainSearchText(e.name).includes(plainSearchText(searchText))));
        }
    }, [searchText, originalWorkoutInfo]);

    const backAction = () => {
        if (showCreateEdit) {
            setShowCreateEdit(false);
            return true;
        }
        navigation.navigate('Home');
        return true;
    };
    BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
    );

    return (
        <View className={`flex-1 p-2 items-center`}>
            {!showCreateEdit &&
                <View className={` h-5/6 w-full`}>
                    <View className={` flex flex-row items-end justify-center mb-4`}>
                        {showSearch ? <TextInput
                            style={{ color: "#fafafa", borderColor: "#b3b3b3" }}
                            className={`bg-transparent border rounded-xl px-2 py-1 w-80 text-base `}
                            placeholder="Search for Workout"
                            onChangeText={newText => setSearchText(newText)}
                            autoFocus={true}
                            onEndEditing={() => searchText === '' && setShowSearch(false)}
                        /> :
                            <Text style={styles.textWeakColor} className={`text-xl font-semibold `}>Workout Library</Text>}

                        <View className={`absolute right-0`}>
                            <Ionicons name="search" size={29} color="#e6e6e6" onPress={() => {
                                setShowSearch(true)
                                if (searchText) Keyboard.dismiss()
                            }} />
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {!isLoading ?
                            workoutInfo.map((workout, i) => {
                                title_size = workout.name.length > 20 ? 'text-xs' : 'text-base';

                                const workoutExercisesDisplay = workoutInfo.map((e) => Object.values(e.exercises).map(b => b.exerciseTitle));
                                const workoutFeaturesDisplay = workoutInfo.map((e) => Object.values(e.exercises).map(b => [b.weighted, b.tuck]));
                                const workoutValuesDisplay = workoutInfo.map((e) => Object.values(e.exercises).map(b => [b.sets, b.repsSet || b.timeSet, b.rest]));
                                const verifyTimeOrSetDisplay = workoutInfo.map((e) => Object.values(e.exercises).map(b => ['Sets', b.timeSet ? 'Time per Set' : 'Reps per Set', 'Rest']));

                                return (
                                    <View key={i} className={`bg-zinc-900 rounded-lg w-full px-2 pb-3 pt-1 mb-3 `}>

                                        <View className={` flex-wrap flex-row items-center justify-between`}>

                                            <Text style={{ color: color.styleTextColorWeak }} className={`${title_size} font-semibold w-56 `}> {workout.name} </Text>

                                            <View className={` flex-row items-center ml-1 space-x-3`}>
                                                <Pressable onPress={() => {
                                                    if (store.getState().selectedWorkout.value !== "-1") {
                                                        Alert.alert('There is already an workout going on', 'End the current workout in order to start another one', [
                                                            { text: 'OK' },
                                                        ], { cancelable: true });
                                                    } else {
                                                        store.dispatch(selectWorkout(workoutId[originalWorkoutInfo.findIndex((e) => e.name === workout.name)]));
                                                        navigation.navigate('Workout');
                                                    }

                                                }}>
                                                    <Text style={{ color: "#b3b3b3", borderColor: "#b3b3b3" }} className={` px-1 mr-2 text-center text-sm font-semibold border rounded-md `}>START</Text>
                                                </Pressable>

                                                {expand.includes(i) &&
                                                    <Feather name="edit" size={22} color="#c4c4c4" onPress={() => {
                                                        setEditProps([workout.name, [workoutExercisesDisplay[i], workoutFeaturesDisplay[i], workoutValuesDisplay[i], verifyTimeOrSetDisplay[i]]])
                                                        setShowCreateEdit(true)
                                                    }} />}
                                                <Ionicons name={expand.includes(i) ? 'chevron-up-sharp' : 'chevron-down-sharp'} size={36} color="#c4c4c4" onPress={() =>
                                                    expand.includes(i) ? setExpand(expand.filter((a) => a !== i)) : setExpand([...expand, i])
                                                } />
                                            </View>
                                        </View>

                                        <View className={`flex ${!expand.includes(i) && 'flex-row'} items-center w-full pl-1 overflow-hidden`}>
                                            {workoutExercisesDisplay[i].map((f, b) =>
                                                <View key={b} className={`${expand.includes(i) && 'w-full '} justify-between`}>
                                                    <View className={` flex-row items-center`}>
                                                        <Text style={styles.textStrongColor} className={` text-sm pr-3`}>{f}</Text>
                                                        {expand.includes(i) &&
                                                            <View className={` flex-row items-center`}>
                                                                <Text style={styles.textWeakColor} className={` text-xs pr-3`}>{workoutFeaturesDisplay[i][b][0] > 0 && `+${workoutFeaturesDisplay[i][b][0]}Kg`}</Text>
                                                                <Text style={styles.textWeakColor} className={` text-xs pr-3`}>{workoutFeaturesDisplay[i][b][1] && 'Tuck'}</Text>
                                                            </View>
                                                        }
                                                    </View>

                                                    <View style={styles.borderColor} className={`flex flex-row space-x-4 ${expand.includes(i) && 'w-full justify-start border-b '} `}>
                                                        {expand.includes(i) &&
                                                            verifyTimeOrSetDisplay[i][b].map((a, n) =>
                                                                <View key={n} className={`flex flex-row items-center pr-3, ${a == 'Sets' ? 'w-20' : a == 'Rest' ? 'w-24 mr-2' : 'w-44'} `}>
                                                                    <Text style={styles.textWeakColor} className={`text-xs pr-3`}>{a}</Text>
                                                                    {a === 'Time per Set' ?
                                                                        <Text style={{ color: color.styleTextColorWeak }} className={`text-base font-semibold`}>{formatTime(workoutValuesDisplay[i][b][n]).join(':')}</Text>
                                                                        : a === 'Rest' ?
                                                                            <Text style={{ color: color.styleTextColorWeak }} className={`text-base font-semibold`}>{formatTime(workoutValuesDisplay[i][b][n]).join(':').slice(3)}</Text>
                                                                            :
                                                                            <Text style={{ color: color.styleTextColorWeak }} className={`text-base font-semibold`}>{workoutValuesDisplay[i][b][n]}</Text>
                                                                    }
                                                                </View>
                                                            )}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            })
                            :
                            <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>No Workouts to Show</Text>
                        }

                    </ScrollView >
                </View>
            }

            {showCreateEdit && <CreateEditWorkout setShowCreateEdit={setShowCreateEdit} title={editProps[0]} exercises={editProps[1]} valueTitle={editProps[1]} />}
            {!showCreateEdit &&
                <TouchableOpacity onPress={() => {
                    setEditProps(['', [[], [], [], []]])
                    setShowCreateEdit(true)
                }
                }>
                    <View className={`w-fit px-10 pb-9 mt-1`}><Text style={styles.textWeakColor} className={` text-xl font-semibold `}>Add New Workout</Text>
                    </View>
                </TouchableOpacity>}
        </View >
    )
}

export default WorkoutLibrary