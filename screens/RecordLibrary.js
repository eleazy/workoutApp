import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { colors, handleSelection, windowHeight, styles, formatTime, plainSearchText } from '../utils/utils.js';
import CreateEditRecord from '../components/CreateEditRecord.js';
import { recordsObjFirebase, getThemeValue } from '../data/dataHandling.js';

const RecordLibrary = ({ navigation }) => {
    const color = colors[getThemeValue()];
    const recordGroups = ['Max Reps', 'Max Hold', 'Reps per Time', 'Min Time', 'Max Time'];

    const [showUpdate, setShowUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [recordProps, setRecordProps] = useState([['', ''], '', ['', '']]);
    const [selectedTypes, setselectedTypes] = useState([]);
    const [recordValues, setRecordValues] = useState();
    const [recordsDisplay, setRecordsDisplay] = useState([]);
    const [recordType, setRecordType] = useState([]);
    const [recordsFirebase, setRecordsFirebase] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        recordsObjFirebase().then((data) => {
            setRecordsFirebase(data[0]);
            setIsLoading(false);
        })
    }, [showUpdate]);

    useEffect(() => {
        let recordsFinal = recordsFirebase.filter((e) => selectedTypes.length > 0
            ? selectedTypes.includes(e.type) && plainSearchText(e.name[0]).includes(plainSearchText(searchText))
            : plainSearchText(e.name[0]).includes(plainSearchText(searchText)));

        setRecordsDisplay(recordsFinal.map((e) => e.name));
        setRecordType(recordsFinal.map((e) => e.type));
        setRecordValues(recordsFinal.map((e) => e.value));

    }, [selectedTypes, searchText, isLoading]);

    const backAction = () => {
        if (showUpdate) {
            setShowUpdate(false);
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
        <View className={`flex-1 w-full p-1 items-center space-y-4`}>
            {!showUpdate &&
                <View className={`h-4/6 w-full p-1 items-center space-y-4 `}>
                    <View className={` flex flex-row items-end justify-center w-full `}>

                        {showSearch ? <TextInput
                            style={{ color: "#f5f5f5", borderColor: "#b3b3b3" }}
                            className={`bg-transparent border rounded-xl px-2 py-1 w-80 text-base `}
                            placeholder="Search for Record"
                            placeholderTextColor="#a1a1aa"
                            onChangeText={newText => setSearchText(newText)}
                            autoFocus={true}
                            onEndEditing={() => searchText === '' && setShowSearch(false)}
                        /> :
                            <Text style={styles.textWeakColor} className={`text-xl font-semibold `}>Records</Text>}

                        <View className={`absolute right-0`}>
                            <Ionicons name="search" size={29} color="#e6e6e6" onPress={() => setShowSearch(true)} />
                        </View>
                    </View>

                    <View className={` w-full items-start space-y-2`}>
                        <Text style={styles.textWeakColor} className={`text-sm pl-2`}>Group By</Text>

                        <View className={`flex flex-row flex-wrap w-full pl-1 `}>
                            {recordGroups.map((recordType, i) => {
                                return (
                                    <TouchableOpacity key={i} onPress={() => handleSelection(recordType, selectedTypes, setselectedTypes)}>
                                        <Text key={i} style={{ color: `${selectedTypes.includes(recordType) ? color.styleTextColor : "#b3b3b3"}` }}
                                            className={`text-sm mr-4 mb-2 `}> {recordType} </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    <View className={`bg-zinc-900 w-full mb-12 px-2 `}>
                        <ScrollView>
                            {!isLoading ?
                                recordsDisplay.length > 0 ?
                                    recordsDisplay.map((title, i) => {
                                        const title_size = title[0].length > 12 ? 'text-base' : 'text-xl';
                                        const record_1_size = windowHeight > 800 ? 'text-xl' : 'text-base';
                                        return (
                                            <View key={i} className={` `}>
                                                <Text style={{ color: color.styleTextColor }} className={` ${title_size} font-semibold`}>{title[0]}</Text>

                                                <View style={{ borderColor: "#929292" }} className={` flex-row items-end pb-2 justify-between border-b`}>
                                                    <View className={`flex-row  justify-start `}>
                                                        <View className={`items-start justify-end w-32 `}>
                                                            <Text style={styles.textWeakColor} className={` text-base `}>{title[1] && title[1]} </Text>
                                                            <Text style={styles.textWeakColor} className={`text-base font-semibold`}>{recordType[i]} </Text>
                                                        </View>

                                                        <View className={` flex-row items-end self-end `}>
                                                            {parseInt(recordValues[i][0]) > 0 && <Text style={styles.textStrongColor} className={`text-2xl font-semibold `}> {recordValues[i][0]} </Text>}
                                                            {parseInt(recordValues[i][1]) > 0 &&
                                                                <Text key={i} style={styles.textStrongColor} className={` ${record_1_size} font-semibold `}>{formatTime(Number(recordValues[i][1])).join(':')}</Text>
                                                            }
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity onPress={() => {
                                                        setRecordProps([title, recordType[i], recordValues[i]])
                                                        setShowUpdate(true)
                                                    }}>
                                                        <Text style={{ color: color.styleTextColor, borderColor: "#b3b3b3" }} className={` text-lg font-semibold px-2 border rounded-md `}>UPDATE</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )
                                    })
                                    :
                                    <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center py-16`}>No Records Found</Text>
                                :
                                <Text style={styles.textWeakColor} className={`text-lg font-semibold self-center py-16`}>Loading...</Text>
                            }
                        </ScrollView>
                    </View>
                </View>
            }

            {showUpdate && <CreateEditRecord setShowUpdate={setShowUpdate} title={recordProps[0]} recordType={recordProps[1]} recordValue={recordProps[2]} />}
            <View className={`absolute bottom-5 `}>
                {showUpdate ? <Ionicons name="return-down-back" size={54} color="#e6e6e6" onPress={() => setShowUpdate(false)} /> :
                    <TouchableOpacity onPress={() => {
                        setRecordProps([['', ''], '', ['', '']]);
                        setShowUpdate(true);
                    }}>
                        <View className={`w-fit px-10 pb-9 mt-1`}>
                            <Text style={styles.textWeakColor} className={` text-lg font-semibold `}>Add New Record</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

export default RecordLibrary