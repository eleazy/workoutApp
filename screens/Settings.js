import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { colors, styles } from '../utils/utils.js'
import { getThemeValue, getMaxHR, getLoggedUser, setThemeValue } from '../data/dataHandling';
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from '../firebase/firebaseConfig.js';
import { signOut } from "firebase/auth";

const Settings = () => {
    const user = getLoggedUser();
    const colorValue = getThemeValue();
    const color = colors[colorValue];
    const themes = ['Red', 'Purple', 'Pink', 'Brown', 'Green', 'Blue']
    const [inSettingsTheme, setInSettingsTheme] = useState(colorValue);
    const age = getMaxHR();
    const [newAge, setNewAge] = useState(String(220 - age));
    const [showTheme, setShowTheme] = useState(true);

    const changeTheme = (i) => {
        setDoc(doc(db, "users", user, "Settings", '0'), { theme: i });
        //setThemeValue(i);
        Alert.alert(`${themes[i]} Theme applied`, 'Restart the app in order to see the changes.', [
            { text: 'OK' },
        ], { cancelable: true });
    }

    const changeAge = () => {
        setDoc(doc(db, "users", user, "Settings", '1'), { age: newAge });
        Alert.alert(`Age changed`, 'Restart the app for the changes to apply.', [
            { text: 'OK' },
        ], { cancelable: true });
    }

    return (
        <View className={` flex-1 items-center space-y-4 p-4`}>
            <Text style={{ color: "#b3b3b3" }} className={`text-2xl mb-4`}>Settings</Text>

            <View className={`flex ${!showTheme && 'hidden'} items-center w-10/12 space-y-2 pb-5 border-b border-zinc-600`}>
                <Text style={styles.textStrongColor} className={`text-xl mb-2`}>Theme</Text>
                {themes.map((c, i) =>
                    <TouchableOpacity key={i} onPress={() => {
                        setInSettingsTheme(i);
                        changeTheme(i);
                    }}>
                        <Text style={{ color: `${inSettingsTheme == i ? color.styleTextColor : "#b3b3b3"}` }}
                            className={`text-lg `} > {`${c} Theme`} </Text>
                    </TouchableOpacity>
                )}
            </View>
            <View className={`flex items-center space-y-2 w-10/12 border-b pb-5 border-zinc-600`}>
                <Text style={styles.textStrongColor} className={`text-xl `}>Age</Text>
                <Text style={styles.textWeakColor} className={` mb-2`}>For heart hate calculations</Text>
                <TextInput
                    style={styles.textStrongColor}
                    className={`bg-transparentc w-40 h-12 text-center rounded-ms px-2 py-1 text-xl font-semibold`}
                    inputMode='numeric'
                    maxLength={9}
                    onChangeText={a => {
                        setNewAge(String(a));
                    }}
                    autoFocus={false}
                    value={newAge}
                    onFocus={() => setShowTheme(false)}
                    onEndEditing={() => setShowTheme(true)}
                />
                <TouchableOpacity onPress={changeAge}>
                    <Text style={styles.textStrongColor} className={`border-2 text-center border-zinc-500 rounded-xl px-3 py-1 `}>Set Age</Text>
                </TouchableOpacity>
            </View>
            <View className={` items-center space-y-2`}>
                <Text style={styles.textStrongColor} className={`text-xl `}>Session</Text>
                <Text style={styles.textWeakColor} className={` mb-2`}>{`Logged in as ${user}`}</Text>
                <TouchableOpacity onPress={() => {
                    signOut(auth);
                }}>
                    <Text style={styles.textStrongColor} className={`border-2 text-center border-zinc-500 rounded-xl px-3 py-1 `}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Settings