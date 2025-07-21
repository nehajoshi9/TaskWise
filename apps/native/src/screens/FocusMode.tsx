import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("window");

const FocusMode = ({ route, navigation }) => {
  const { task } = route.params;
  
  // Safety check - if no task is provided, go back
  if (!task) {
    navigation.goBack();
    return null;
  }
  
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task.estimatedTime * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const breatheAnim = new Animated.Value(1);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      breatheAnim.setValue(1);
    }
  }, [isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocus = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseFocus = () => {
    setIsPaused(true);
  };

  const resumeFocus = () => {
    setIsPaused(false);
  };

  const stopFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(task.estimatedTime * 60);
  };

  const progress = ((task.estimatedTime * 60 - timeLeft) / (task.estimatedTime * 60)) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Focus Mode</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Task Info */}
      <View style={styles.taskInfo}>
        <View style={styles.priorityContainer}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.timerCircle, { transform: [{ scale: breatheAnim }] }]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerLabel}>
            {isActive ? (isPaused ? "Paused" : "Focusing...") : "Ready to focus"}
          </Text>
        </Animated.View>
        
        {/* Progress Ring */}
        <View style={styles.progressRing}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startFocus}>
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Focus</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlButtons}>
            {isPaused ? (
              <TouchableOpacity style={styles.resumeButton} onPress={resumeFocus}>
                <Ionicons name="play" size={24} color="#6366F1" />
                <Text style={styles.resumeButtonText}>Resume</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.pauseButton} onPress={pauseFocus}>
                <Ionicons name="pause" size={24} color="#F59E0B" />
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.stopButton} onPress={stopFocus}>
              <Ionicons name="stop" size={24} color="#EF4444" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Feather name="zap" size={20} color="#6366F1" />
        <Text style={styles.tipsText}>
          {isActive 
            ? "Stay focused on this task. You can do it!" 
            : "Find a quiet place and eliminate distractions to maximize your focus."
          }
        </Text>
      </View>
    </View>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High": return "#EF4444";
    case "Medium": return "#F59E0B";
    case "Low": return "#10B981";
    default: return "#6B7280";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontFamily: "MMedium",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  taskInfo: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: RFValue(12),
    fontFamily: "MMedium",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  taskTitle: {
    fontSize: RFValue(20),
    fontFamily: "MMedium",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 28,
  },
  taskDescription: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#6B7280",
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  timerText: {
    fontSize: RFValue(36),
    fontFamily: "MMedium",
    color: "#111827",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#6B7280",
  },
  progressRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#E5E7EB",
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#6366F1",
    borderRadius: 100,
  },
  controls: {
    alignItems: "center",
    marginBottom: 40,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#2563EB', // blue-600
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 16,
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pauseButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#F59E0B",
    marginLeft: 6,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resumeButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#6366F1",
    marginLeft: 6,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stopButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#EF4444",
    marginLeft: 6,
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsText: {
    flex: 1,
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#6B7280",
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default FocusMode; 