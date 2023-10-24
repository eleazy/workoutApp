import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { TextInput, ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { colors, handleSelection, styles } from '../utils/utils.js'
import { exercisesObjFirebase, getThemeValue, getLoggedUser } from '../data/dataHandling.js';
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig.js';

const CreateEditExercise = (props) => {
    const user = getLoggedUser();
    const color = colors[getThemeValue()];
    const types = ['Pull', 'Push', 'Core', 'Hold', 'Cardio', 'Stretching', 'Skill']
    const muscleGroups = ['Biceps', 'Triceps', 'Forearms', 'Shoulders', 'Chest', 'Back', 'Core', 'Quads', 'Glutes', 'Hamstrings', 'Calves',]

    const [exerciseTitle, setExerciseTitle] = useState(props.title || '')
    const [selectedTypes, setSelectedTypes] = useState(props.types || [])
    const [selectedMuscles, setSelectedMuscles] = useState(props.muscles || [])
    const [showDelete, setShowDelete] = useState(false)

    const [idToDelete, setIdToDelete] = useState('')
    useEffect(() => {
        exercisesObjFirebase().then((data) => {
            setIdToDelete(data[1][data[0].findIndex((e) => e.name === props.title)])
            setShowDelete(props.title ? true : false)
        })
    }, [])

    const addToDb = () => {
        exercisesObjFirebase().then((data) => {
            let idArray = data[1][0] > -1 ? data[1] : [-1];
            const exists = data[0].findIndex((e) => e.name === props.title);
            const nextId = exists > -1 ? idArray[exists] : Math.max(...idArray.map(a => Number(a))) + 1;

            const newExercise = {
                name: exerciseTitle,
                type: selectedTypes.filter((e) => e !== ""),
                muscles: selectedMuscles.filter((e) => e !== ""),
            }
            setDoc(doc(db, "users", user, "ExerciseLibrary", String(nextId)), newExercise);
            props.setShowCreateEdit(false);

            setExerciseTitle('');
            setSelectedTypes([]);
            setSelectedMuscles([]);
        });
    };
    const deleteInDb = async () => {

        const userResponse = await new Promise((resolve, reject) => {
            Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
                { text: 'OK', onPress: () => resolve('OK') },
                { text: 'Cancel', onPress: () => reject('Cancel') }
            ], { cancelable: true }, { onDismiss: () => reject('Cancel') });
        });

        if (userResponse === 'OK') {
            await deleteDoc(doc(db, "users", user, "ExerciseLibrary", idToDelete));
            setExerciseTitle('');
            setSelectedTypes([]);
            setSelectedMuscles([]);
            setShowDelete(false);
            props.setShowCreateEdit(false);
        }
    }

    return (
        <View className={`p-1 w-screen items-center mb-4`}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.textWeakColor} className={` text-xl mb-4 mt-3 font-semibold self-center`}>{props.title ? 'Edit Exercise' : 'Add New Exercise'}</Text>

                <View className={`bg-zinc-900 p-2 py-5 rounded-lg w-full`}>

                    <View style={styles.borderColor} className={`flex-row space-x-5 mb-9 pb-5 justify-between border-b`}>
                        <View className={` flex-row justify-start items-center `}>
                            <Text style={styles.textWeakColor} className={` text-lg pr-3`}>Title</Text>
                            <TextInput
                                className={`bg-transparent rounded-xl px-2 py-1 text-xl font-semibold`}
                                style={{ color: color.styleTextColor }}
                                value={exerciseTitle}
                                placeholder="Exercise Name"
                                placeholderTextColor="#a1a1aa"
                                onChangeText={newText => setExerciseTitle(newText)}
                                autoFocus={true}
                            />
                        </View>
                        {showDelete && <Ionicons name="trash-bin" size={30} color="#e6e6e6" onPress={deleteInDb} />}

                    </View>

                    <Text style={styles.textWeakColor} className={` text-lg mb-3`}>Select the types</Text>
                    <View style={styles.borderColor} className={`flex flex-row flex-wrap mb-5 pb-5 justify-start w-full border-b `}>
                        {types.map((type, i) => {
                            return (
                                <TouchableOpacity key={i} onPress={() => handleSelection(type, selectedTypes, setSelectedTypes)}>
                                    <Text style={{ color: `${selectedTypes.includes(type) ? `${color.styleTextColorWeak}` : "#b3b3b3"}` }}
                                        key={i} className={` pr-4 pb-2 text-sm font-semibold`}>{type}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <Text style={styles.textWeakColor} className={` text-lg mb-3`}>Select the muscles groups</Text>
                    <View style={styles.borderColor} className={`flex flex-row flex-wrap mb-5 pb-5 justify-start w-full border-b `}>
                        {muscleGroups.map((muscleGroup, i) => {
                            return (
                                <TouchableOpacity key={i} onPress={() => handleSelection(muscleGroup, selectedMuscles, setSelectedMuscles)} >
                                    <Text style={{ color: `${selectedMuscles.includes(muscleGroup) ? `${color.styleTextColorWeak}` : "#b3b3b3"}` }}
                                        key={i} className={` pr-4 pb-2 text-sm font-semibold`}>{muscleGroup}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <TouchableOpacity onPress={() => {
                        const isValid = selectedMuscles.length > 0 && selectedTypes.length > 0 && exerciseTitle.length > 0;
                        if (!isValid) {
                            Alert.alert('Invalid Exercise', 'Add title, type and muscle group', [
                                { text: 'OK' },
                            ]);
                            return;
                        } else {
                            addToDb();
                        }
                    }}>
                        <Text style={{ color: "#f5f5f5" }} className={` text-xl self-center`}>{props.title ? 'Save Changes' : 'Add Exercise'}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    )
}



export default CreateEditExercise