import { View, Text, TouchableOpacity, BackHandler, Keyboard, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import CreateEditExercise from '../components/CreateEditExercise';
import { colors, handleSelection, styles, plainSearchText } from '../utils/utils.js';
import { exercisesObj, exercisesObjFirebase, getThemeValue } from '../data/dataHandling';

const ExerciseLibrary = ({ navigation }) => {
    const color = colors[getThemeValue()];
    const muscleGroups = ['Biceps', 'Triceps', 'Forearms', 'Shoulders', 'Chest', 'Back', 'Core', 'Quads', 'Hamstrings', 'Calves', 'Glutes'];

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showCreateEdit, setShowCreateEdit] = useState(false);
    const [editProps, setEditProps] = useState(['', ['', ''], ['', '']]);
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exercisesOriginal, setExercisesOriginal] = useState([]);
    const [exercisesFinal, setExercisesFinal] = useState([]);

    const filterResults = (list) => list.filter((e) => e.muscles.some((m) =>
        selectedMuscles.length > 0 ?
            selectedMuscles.includes(m) && plainSearchText(e.name).includes(plainSearchText(searchText))
            :
            plainSearchText(e.name).includes(plainSearchText(searchText))
    )).sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        exercisesObjFirebase()
            .then((data) => {
                setExercisesOriginal(data[0]);
                setIsLoading(false);
            });
    }, [showCreateEdit]);

    useEffect(() => {
        setExercisesFinal(filterResults([...exercisesOriginal]).concat(filterResults([...exercisesObj])));
    }, [selectedMuscles, searchText, exercisesOriginal]);

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
        <View className={`flex-1 items-center`}>
            {!showCreateEdit &&
                <View className={`h-5/6 w-screen space-y-4 items-center p-2 `}>
                    <View className={` flex flex-row items-end justify-center w-full `}>
                        {showSearch ? <TextInput
                            style={{ color: "#fafafa", borderColor: "#b3b3b3" }}
                            className={`bg-transparent border rounded-xl px-2 py-1 w-80 text-base `}
                            placeholder="Search for Exercise"
                            onChangeText={newText => setSearchText(newText)}
                            autoFocus={true}
                            onEndEditing={() => searchText === '' && setShowSearch(false)}
                        /> :
                            <Text style={styles.textWeakColor} className={`text-xl font-semibold `}>Exercise Library</Text>}

                        <View className={`absolute right-0`}>
                            <Ionicons name="search" size={29} color="#e6e6e6" onPress={() => {
                                setShowSearch(true)
                                if (searchText) Keyboard.dismiss();
                            }} />
                        </View>
                    </View>

                    <View className={` w-full items-start space-y-2  px-1`}>
                        <Text style={styles.textWeakColor} className={`text-sm `}>Group By</Text>

                        <View className={`flex flex-row flex-wrap w-full`}>
                            {muscleGroups.map((muscleGroup, i) =>
                                <Pressable key={i} onPress={() => handleSelection(muscleGroup, selectedMuscles, setSelectedMuscles)}>
                                    <Text style={{ color: `${selectedMuscles.includes(muscleGroup) ? color.styleTextColorWeak : "#b3b3b3"}` }}
                                        key={i} className={`text-sm mr-4 mb-2 `}>{muscleGroup}</Text></Pressable >
                            )}
                        </View>
                    </View>

                    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} >
                        {!isLoading ?
                            exercisesFinal.length > 0 ?
                                exercisesFinal.map((exercise, i) => {
                                    const exercise_size = exercise.name.length > 25 ? 'text-sm' : 'text-lg';
                                    return (
                                        <View key={i} className={`flex-1 p-2 pr-3 mb-2 bg-zinc-900 border rounded-lg`}>
                                            <View className={` flex-row items-end justify-between`}>
                                                <Text style={{ color: color.styleTextColorWeak }} className={`${exercise_size} font-semibold w-70`}>{exercise.name} </Text>
                                                {exercisesOriginal.includes(exercise) && <Feather name="edit" size={24} color="#b3b3b3" onPress={() => {
                                                    setEditProps([exercise.name, exercise.type, exercise.muscles]);
                                                    setShowCreateEdit(true);
                                                }} />}
                                            </View>
                                            <View className={`flex flex-row items-center justify-start  `}>
                                                {exercise.muscles.map((muscleGroup, h) =>
                                                    <Text key={h} style={styles.textWeakColor} className={` text-xs font-semibold pr-2 `}>{muscleGroup}</Text>
                                                )}
                                            </View>
                                        </View>
                                    )
                                })
                                :
                                <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center pt-16`}>No Exercises Found</Text>
                            :
                            <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center pt-16`}>Loading...</Text>
                        }
                    </ScrollView>
                </View>
            }

            {showCreateEdit && <CreateEditExercise setShowCreateEdit={setShowCreateEdit} title={editProps[0]} types={editProps[1]} muscles={editProps[2]} />}

            {showCreateEdit ? <Ionicons name="return-down-back" size={54} color="#e6e6e6" onPress={() => {
                setShowCreateEdit(false);
            }} /> :
                <TouchableOpacity onPress={() => {
                    setEditProps(['', ['', ''], ['', '']]);
                    setShowCreateEdit(true);
                }}>
                    <View className={`w-fit px-10 pb-9 mt-1`}><Text style={styles.textWeakColor} className={` text-lg font-semibold `}>Add New Exercise</Text>
                    </View>
                </TouchableOpacity>}
        </View>
    )
}



export default ExerciseLibrary