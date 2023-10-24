import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { styles } from '../utils/utils.js';
import { setInitialData } from '../data/dataHandling.js';
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [blockInput, setBlockInput] = useState(false);
    const [signUp, setSignUp] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const fixMessage = (message) => message.slice(5).split('-').join(' ');

    const userLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
            })
            .catch((error) => {
                if (error.code === 'auth/invalid-login-credentials') {
                    alert('That email address is invalid!');
                } else {
                    error.message !== 'undefined' && Alert.alert(fixMessage(error.code));
                }
            });
    };

    const userRegister = async () => {
        if (age == '') {
            Alert.alert('Please enter your age');
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setDoc(doc(db, "users", email), { email: email });

                setInitialData(email, age);
                setBlockInput(true);
            })
            .catch((error) => {
                error.message !== 'undefined' && Alert.alert(fixMessage(error.code));
            });
    };

    const anonymousLogin = () => {
        signInAnonymously(auth)
            .catch(error => {
                console.error(error);
            });
    };

    const inputValue = [age, email, password];
    const inputSetters = [setAge, setEmail, setPassword];
    const inputMode = ['numeric', 'email', 'text'];

    return (
        <View className={`h-full items-center bg-black p-2`}>
            <View className={`items-center space-y-5 pt-20`}>
                {['Age', 'Email', 'Password'].slice(signUp).map((e, i) => {
                    const iC = signUp == 0 ? i : i + 1;
                    return (
                        <View key={i} className={`items-center `}>
                            <Text style={styles.textWeakColor} className={`text-xl pb-2`}>{e}</Text>
                            <View className={`bg-zinc-800 rounded-xl w-[90vw] flex-row items-center `}>
                                <TextInput
                                    style={styles.textStrongColor}
                                    className={`w-full h-12 text-center px-2 py-1 text-xl `}
                                    onChangeText={a => inputSetters[iC](a)}
                                    inputMode={inputMode[iC]}
                                    secureTextEntry={e === "Password" && !showPassword}
                                    maxLength={e === 'Age' ? 2 : 40}
                                    autoFocus={i == 0 && true}
                                    value={inputValue[iC]}
                                    editable={!blockInput}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Text style={styles.textWeakColor} className={`${e !== 'Password' && 'hidden'} text-xs fixed right-10`}>{showPassword ? 'Hide' : 'Show'}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.textWeakColor} className={` ${e !== "Password" && 'hidden'} text-sm`}>At least 6 characters</Text>
                        </View>
                    )
                })}

                <TouchableOpacity onPress={() => { signUp == 1 ? userLogin() : userRegister(); }}>
                    <Text style={styles.textStrongColor} className={`text-lg border border-zinc-400 p-1 px-2 text-center rounded-xl`}>{signUp == 1 ? `Log In` : `Sign Up`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setSignUp(signUp ? 0 : 1);
                    setShowPassword(false);
                }}>
                    <Text style={styles.textStrongColor} className={`text-lg `}>{signUp == 1 ? `Sign Up instead` : `Return`}</Text>
                </TouchableOpacity>

            </View>
            <TouchableOpacity onPress={anonymousLogin}>
                <Text style={styles.textWeakColor} className={`text-lg mt-10`}>Continue in guest mode</Text>
            </TouchableOpacity>
        </View>
    )
}