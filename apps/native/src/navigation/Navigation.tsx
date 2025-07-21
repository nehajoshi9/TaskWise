import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CreateTaskScreen from "../screens/CreateTaskScreen";
import EditTaskScreen from "../screens/EditTaskScreen";
import FocusMode from "../screens/FocusMode";
import InsideTaskScreen from "../screens/InsideTaskScreen";
import LoginScreen from "../screens/LoginScreen";
import TasksDashboardScreen from "../screens/TasksDashboardScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName="LoginScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen
          name="TasksDashboardScreen"
          component={TasksDashboardScreen}
        />
        <Stack.Screen name="InsideTaskScreen" component={InsideTaskScreen} />
        <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen name="FocusMode" component={FocusMode} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
