import { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RFValue } from "react-native-responsive-fontsize";

const { width } = Dimensions.get("window");

export default function InsideTaskScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/TaskWiseLogo2.png")}
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

        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity></TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.isProcessing && styles.processingText]}>
              {item.isProcessing ? "Processing..." : item.title}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>
                {item.isProcessing ? "..." : item.priority}
              </Text>
            </View>
          </View>
          
          {item.description && !item.isProcessing && (
            <Text style={styles.taskDescription}>{item.description}</Text>
          )}
          {item.isProcessing && (
            <Text style={[styles.taskDescription, styles.processingText]}>
              AI is analyzing your task...
            </Text>
          )}
          
          <View style={styles.taskMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={[styles.metaValue, item.isProcessing && styles.processingText]}>
                {item.isProcessing ? "Processing..." : item.category}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estimated Time</Text>
              <Text style={[styles.metaValue, item.isProcessing && styles.processingText]}>
                {item.isProcessing ? "..." : `${item.estimatedTime} minutes`}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority</Text>
              <Text style={[styles.metaValue, item.isProcessing && styles.processingText]}>
                {item.isProcessing ? "..." : item.priority}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
     );
 }

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High": return "#FEE2E2";
    case "Medium": return "#FEF3C7";
    case "Low": return "#D1FAE5";
    default: return "#F3F4F6";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FE",
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
  contentContainer: {
    // Add styles for contentContainer if needed
  },
  contentTitle: {
    fontSize: RFValue(17.5),
    fontFamily: "MMedium",
    color: "#000",
    textAlign: "center",
    marginTop: 28,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  taskTitle: {
    fontSize: RFValue(20),
    fontFamily: "MMedium",
    color: "#2D2D2D",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  priorityText: {
    fontSize: 14,
    fontFamily: "MMedium",
    color: "#374151",
  },
  taskDescription: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#6B7280",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  taskMeta: {
    paddingHorizontal: 20,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  metaLabel: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#374151",
  },
  metaValue: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  processingText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#D9D9D9",
  },
  footerTab: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footerIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
  activeTab: {
    backgroundColor: "#0D87E1",
  },
  activeIcon: {
    tintColor: "#fff",
  },
  inactiveIcon: {
    tintColor: "#000",
  },
  footerText: {
    fontSize: RFValue(12.5),
    fontFamily: "MRegular",
  },
  activeTabText: {
    color: "#fff",
  },
  inactiveTabText: {
    color: "#000",
  },
});
