import { View, Text, Keyboard, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { colors, styles, plainSearchText, formatTime } from '../utils/utils.js'
import { workoutHistoryObjFirebase, getThemeValue, getLoggedUser } from '../data/dataHandling.js';
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig.js';

const WorkoutHistory = () => {
    const user = getLoggedUser();
    const color = colors[getThemeValue()];
    const [isLoading, setIsLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [expand, setExpand] = useState([]);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [workoutHistoryOriginal, setWorkoutHistoryOriginal] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        workoutHistoryObjFirebase()
            .then((data) => {
                setWorkoutHistoryOriginal(data[0].map((e, i) => ({ ...e, firebaseKey: data[1][i], })));
                setWorkoutHistory(data[0].map((e, i) => ({ ...e, firebaseKey: data[1][i], })));
                setIsLoading(false);
            })
    }, [refreshing]);

    useEffect(() => {
        setWorkoutHistory(searchText ?
            [...workoutHistoryOriginal].filter((a) => plainSearchText(a.workoutTitle).includes(plainSearchText(searchText))
                || a.date.includes(searchText))
            : [...workoutHistoryOriginal]);

    }, [searchText]);

    const deleteInDb = async (i) => {
        const userResponse = await new Promise((resolve, reject) => {
            Alert.alert('Delete Workout', `Are you sure you want to delete this workout? ${workoutHistory[i].workoutTitle} from ${workoutHistory[i].date}`, [
                { text: 'OK', onPress: () => resolve('OK') },
                { text: 'Cancel', onPress: () => reject('Cancel') }
            ], { cancelable: true }, { onDismiss: () => reject('Cancel') });
        });

        if (userResponse === 'OK') {
            const idToDelete = workoutHistory[i].firebaseKey;
            deleteDoc(doc(db, "users", user, "WorkoutHistory", idToDelete));
            setWorkoutHistory([...workoutHistory].filter((a) => a.firebaseKey !== idToDelete));
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 200);
    }, []);

    return (
        <View className={` flex-1 items-center w-screen space-y-4 p-2 `}>
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
                        <Text style={styles.textWeakColor} className={`text-xl font-semibold `}>Workout History</Text>}

                    <View className={`absolute right-0`}>
                        <Ionicons name="search" size={29} color="#e6e6e6" onPress={() => {
                            setShowSearch(true)
                            if (searchText) Keyboard.dismiss()
                        }} />
                    </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    {!isLoading ?
                        workoutHistory.length > 0 ?
                            workoutHistory.map((workout, i) => {
                                const title_size = workout.workoutTitle.lenght > 20 ? 'text-xs' : 'text-base';
                                return (
                                    <View key={i} className={`bg-zinc-900 rounded-lg w-full px-2 pb-3 pt-1 mb-3 `} >
                                        <View className={` flex-wrap flex-row items-center justify-between`}>
                                            <View className={`flex-row items-center space-x-1 `}>
                                                <Text style={{ color: color.styleTextColorWeak }} className={`${title_size} font-semibold `}> {workout.workoutTitle} </Text>
                                                <Text style={styles.textWeakColor} className={`text-sm `}> {workout.date} </Text>
                                            </View>
                                            <View className={` flex-row items-center ml-1 space-x-3`}>
                                                {expand.includes(i) &&
                                                    <Ionicons name="trash-bin" size={23} color="#e6e6e6" onPress={() => deleteInDb(i)} />}
                                                <Ionicons name={expand.includes(i) ? 'chevron-up-sharp' : 'chevron-down-sharp'} size={36} color="#c4c4c4" onPress={() =>
                                                    expand.includes(i) ? setExpand(expand.filter((a) => a !== i)) : setExpand([...expand, i])
                                                } />
                                            </View>
                                        </View>

                                        <View className={`flex ${!expand.includes(i) && 'hidden'} items-center w-full pl-1 `}>
                                            {Object.values(workout.exerciseData).map((f, b) =>
                                                <View key={b} className={`${expand.includes(i) && 'w-full '} border-b border-zinc-600`}>
                                                    <View className={` flex-row justify-between px-2 items-center space-y-2`}>
                                                        <Text style={styles.textStrongColor} className={` text-sm pr-3`}>{f.exerciseTitle}</Text>
                                                        {expand.includes(i) &&
                                                            <View className={` flex-row items-center space-x-3 w-1/2`}>
                                                                <Text style={styles.textWeakColor} className={` text-sm `}>{`Sets ${f.sets}`}</Text>
                                                                <Text style={styles.textWeakColor} className={` text-sm `}>{f.reps > -1 ? `Reps ${f.reps}` : `Time ${formatTime(f.time).join(':')}`}</Text>
                                                            </View>
                                                        }
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            })
                            :
                            <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>No workouts found.</Text>
                        :
                        <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>Loading...</Text>
                    }
                </ScrollView >
            </View>
        </View>
    )
}

export default WorkoutHistory