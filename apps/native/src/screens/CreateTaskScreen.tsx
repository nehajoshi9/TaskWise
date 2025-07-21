import { AntDesign } from "@expo/vector-icons";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RFValue } from "react-native-responsive-fontsize";

const { width } = Dimensions.get("window");

export default function CreateTaskScreen({ navigation }) {
  const createTask = useMutation(api.tasks.createTask);

  const [taskInput, setTaskInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const footerY = new Animated.Value(0);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Slide down the footer
        Animated.timing(footerY, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Slide up the footer
        Animated.timing(footerY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    // Clean up function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [footerY]);

  // Calculate the position of the footer based on the Animated.Value
  const footerTranslateY = footerY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // Adjust this range according to the height of your footer
  });

  const createUserTask = async () => {
    // Validation
    if (!taskInput.trim()) {
      Alert.alert("Error", "Please describe your task");
      return;
    }

    setIsCreating(true);

    try {
      const _taskId = await createTask({
        userInput: taskInput.trim(),
      });
      navigation.navigate("TasksDashboardScreen");
    } catch (error) {
      let errorMessage = "Failed to create task. ";
      if (error.message?.includes("User not found")) {
        errorMessage += "Please make sure you're logged in.";
      } else if (
        error.message?.includes("NetworkError") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage += "Please check your internet connection.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/TaskWiseLogo2.png")} // TaskWise Logo
          style={styles.logo}
        />
      </View>

      <View style={styles.underHeaderContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={styles.arrowBack}
            source={require("../assets/icons/arrow-back.png")}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Create a New Task</Text>
        <TouchableOpacity>
          <Image
            style={styles.arrowBack}
            source={require("../assets/icons/saveIcon.png")}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Task Description</Text>
          <TextInput
            value={taskInput}
            onChangeText={(val: string) => setTaskInput(val)}
            style={[styles.inputField, styles.inputFieldMulti]}
            multiline
            placeholder="e.g., 'Call mom tomorrow morning - urgent', 'Quick 5 min walk around the block', 'Finish the presentation by Friday'"
            placeholderTextColor="#A9A9A9"
          />
          <Text style={styles.inputSubtext}>
            AI will automatically categorize, prioritize, and tag your task based on your description.
          </Text>
        </View>

      </KeyboardAwareScrollView>
      <Animated.View
        style={[
          styles.newNoteButtonContainer,
          { transform: [{ translateY: footerTranslateY }] },
        ]}
      >
        <TouchableOpacity
          onPress={createUserTask}
          style={[
            styles.newTaskButton,
            isCreating && styles.newTaskButtonDisabled,
          ]}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.newTaskButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <AntDesign name="pluscircle" size={20} color="#fff" />
              <Text style={styles.newTaskButtonText}>Create Task</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#0D87E1",
    height: 67,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 20,
    resizeMode: "contain",
  },
  underHeaderContainer: {
    width: width,
    height: 62,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#D9D9D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  arrowBack: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: RFValue(17.5),
    fontFamily: "MMedium",
    color: "#2D2D2D",
  },
  inputContainer: {
    paddingHorizontal: 27,
    marginTop: 43,
  },
  inputLabel: {
    fontSize: RFValue(15),
    fontFamily: "MMedium",
    color: "#000",
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: "#FFF",
    marginBottom: 30,
    fontSize: RFValue(15),
    fontFamily: "MLight",
    color: "#000",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12.5,
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  inputFieldMulti: {
    minHeight: 228,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  inputSubtext: {
    fontSize: RFValue(12.5),
    fontFamily: "MRegular",
    color: "#A9A9A9",
    marginTop: -20,
    marginBottom: 20,
  },
  advancedSummarizationContainer: {
    paddingHorizontal: 27,
    marginTop: 10,
  },
  advancedSummarizationCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: RFValue(17.5),
    height: RFValue(17.5),
    borderRadius: RFValue(5),
    borderWidth: 1,
    borderColor: "#0D87E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: RFValue(10),
    backgroundColor: "#F9F5FF",
  },
  checkboxDisabled: {
    width: RFValue(17.5),
    height: RFValue(17.5),
    borderRadius: RFValue(5),
    borderWidth: 1,
    borderColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: RFValue(10),
    backgroundColor: "#F9F5FF",
  },
  advancedSummarizationText: {
    fontSize: RFValue(15),
    fontFamily: "MLight",
    color: "#000",
  },
  advancedSummarizationSubtext: {
    fontSize: RFValue(12.5),
    fontFamily: "MRegular",
    color: "#A9A9A9",
    paddingHorizontal: 30,
  },
  newTaskButton: {
    flexDirection: "row",
    backgroundColor: "#0D87E1",
    borderRadius: 7,
    width: width / 1.6,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    position: "absolute",
    bottom: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  newTaskButtonText: {
    color: "white",
    fontSize: RFValue(15),
    fontFamily: "MMedium",
    marginLeft: 10,
  },
  newTaskButtonDisabled: {
    opacity: 0.7,
  },
  newNoteButtonContainer: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    // ... other styles you need
  },
  newNoteButtonDisabled: {
    opacity: 0.7,
  },
});
