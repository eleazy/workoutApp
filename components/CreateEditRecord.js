import { View, Text, TouchableOpacity, Keyboard, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons, Feather } from '@expo/vector-icons';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { colors, styles, formatTime, plainSearchText } from '../utils/utils.js'
import { exerciseList, exercisesObjFirebase, recordsObjFirebase, getThemeValue, getLoggedUser, workoutsObjFirebase } from '../data/dataHandling.js';
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/firebaseConfig.js';

const UpdateRecordValue = (props) => {
    const user = getLoggedUser();
    const color = colors[getThemeValue()];
    const [newRecordValue, setNewRecordValue] = useState(props.recordValue)
    const [recordType, setRecordType] = useState(props.recordType)

    const t = formatTime(Number(newRecordValue[1]))
    const [newRecordTime, setNewRecordTime] = useState([t[0], t[1], t[2]])
    const [customExercises, setCustomExercises] = useState([])
    const [searchText, setSearchText] = useState('')
    const [showDelete, setShowDelete] = useState(false)
    const [weighted, setWeighted] = useState('0')
    const [tuck, setTuck] = useState(false)
    const [selectedTitle, setSelectedTitle] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [title, setTitle] = useState(props.title)

    const timeInputToSeconds = (t) => String(Number(t[0]) * 3600 + Number(t[1]) * 60 + Number(t[2]))

    const [idToDelete, setIdToDelete] = useState('')
    useEffect(() => {
        recordsObjFirebase().then((data) => {
            setShowDelete(props.title[0] ? true : false);
            setIdToDelete(data[1][data[0].findIndex((e) => e.name[0] === props.title[0] && e.type === props.recordType)]);
        });

        exercisesObjFirebase().then((data) => {
            setCustomExercises(data[0].map((e) => e.name));
            workoutsObjFirebase().then((data) => {
                setCustomExercises((prev) => [...prev, ...data[0].map((e) => e.name)]);
            });
            setIsLoading(false);
        });

    }, [])

    const addToDb = () => {
        const newRecord = {
            name: title.filter((e) => e !== ''),
            type: recordType,
            value: [newRecordValue[0], timeInputToSeconds(newRecordTime)]
        };
        recordsObjFirebase().then((data) => {
            let idArray = data[1][0] > -1 ? data[1] : [-1];
            const exists = data[0].findIndex((e) => e.name.join('') === newRecord.name.join('') && e.type === newRecord.type);
            const nextId = exists > -1 ? idArray[exists] : Math.max(...idArray.map(a => Number(a))) + 1;

            if (newRecord.name.length === 0 || newRecord.type === '' || (newRecord.value[0] === '' && newRecord.value[1] === '')) {
                Alert.alert('Invalid Record', 'Fill all the required fields', [
                    { text: 'OK' },
                ], { cancelable: true });
                return;
            }
            setDoc(doc(db, "users", user, "RecordsLibrary", String(nextId)), newRecord);
            props.setShowUpdate(false);

            setTitle(['', '']);
            setRecordType('');
            setNewRecordValue(['', '']);
            setNewRecordTime(['', '', '']);
            setSelectedTitle('');
            setWeighted('0');
        })
    }

    const deleteInDb = async () => {
        const userResponse = await new Promise((resolve, reject) => {
            Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
                { text: 'OK', onPress: () => resolve('OK') },
                { text: 'Cancel', onPress: () => reject('Cancel') }
            ], { cancelable: true }, { onDismiss: () => reject('Cancel') });
        });

        if (userResponse === 'OK') {
            await deleteDoc(doc(db, "users", user, "RecordsLibrary", idToDelete));
            setTitle(['', '']);
            setRecordType('');
            setNewRecordValue(['', '']);
            props.setShowCreateEdit(false);
        };
    }

    handleValueChange = (change, amount) => {
        if (change === 'add') {
            const temp = parseInt(newRecordValue) + amount
            setNewRecordValue(temp.toString())
        } else {
            const temp = parseInt(newRecordValue) - amount
            setNewRecordValue(temp.toString())
        }
    }

    handleTimeChange = (i, change, amount) => {
        if (change === 'add') {
            const temp = parseInt(newRecordTime[i]) + amount
            setNewRecordTime(() => {
                const update = [...newRecordTime]
                update[i] = temp.toString()
                return update
            })
        } else {
            const temp = parseInt(newRecordTime[i]) - amount
            setNewRecordTime(() => {
                const update = [...newRecordTime]
                update[i] = temp.toString()
                return update
            })
        }
    }

    return (
        <View className={` items-center w-full `}>
            <Text style={styles.textWeakColor} className={` text-xl font-semibold py-4`}>{props.title[0] ? 'Update Record' : 'Create Record'}</Text>
            <View className={` py-7 h-5/6 rounded-lg bg-zinc-900 w-full`}>
                {title[0]
                    ?
                    <View style={styles.borderColor} className={` flex-row justify-between items-center border-b w-10/12 self-center mb-16`}>
                        <View className={` `}>
                            <View className={`items-center flex-row flex-wrap `}>
                                <Text style={{ color: color.styleTextColorWeak }} className={` text-xl font-semibold pr-3`}>{title[0]}</Text>
                                {title[1] && <Text style={styles.textWeakColor} className={` text-base `}>{title[1]}</Text>}

                            </View>
                            <View className={` flex-row space-x-3 items-center`}>
                                <Text style={styles.textWeakColor} className={` text-lg `}>{recordType}</Text>
                            </View>
                        </View>

                        <View className={` `}>
                            {selectedTitle && <Feather name="edit" size={24} color="#c4c4c4" onPress={() => setTitle([])} />}
                            {showDelete && <Ionicons name="trash-bin" size={30} color="#e6e6e6" onPress={deleteInDb} />}
                        </View>
                    </View>
                    :
                    <View className={` h-full items-center`}>
                        <View style={{ color: "#fafafa", borderColor: "#b3b3b3" }} className={`border rounded-xl flex flex-row px-1`}>
                            <TextInput
                                style={{ color: "#fafafa" }}
                                className={`bg-transparent px-2 w-10/12 text-base `}
                                placeholder="Search for Exercise or Workout"
                                onChangeText={newText => {
                                    setSearchText(newText)
                                }}
                                autoFocus={false}
                            />
                            <View className={``}>
                                <Ionicons name="search" size={25} color="#e6e6e6" onPress={() => {
                                    if (searchText) Keyboard.dismiss()
                                }} />
                            </View>
                        </View>
                        <View className={`h-5/6 w-full mt-3`}>
                            {!isLoading &&
                                <ScrollView>
                                    {exerciseList
                                        .concat(customExercises)
                                        .filter((e) => plainSearchText(e).includes(plainSearchText(searchText)))
                                        .sort((a, b) => plainSearchText(a).localeCompare(plainSearchText(b)))
                                        .map((exercise, i) => {
                                            return (
                                                <View key={i} style={styles.borderColor} className={` flex-row items-center py-2 border-b w-11/12 self-center`}>
                                                    <TouchableOpacity onPress={() => {
                                                        setSelectedTitle(exercise)
                                                    }}>
                                                        <Text style={styles.textStrongColor} className={`text-sm `}> {exercise} </Text>
                                                    </TouchableOpacity>

                                                </View>
                                            )
                                        })}
                                </ScrollView>}
                            {selectedTitle &&
                                <View className={` items-center self-center pt-2 px-4`}>
                                    <Text style={{ color: color.styleTextColorWeak }} className={`text-base `}> {selectedTitle} </Text>
                                    <View className={`flex-row pt-2 items-center`}>
                                        <Text style={{ color: `${weighted && parseInt(weighted) > 0 ? color.styleTextColorWeak : "#b3b3b3"}` }} className={`text-sm `}>Weighted</Text>
                                        <TextInput
                                            style={styles.textWeakColor}
                                            className={`bg-transparent px-1 w-10 text-sm `}
                                            inputMode='numeric'
                                            value={weighted}
                                            placeholder={'0'}
                                            placeholderTextColor="#e6e6e6"
                                            onChangeText={newText => {
                                                setWeighted(newText)
                                            }}
                                            autoFocus={false}
                                            onEndEditing={() => {
                                                Keyboard.dismiss()
                                            }}
                                        />
                                        <TouchableOpacity onPress={() => {
                                            setTuck(!tuck)
                                        }}>
                                            <Text style={{ color: `${tuck ? color.styleTextColorWeak : "#b3b3b3"}` }} className={`text-sm `}>Tuck</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            }

                            <View className={`flex-row my-3 flex-wrap items-center px-4`}>
                                {['Max Reps', 'Max Hold', 'Reps per Time', 'Min Time', 'Max Time'].map((type, i) =>
                                    <TouchableOpacity key={i} onPress={() => setRecordType(type)}>
                                        <Text style={{ color: `${recordType === type ? color.styleTextColorWeak : "#b3b3b3"}` }} className={`text-sm pr-4 pt-3`}>{type} </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            < TouchableOpacity onPress={() => setTitle([selectedTitle, `${weighted && parseInt(weighted) > 0 ? `+${weighted}Kg` : ''} ${tuck ? 'Tuck' : ''}`])}>
                                {selectedTitle && recordType && <Text style={styles.textStrongColor} className={` text-sm self-center pt-3`}>DONE</Text>}
                            </TouchableOpacity>

                        </View>
                    </View>
                }
                {title[0] &&
                    <View className={`space-y-2 `}>
                        {['Max Reps', 'Reps per Time'].includes(recordType) && <View className={` items-center space-y-7 `}>
                            <View className={`flex flex-row items-center`}>
                                <TextInput
                                    style={styles.textStrongColor}
                                    className={`bg-transparent w-24 text-center rounded-md px-2 py-1 text-2xl font-semibold`}
                                    inputMode='numeric'
                                    maxLength={6}
                                    placeholder={props.recordValue[0] || '0'}
                                    placeholderTextColor="#a1a1aa"
                                    onChangeText={a => setNewRecordValue([a, newRecordValue[1]])}
                                    autoFocus={true}
                                    value={newRecordValue[0]} />
                            </View>
                        </View>}

                        {['Max Hold', 'Reps per Time', 'Min Time', 'Max Time'].includes(recordType) && <View className={` items-center space-y-7 mb-16`}>
                            <View className={`flex flex-row `}>
                                {newRecordTime.map((item, i) =>
                                    <View key={i} className={`flex flex-row items-center`}>
                                        <TextInput
                                            style={styles.textStrongColor}
                                            className={`bg-transparent w-20 h-12 text-center rounded-ms px-2 py-1 text-2xl font-semibold`}
                                            inputMode='numeric'
                                            maxLength={2}
                                            placeholder={t[i]}
                                            placeholderTextColor="#a1a1aa"
                                            onChangeText={a => {
                                                if (a.length === 2 && parseInt(a) > 59) a = '59'
                                                setNewRecordTime(() => {
                                                    const update = [...newRecordTime]
                                                    update[i] = a.toString()
                                                    return update
                                                })
                                            }}
                                            autoFocus={true}
                                            value={item === '00' ? '' : item} />
                                        {i < 2 && <Text style={styles.textStrongColor} className={` text-2xl font-semibold`}>:</Text>}
                                    </View>
                                )}
                            </View>
                        </View>}
                        <View className={`self-center`}>
                            <TouchableOpacity onPress={() => {
                                addToDb();
                            }}>
                                <Text style={{ color: color.styleTextColor }} className={`text-lg font-semibold border border-zinc-300 rounded-md`}>{props.title[0] ? ' UPDATE ' : ' CREATE '}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>
        </View >
    )
}

export default UpdateRecordValue