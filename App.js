import "react-native-gesture-handler";
import * as React from "react";
import { NavigationContainer, DarkTheme, } from "@react-navigation/native";
import HomeScreen from "./screens/HomeScreen.js";
import Workout from "./screens/Workout.js";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Header from "./components/Header.js";
import ExerciseLibrary from "./screens/ExerciseLibrary.js";
import WorkoutLibrary from "./screens/WorkoutLibrary.js";
import RecordLibrary from "./screens/RecordLibrary.js";
import WeekPlanning from "./screens/WeekPlanning.js";
import WorkoutHistory from "./screens/WorkoutHistory.js";
import Settings from "./screens/Settings.js";
import Login from "./screens/Login.js";
import CustomDrawer from "./components/CustomDrawer.js";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { settingsFirebase, setThemeValue, setMaxHR, setLoggedUser, getLoggedUser } from './data/dataHandling.js';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig.js";

const Drawer = createDrawerNavigator();

export default function App() {

  const [inAppUser, setInAppUser] = useState(getLoggedUser());
  const [isLogged, setIsLogged] = useState(false);
  const [inAppTheme, setInAppTheme] = useState(null);
  const [inAppMaxHR, setInAppMaxHR] = useState(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setInAppUser(user.email);
      user.isAnonymous ? setLoggedUser('guest') : setLoggedUser(user.email);
      setIsLogged(true);
    } else {
      setIsLogged(false);
    }
  });

  useEffect(() => {
    setInAppTheme(null);
    setInAppMaxHR(null);
    if (isLogged) {
      settingsFirebase().then((data) => {
        setThemeValue(data[0].theme);
        setMaxHR(220 - data[1].age);

        setInAppTheme(data[0].theme);
        setInAppMaxHR(data[1].age);
      });
    }
  }, [isLogged, inAppUser]);

  if (!isLogged) {
    return (
      <Login />
    )
  }

  if ((inAppTheme === null) || (inAppMaxHR === null)) return;

  return (
    <Provider store={store} >
      <NavigationContainer theme={DarkTheme} >
        <Drawer.Navigator
          key={inAppUser}
          initialRouteName="Home"
          screenOptions={{
            header: () => <Header />,
            drawerStyle: {
              width: 230,
            },
          }}
          backBehavior="initialRoute"
          drawerContent={(props) => <CustomDrawer {...props} />}
        >
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Workout" component={Workout} />
          <Drawer.Screen name="Exercise Library" component={ExerciseLibrary} />
          <Drawer.Screen name="Workout Library" component={WorkoutLibrary} />
          <Drawer.Screen name="Record Library" component={RecordLibrary} />
          <Drawer.Screen name="Week Planning" component={WeekPlanning} />
          <Drawer.Screen name="Workout History" component={WorkoutHistory} />
          <Drawer.Screen name="Settings" component={Settings} />
          <Drawer.Screen name="Login" component={Login} />
        </Drawer.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
