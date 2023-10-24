import { View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors, styles, formatTime } from '../utils/utils.js';
import { recordsObjFirebase, workoutsObjFirebase, getThemeValue } from '../data/dataHandling.js';

const RecordCardList = (props) => {
    const color = colors[getThemeValue()];
    const [isLoading, setIsLoading] = useState(true);
    const [todayRecordsObj, setTodayRecordsObj] = useState([]);

    useEffect(() => {
        workoutsObjFirebase()
            .then((data) => {
                const workoutExercises = Object.values(data[0][data[0].findIndex(a => a.name === props.workout)].exercises).map(a => a.exerciseTitle);
                recordsObjFirebase().then((data) => {
                    setTodayRecordsObj(data[0].filter(a => workoutExercises.includes(a.name[0])));
                })
                setIsLoading(false);
            })
    }, []);

    const titles = todayRecordsObj.map(a => a.name);
    const type = todayRecordsObj.map(a => a.type);
    const records = todayRecordsObj.map((record, i) => record.value.map((a, b) => b == 0 ? a.toString() : formatTime(a)));

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

            {!isLoading ?
                titles.map((title, i) => {
                    const title_size = title[0].length > 14 ? 'text-sm' : 'text-lg';
                    const type_size = type[i].length > 10 ? 'text-xs' : 'text-base';
                    const record_size = records[i][0].length > 5 ? 'text-xl' : 'text-2xl';

                    return (
                        <View key={i} style={{ borderColor: color.styleTextColor }} className={`justify-around bg-black p-1 mr-3 w-28 h-36 items-center border-2 rounded-lg `}>
                            <Text style={styles.textWeakColor} className={` ${type_size} font-medium`}>{type[i]}</Text>
                            <View className={`items-center `}>
                                <Text style={{ color: color.styleTextColor }} className={`text-center font-semibold ${title_size} `}>{title[0]}</Text>
                                {title[1] && <Text style={styles.textWeakColor} className={` font-medium text-sm`}>{title[1]}</Text>}
                            </View>
                            <View className={`items-center w-10/12 border-t h-1/4 border-zinc-600`}>
                                {parseInt(records[i][0]) > 0 && <Text style={{ color: "#fafafa" }} className={`font-semibold ${record_size}`}>{records[i][0]}</Text>}
                                <View className={`flex-row `}>
                                    {records[i][1].some(a => parseInt(a) > 0) &&
                                        records[i][1].map((a, i) => <Text key={i} style={{ color: "#fafafa" }} className={`font-semibold text-lg`}>{a}{i < 2 && ':'}</Text>)}
                                </View>
                            </View>
                        </View>
                    )
                }
                )
                :
                <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>Loading...</Text>
            }

        </ScrollView>
    )
}

export default RecordCardList