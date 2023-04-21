import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import TrendList from "../Screens/TrendList";
const NativeStack = createNativeStackNavigator();

const Stack = ({ navigation }) => (
  <NativeStack.Navigator>
    <NativeStack.Screen
      name="급상승 인기 검색어"
      component={TrendList}
      options={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#EEF1FF",
        },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
      }}
    />
  </NativeStack.Navigator>
);

export default Stack;
