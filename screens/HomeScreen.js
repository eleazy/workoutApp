import { View, Text, TouchableOpacity, Alert, RefreshControl, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import RecordCardList from "../components/RecordCardList.js";
import WeekCardList from "../components/WeekCardList.js";
import HeartRate from "../components/HeartRate.js";
import { colors, styles } from '../utils/utils.js';
import { getThemeValue, weekObjFirebase, workoutsObjFirebase, workoutHistoryObjFirebase } from "../data/dataHandling.js";
import { store, selectWorkout } from "../redux/store";

const HomeScreen = ({ navigation }) => {

    const color = colors[getThemeValue()];
    const [refreshing, setRefreshing] = useState(false);
    const [cardsKey, setCardsKey] = useState(0);

    const today = new Date().getDay();
    const weekday = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
    const [isLoading, setIsLoading] = useState(true);
    const [todayWorkout, setTodayWorkout] = useState([]);
    const [workoutInfo, setWorkoutInfo] = useState([]);
    const [workoutId, setWorkoutId] = useState([]);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [todayWorkoutArr, setTodayWorkoutArr] = useState([]);

    useEffect(() => {
        workoutHistoryObjFirebase()
            .then((data) => {
                setWorkoutHistory(data[0].filter((a) => a.date === new Date().toDateString()).map((a) => a.workoutTitle))
            });

        workoutsObjFirebase()
            .then((data) => {
                setWorkoutInfo(data[0])
                setWorkoutId(data[1])
            });

        weekObjFirebase().then((data) => {
            setTodayWorkoutArr(data[0][data[1].indexOf(weekday[today])])///.workoutTitle
        });
    }, [refreshing]);

    useEffect(() => {
        setTodayWorkout(todayWorkoutArr.filter(w => !workoutHistory.includes(w))[0] || 'Rest');
        setIsLoading(false);
    }, [todayWorkoutArr]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            setCardsKey(cardsKey + 1);
        }, 200);
    }, []);

    return (
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {!isLoading ?
                <View className={`flex-1 p-2 items-center space-y-7 `}>
                    <View className={`flex flex-row w-full mt-5 justify-between p-4 bg-zinc-900 rounded-lg`}>
                        <View className={` justify-between `}>
                            <Text style={{ color: "#f7f7f7" }} className={` text-2xl `}>Today's Workout</Text>
                            <Text style={{ color: color.styleTextColor }} className={` font-semibold text-3xl`}>{todayWorkout}</Text>
                        </View>

                        <TouchableOpacity onPress={() => {
                            if (todayWorkout === 'Rest') return;
                            if (store.getState().selectedWorkout.value !== "-1") {
                                Alert.alert('There is already an workout going on', 'End the current workout in order to start another one', [
                                    { text: 'OK' },
                                ], { cancelable: true });
                            } else {
                                store.dispatch(selectWorkout(workoutId[workoutInfo.findIndex((e) => e.name === todayWorkout)]));
                                navigation.navigate('Workout');
                            }
                        }} >
                            <View style={{ borderColor: color.styleTextColor }} className={`px-2 items-center border-4 rounded-lg`} >
                                <Text style={{ color: color.styleTextColor }} className={` font-semibold text-2xl`}>LET'S</Text>
                                <Text style={{ color: color.styleTextColor }} className={` font-semibold text-4xl`}>GO</Text>
                            </View>
                        </TouchableOpacity >
                    </View>

                    <View key={cardsKey} className={` items-center w-full p-4 bg-zinc-900 rounded-lg`}>
                        <Text style={{ color: "#ededed" }} className={`text-xl mb-2`}>Records to beat</Text>
                        {todayWorkout !== "Rest" && <RecordCardList workout={todayWorkout} />}
                    </View>

                    <View key={cardsKey + 1} className={`w-full p-4 bg-zinc-900 rounded-lg`}>
                        <WeekCardList />
                    </View>

                    <View className={` w-full bg-zinc-900 rounded-lg`}>
                        <HeartRate />
                    </View>
                </View>
                :
                <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>Loading...</Text>
            }

        </ScrollView>
    );
};

export default HomeScreen;
