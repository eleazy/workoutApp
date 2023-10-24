import { View, Text, StatusBar, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../utils/utils.js";
import { workoutsObjFirebase, getThemeValue } from "../data/dataHandling.js";
import { store, triggerEnd } from "../redux/store";

const Header = () => {
  const color = colors[getThemeValue()];
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState("");
  const [endWorkout, setEndWorkout] = useState("");

  const workoutId = store.getState().selectedWorkout.value;

  useEffect(() => {
    workoutsObjFirebase()
      .then((data) => {
        setTodayWorkout(() =>
          workoutId !== "-1" ? data[0][data[1].indexOf(workoutId)].name : ""
        );
        setEndWorkout(() =>
          workoutId !== "-1" ? 'END WORKOUT' : ""
        );
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, [workoutId]);

  const workout_size =
    todayWorkout.length > 28
      ? "text-xs"
      : todayWorkout.length > 22
        ? "text-sm"
        : "text-lg";

  return (
    <View
      style={{ borderColor: color.styleTextColorWeak }}
      className={`flex flex-row h-12 bg-black mt-7 border-b px-4 justify-between items-center`}
    >
      <StatusBar translucent={true} />
      <Ionicons
        name="menu"
        size={34}
        onPress={() => navigation.openDrawer()}
        color={"#e6e6e6"}
      />
      <TouchableOpacity onPress={() => navigation.navigate("Workout")}>
        {!isLoading && (
          <Text
            style={{ color: color.styleTextColor }}
            className={`${workout_size} font-semibold `}
          >
            {todayWorkout}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {
        store.dispatch(triggerEnd())
        navigation.navigate('Workout', { random: Math.random() * 999999 })
      }}>
        <Text
          style={{ color: "#f5f5f5" }}
          className={` font-semibold text-lg `}
        >
          {endWorkout}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;
