import { View, Text, ScrollView } from 'react-native';
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { colors, styles } from '../utils/utils.js';
import { weekObjFirebase, getThemeValue } from '../data/dataHandling.js';

const WeekCardList = () => {
    const color = colors[getThemeValue()];
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const today = new Date().getDay() - 1;
    const [isLoading, setIsLoading] = useState(true);
    const [weekObj, setWeekObj] = useState([]);
    const [weekObjId, setWeekObjId] = useState([]);

    useEffect(() => {
        weekObjFirebase().then((data) => {
            setWeekObj(data[0]);
            setWeekObjId(data[1]);
            setIsLoading(false);
        })
    }, [])

    const scrollRef = useRef(null);
    useLayoutEffect(() => {
        const a = today < 3 ? 0 : today < 5 ? 208 : 360;
        scrollRef.current.scrollTo({ x: a, animated: true });
    }, [])

    return (
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
            {!isLoading ?
                weekdays.map((day, i) => {
                    const workout = weekObj[weekObjId.findIndex(d => d.slice(0, 3).toUpperCase() === day)][0] || 'Rest';

                    const workout_size = workout.length > 12 ? 'text-xs' : 'text-base';
                    const a = today === i ? true : false;

                    return (
                        <View key={i} style={{ borderColor: color.styleTextColor }} className={`border-${a ? '4' : '2'} bg-black w-24 mr-2 rounded-lg`}>

                            <Text style={{ color: `${a ? color.styleTextColorWeak : color.styleTextColor}` }} className={`text-center font-medium text-base w-full `}>{day}</Text>

                            <View style={{ borderColor: color.styleTextColor }} className={`items-center p-1 border-t-2  `}>
                                <Text style={{ color: `${a ? "#f5f5f5" : "#b3b3b3"}` }} className={`${workout_size} text-center font-semibold `}>{workout}</Text>
                            </View>
                        </View>
                    )
                })
                :
                <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center`}>Loading...</Text>
            }
        </ScrollView >
    )
}

export default WeekCardList