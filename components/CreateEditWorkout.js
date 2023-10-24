import { View, Text, TouchableOpacity, Keyboard, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { TextInput, ScrollView, FlatList } from 'react-native-gesture-handler';
import { colors, formatTime, handleSelection, styles, plainSearchText } from '../utils/utils.js'
import { exerciseList, workoutsObjFirebase, exercisesObjFirebase, weekObjFirebase, getThemeValue, getLoggedUser } from '../data/dataHandling.js'
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig.js';

const CreateEditWorkout = (props) => {
    const user = getLoggedUser();
    const color = colors[getThemeValue()];
    const [exercises, setExercises] = useState(props.exercises[0].map((e, i) => [e, props.exercises[1][i][0] > 0 && `+${props.exercises[1][i][0]}Kg`, props.exercises[1][i][1] && 'Tuck']))
    const [workoutTitle, setWorkoutTitle] = useState(props.title || 'Workout Title')
    const [exerciseValue, setexerciseValue] = useState(props.exercises[2].map((v, i) => [v[0], v[1], v[2]]))
    const [valueType, setValueType] = useState(props.exercises[3])

    const [selectedFeatures, setSelectedFeatures] = useState([])
    const [searchText, setSearchText] = useState('')
    const [titleInput, setTitleInput] = useState(false)
    const [searchInput, setSearchInput] = useState(false)
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [weigheted, setWeigheted] = useState(['', '0'])

    const [isLoading, setIsLoading] = useState(true)
    const [showDelete, setShowDelete] = useState(false)

    const filterResults = (list) =>
        list.filter((e) => plainSearchText(e).includes(plainSearchText(searchText)))

    const [exerciseListDisplay, setExerciseListDisplay] = useState(exerciseList)

    const [exercisesFirebase, setExercisesFirebase] = useState([])
    const [idToDelete, setIdToDelete] = useState('')
    useEffect(() => {
        exercisesObjFirebase()
            .then((data) => {
                setExercisesFirebase(data[0].map((e) => e.name))

                setExerciseListDisplay(exercisesFirebase.concat(exerciseList))
                setIsLoading(false)
            })
            .finally(() => setIsLoading(false))

        workoutsObjFirebase().then((data) => {
            setIdToDelete(data[1][data[0].findIndex((e) => e.name === props.title)])
            setShowDelete(props.title ? true : false)
        })
    }, [])

    useEffect(() => {
        setExerciseListDisplay(filterResults(exercisesFirebase.concat(exerciseList)))
    }, [searchText])

    const addToDb = () => {
        workoutsObjFirebase().then((data) => {
            let idArray = data[1][0] > -1 ? data[1] : [-1];
            const exists = data[0].findIndex((e) => e.name === props.title);
            const nextId = exists > -1 ? idArray[exists] : Math.max(...idArray.map(a => Number(a))) + 1;

            if ((nextId < 0) || ((!workoutTitle) && (!props.title)) || ((exercises.length == 0) && props.exercises[0].length == 0)) {
                Alert.alert('Invalid Workout', 'Add title and at least one exercise for workout', [
                    { text: 'OK' },
                ], { cancelable: true });
                return;
            }
            const newWorkout = {
                name: workoutTitle,
                exercises: Object.fromEntries(
                    exercises.map((e, i) => [
                        i + 1,
                        {
                            //exerciseId: exerciseList.concat(exercisesFirebase).indexOf(e[0]),
                            exerciseTitle: e[0],
                            weighted: e[1] && parseInt(e[1].slice(1)),
                            tuck: e[2],
                            sets: exerciseValue[i][0],
                            repsSet:
                                valueType[i][1] === 'Reps per Set' ? exerciseValue[i][1] : 0,
                            timeSet:
                                valueType[i][1] === 'Time per Set' ? exerciseValue[i][1] || 1 : 0,
                            rest: exerciseValue[i][2],
                        },
                    ])
                ),
            };
            setDoc(doc(db, "users", user, "WorkoutLibrary", String(nextId)), newWorkout);

            setWorkoutTitle('');
            setExercises([]);
            setexerciseValue([]);
            props.setShowCreateEdit(false);
        })
    }

    const deleteInDb = async () => {
        const userResponse = await new Promise((resolve, reject) => {
            Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
                { text: 'OK', onPress: () => resolve('OK') },
                { text: 'Cancel', onPress: () => reject('Cancel') }
            ], { cancelable: true }, { onDismiss: () => reject('Cancel') });
        });

        if (userResponse === 'OK') {
            await deleteDoc(doc(db, "users", user, "WorkoutLibrary", idToDelete));
            setShowDelete(false);
            setWorkoutTitle('');
            setExercises([]);
            props.setShowCreateEdit(false);
        }
    }

    const scrollExercises = useRef(null)

    return (
        <View className={` items-center w-full `}>
            <Text style={styles.textWeakColor} className={` text-xl font-semibold`}>{props.title ? 'Edit Workout' : 'Create Workout'}</Text>
            <View className={`w-full p-2 rounded-lg bg-zinc-900 `}>
                {!searchInput &&
                    <View className={` `}>
                        {titleInput ?
                            <View className={`flex flex-row items-center justify-between `}>
                                <TextInput
                                    style={{ color: color.styleTextColorWeak }}
                                    className={`bg-transparent w-80 h-9 text-start rounded-md text-lg font-semibold `}
                                    placeholder='Workout Title'
                                    placeholderTextColor="#a1a1aa"
                                    onChangeText={a => setWorkoutTitle(a)}
                                    onEndEditing={() => {
                                        Keyboard.dismiss()
                                        setTitleInput(false)
                                    }}
                                    autoFocus={true}
                                />
                            </View>
                            :
                            <View className={`flex flex-row items-center justify-between `}>
                                <TouchableOpacity onPress={() => setTitleInput(true)}>
                                    <Text style={{ color: color.styleTextColorWeak }} className={`flex-wrap w-80 text-lg font-semibold mb-1`}>{workoutTitle}</Text>
                                </TouchableOpacity>
                                {showDelete && <Ionicons name="trash-bin" size={30} color="#e6e6e6" onPress={deleteInDb} />}
                            </View>
                        }
                        <View className={` h-80`}>
                            <ScrollView showsVerticalScrollIndicator={false} ref={scrollExercises} >
                                {exercises.map((e, i) =>
                                    <View key={i} className={``}>
                                        <View className={`flex-row items-end my-2`}>
                                            <Text style={styles.textStrongColor} className={` text-base `}>{e[0]}</Text>
                                            {e[1] && <Text style={styles.textWeakColor} className={` text-sm pl-2`}>{e[1]}</Text>}
                                            <Text style={styles.textWeakColor} className={` text-sm pl-3`}>{e[2]}</Text>
                                        </View>

                                        <View style={styles.borderColor} className={` flex flex-row border-b items-center justify-start`}>
                                            {valueType[i].map((a, n) =>
                                                <View key={n} className={`flex flex-row items-center pr-1, ${a == 'Sets' ? 'w-20' : a == 'Rest' ? 'w-24 mr-2' : 'w-44'}`}>
                                                    <Text style={styles.textWeakColor} className={`text-xs pr-2`}>{a}</Text>
                                                    <TextInput
                                                        style={{ color: color.styleTextColorWeak }}
                                                        className={`bg-transparent px-2 text-base font-semibold`}
                                                        inputMode='numeric'
                                                        value={exerciseValue[i][n] == 0
                                                            ? '0' : a === 'Rest'
                                                                ? formatTime(exerciseValue[i][n]).join(':').slice(3)
                                                                : a === 'Time per Set'
                                                                    ? formatTime(exerciseValue[i][n]).join(':')
                                                                    : exerciseValue[i][n].toString()}
                                                        placeholder={'0'}
                                                        placeholderTextColor={color.styleTextColorWeak}
                                                        autoFocus={false}
                                                        onChangeText={(a) => {
                                                            setexerciseValue(() => {
                                                                const update = [...exerciseValue]
                                                                update[i][n] = parseInt(a) || 0
                                                                return update
                                                            })
                                                        }}
                                                    />
                                                </View>
                                            )}
                                            <Ionicons name="trash-bin" size={20} color="#e6e6e6" onPress={() => {
                                                setexerciseValue(() => {
                                                    const update = [...exerciseValue]
                                                    update.splice(i, 1)
                                                    return update
                                                })
                                                setValueType(() => {
                                                    const update = [...valueType]
                                                    update.splice(i, 1)
                                                    return update
                                                })
                                                setExercises(() => {
                                                    const update = [...exercises]
                                                    update.splice(i, 1)
                                                    return update
                                                })
                                            }
                                            } />
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                }

                <View style={styles.borderColor} className={` flex-row justify-between items-center border rounded-lg mt-4 mb-2`}>
                    <View className={` w-11/12 `}>
                        <TextInput
                            style={{ color: "#fafafa" }}
                            className={`bg-transparent px-2 text-sm`}
                            placeholder="Search for Exercise"
                            placeholderTextColor={"#b3b3b3"}
                            onChangeText={newText => setSearchText(newText)}
                            autoFocus={false}
                            onFocus={() => {
                                setShowExerciseList(true);
                                setSearchInput(true);
                            }}
                            onEndEditing={() => {
                                Keyboard.dismiss();
                                setSearchInput(false);
                            }}
                        />
                    </View>
                    <Ionicons style={{ paddingRight: 4 }} name="search" size={22} color="#e6e6e6" />
                </View>

                <View className={` ${searchInput ? 'h-72' : 'h-52'} `}>
                    {!isLoading &&
                        <FlatList
                            data={exerciseListDisplay.sort((a, b) => plainSearchText(a).localeCompare(plainSearchText(b)))}
                            renderItem={({ item }) =>
                                <View style={styles.borderColor} className={`${!showExerciseList && 'hidden'} border-b h-16 `}>
                                    <View className={`flex flex-row items-center justify-between w-full my-1`}>
                                        <Text style={{ color: `${selectedFeatures.map(e => e.slice(0, e.indexOf('_'))).includes(item) ? `${color.styleTextColorWeak}` : "#fafafa"}` }} className={`text-sm `}>{item}</Text>
                                        <TouchableOpacity onPress={() => {
                                            setExercises([...exercises, [item, weigheted[0] === item && parseInt(weigheted[1]) > 0 && `+${weigheted[1]}Kg`, selectedFeatures.includes(`${item}_Tuck`) && 'Tuck']])
                                            setexerciseValue([...exerciseValue, [0, 0, 0]])
                                            setValueType([...valueType, ['Sets', selectedFeatures.includes(`${item}_Time`) ? 'Time per Set' : 'Reps per Set', 'Rest']])
                                            scrollExercises.current.scrollToEnd({ animated: true })
                                        }}>
                                            <Text style={styles.textStrongColor} className={`text-xs font-semibold ml-2`}>ADD</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className={`flex flex-row justify-between items-center`}>
                                        <View className={`flex flex-row items-center`}>
                                            <Text style={{ color: `${selectedFeatures.includes(`${item}_Weigheted`) ? `${color.styleTextColorWeak}` : "#b3b3b3"}` }}
                                                className={`text-sm `}>Weigheted</Text>
                                            <TextInput
                                                style={styles.textStrongColor}
                                                className={`bg-transparent px-2 text-sm`}
                                                value={weigheted[0] === item ? weigheted[1] : ''}
                                                inputMode='numeric'
                                                placeholder="0"
                                                placeholderTextColor={"#b3b3b3"}
                                                onChangeText={newText => setWeigheted([item, newText])}
                                                autoFocus={false}
                                                onFocus={() => setSearchInput(true)}
                                                onEndEditing={() => {
                                                    setSearchInput(false)
                                                    Keyboard.dismiss()
                                                    parseInt(weigheted[1]) > 0 && setSelectedFeatures([...selectedFeatures, `${item}_Weigheted`])
                                                }}
                                            />
                                        </View>

                                        <TouchableOpacity onPress={() => handleSelection(`${item}_Tuck`, selectedFeatures, setSelectedFeatures)}>
                                            <Text style={{ color: `${selectedFeatures.includes(`${item}_Tuck`) ? `${color.styleTextColorWeak}` : "#b3b3b3"}` }}
                                                className={`text-sm `} >Tuck</Text>
                                        </TouchableOpacity>

                                        {['Time', 'Reps'].map((r, d) => {
                                            return (
                                                <TouchableOpacity key={d} onPress={() => {
                                                    setSelectedFeatures(() => {
                                                        let update = [...selectedFeatures]
                                                        update = update.filter((a) => !a.includes(`${item}_Time`) && !a.includes(`${item}_Reps`))
                                                        update.push(`${item}_${r}`)
                                                        return update
                                                    })
                                                }}>
                                                    <Text style={{ color: `${selectedFeatures.includes(`${item}_${r}`) ? `${color.styleTextColorWeak}` : "#b3b3b3"}` }}
                                                        className={`text-sm `}>{r}</Text>
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                </View>
                            }
                            keyExtractor={(item, index) => index.toString()}
                            initialNumToRender={6}
                            maxToRenderPerBatch={10}
                        />
                    }
                </View>

            </View>
            {!searchInput &&
                <TouchableOpacity onPress={() => {
                    addToDb();
                }}>
                    <Text style={styles.textWeakColor} className={`py-4 px-8 w-full text-lg font-semibold `}>{props.title ? 'SAVE CHANGES' : 'SAVE WORKOUT'}</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

export default CreateEditWorkout