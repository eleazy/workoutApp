import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { colors, styles } from '../utils/utils.js';
import { getThemeValue, } from "../data/dataHandling.js";

const CustomDrawer = (props) => {
    const color = colors[getThemeValue()];
    const currentScreen = props.navigation.getState().routes[0].name;

    return (
        <View className={`pt-6 h-full justify-between `}>
            <View className={`pl-1 `}>
                {['Home', 'Exercise Library', 'Workout Library', 'Record Library', 'Week Planning', 'Workout History', 'Settings'].map((s, i) => {
                    return (
                        <TouchableOpacity key={i} onPress={() => props.navigation.navigate(s)}>
                            <Text style={{ color: currentScreen === s ? color.styleTextColor : "#f5f5f5", borderColor: color.styleTextColorWeak }}
                                className={`text-lg w-11/12 p-3 border-b pt-6 `}>{s}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <Text style={styles.textWeakColor} className={`text-sm text-center mb-20`}>Built by Eleazy Soares</Text>
        </View>
    )
}

export default CustomDrawer