import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Switch,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditTaskScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: Id<"tasks">;
    };
  };
}

const priorities = ["High", "Medium", "Low"];

export default function EditTaskScreen({ navigation, route }: EditTaskScreenProps) {
  const { taskId } = route.params;
  const updateTask = useMutation(api.tasks.updateTask);
  const addCategory = useMutation(api.tasks.addCategory);
  const task = useQuery(api.tasks.getTask, { taskId });
  const categories = useQuery(api.tasks.getCategories) || ["Work", "Errands", "Self-care", "Urgent", "Other"];
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    category: task?.category || "Work",
    priority: task?.priority || "Medium",
    estimatedTime: task?.estimatedTime || 30,
    dueDate: task?.dueDate || "",
    dueDateTime: task?.dueDateTime || "",
    tags: task?.tags || [],
  });
  const [newTag, setNewTag] = useState("");
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const [isCompleted, setIsCompleted] = useState(task?.status === "Completed");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        category: task.category,
        priority: task.priority,
        estimatedTime: task.estimatedTime || 30,
        dueDate: task.dueDate || "",
        dueDateTime: task.dueDateTime || "",
        tags: task.tags,
      });
      setIsCompleted(task.status === "Completed");
    }
  }, [task]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD without timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setFormData(prev => ({
        ...prev,
        dueDate: dateString
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      // Format time as HH:MM:SS without timezone conversion
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const seconds = String(selectedTime.getSeconds()).padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds}`;
      
      // Use current date if no date is set
      const date = formData.dueDate || (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      
      const dateTime = `${date}T${timeString}`;
      setFormData(prev => ({
        ...prev,
        dueDateTime: dateTime
      }));
    }
  };

  const handleDateSubmit = () => {
    // If no date was selected, use current date
    if (!formData.dueDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setFormData(prev => ({
        ...prev,
        dueDate: dateString
      }));
    }
    setShowDatePicker(false);
  };

  const handleTimeSubmit = () => {
    // If no time was selected, use current time
    if (!formData.dueDateTime) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds}`;
      
      const date = formData.dueDate || (() => {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      
      const dateTime = `${date}T${timeString}`;
      setFormData(prev => ({
        ...prev,
        dueDateTime: dateTime
      }));
    }
    setShowTimePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
      // Scroll to bottom after adding tag
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd();
      }, 100);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      try {
        await addCategory({ name: newCategory.trim() });
        setNewCategory("");
        setShowAddCategory(false);
      } catch (error) {
        console.error("Error adding category:", error);
        Alert.alert("Error", "Failed to add category");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setIsLoading(true);
    try {
      await updateTask({
        taskId,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime || undefined,
        dueDate: formData.dueDate || undefined,
        dueDateTime: formData.dueDateTime || undefined,
        tags: formData.tags,
      });
      Alert.alert("Success", "Task updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (value: boolean) => {
    setIsCompleted(value);
    try {
      await updateTaskStatus({ taskId, status: value ? "Completed" : "Incomplete" });
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !formData.title.trim()}
          style={[
            styles.saveButton,
            (!formData.title.trim() || isLoading) && styles.saveButtonDisabled
          ]}
        >
          <Text style={[
            styles.saveButtonText,
            (!formData.title.trim() || isLoading) && styles.saveButtonTextDisabled
          ]}>
            {isLoading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Mark as completed toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Switch
            value={isCompleted}
            onValueChange={handleStatusToggle}
            thumbColor={isCompleted ? '#007AFF' : '#f4f3f4'}
            trackColor={{ false: '#ccc', true: '#B3D8FF' }}
          />
          <Text style={{ marginLeft: 12, fontSize: 16, color: '#333', fontWeight: '500' }}>
            Mark as completed
          </Text>
        </View>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => handleInputChange("title", text)}
            placeholder="Task title"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Add a description..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.pickerOption,
                  formData.category === category && styles.pickerOptionSelected
                ]}
                onPress={() => handleInputChange("category", category)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.category === category && styles.pickerOptionTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
            {!showAddCategory ? (
              <TouchableOpacity
                style={[styles.pickerOption, styles.addButton]}
                onPress={() => setShowAddCategory(true)}
              >
                <Feather name="plus" size={16} color="#007AFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.inlineCategoryInput}>
                <TextInput
                  style={styles.inlineCategoryTextInput}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  placeholder="New category"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.inlineButton, styles.confirmButton]}
                  onPress={handleAddCategory}
                  disabled={!newCategory.trim()}
                >
                  <Feather name="check" size={14} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inlineButton, styles.cancelInlineButton]}
                  onPress={() => {
                    setShowAddCategory(false);
                    setNewCategory("");
                  }}
                >
                  <Feather name="x" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerContainer}>
            {priorities.map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.pickerOption,
                  formData.priority === priority && styles.pickerOptionSelected
                ]}
                onPress={() => handleInputChange("priority", priority)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.priority === priority && styles.pickerOptionTextSelected
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        // Due Date and Due Time Picker Sections

{/* Due Date */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Due Date</Text>
  <TouchableOpacity
    style={[styles.textInput, styles.buttonInput]}
    onPress={() => setShowDatePicker(true)}
    activeOpacity={0.7}
  >
    <Text style={formData.dueDate ? styles.dateText : styles.placeholderText}>
      {formData.dueDate || "Select date"}
    </Text>
    {formData.dueDate && (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          setFormData(prev => ({ ...prev, dueDate: "", dueDateTime: "" }));
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.clearButtonText}>×</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
</View>

{/* Due Time */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Due Time</Text>
  <TouchableOpacity
    style={[styles.textInput, styles.buttonInput]}
    onPress={() => setShowTimePicker(true)}
    activeOpacity={0.7}
  >
    <Text style={formData.dueDateTime ? styles.dateText : styles.placeholderText}>
      {formData.dueDateTime ? formData.dueDateTime.split('T')[1]?.substring(0, 5) : "Select time"}
    </Text>
    {formData.dueDateTime && (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => {
          setFormData(prev => ({ ...prev, dueDateTime: "" }));
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.clearButtonText}>×</Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
</View>

{/* Date and Time Pickers */}
{showDatePicker && (
  <View style={styles.dateTimePickerContainer}>
    <DateTimePicker
      value={formData.dueDate ? (() => {
        const [year, month, day] = formData.dueDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      })() : new Date()}
      mode="date"
      display="spinner"
      onChange={handleDateChange}
    />
    <View style={styles.pickerButtons}>
      <TouchableOpacity style={styles.pickerCancelButton} onPress={handleDateCancel}>
        <Text style={styles.pickerCancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.pickerSubmitButton} onPress={handleDateSubmit}>
        <Text style={styles.pickerSubmitButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

{showTimePicker && (
  <View style={styles.dateTimePickerContainer}>
    <DateTimePicker
      value={formData.dueDateTime ? (() => {
        const [datePart, timePart] = formData.dueDateTime.split('T');
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      })() : new Date()}
      mode="time"
      display="spinner"
      onChange={handleTimeChange}
    />
    <View style={styles.pickerButtons}>
      <TouchableOpacity style={styles.pickerCancelButton} onPress={handleTimeCancel}>
        <Text style={styles.pickerCancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.pickerSubmitButton} onPress={handleTimeSubmit}>
        <Text style={styles.pickerSubmitButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  </View>
)}


        {/* Estimated Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estimated Time (min)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.estimatedTime.toString()}
            onChangeText={(text) => handleInputChange("estimatedTime", parseInt(text) || 0)}
            placeholder="30"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  style={styles.tagRemoveButton}
                >
                  <Feather name="x" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.addTagInput}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag..."
              placeholderTextColor="#999"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity
              onPress={handleAddTag}
              disabled={!newTag.trim()}
              style={[
                styles.addTagButton,
                !newTag.trim() && styles.addTagButtonDisabled
              ]}
            >
              <Text style={[
                styles.addTagButtonText,
                !newTag.trim() && styles.addTagButtonTextDisabled
              ]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>


      </KeyboardAwareScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    width: (width - 60) / 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  pickerOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#666",
  },
  pickerOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#f0f8ff",
    borderColor: "#007AFF",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#1976d2",
    marginRight: 4,
  },
  tagRemoveButton: {
    padding: 2,
  },
  addTagContainer: {
    flexDirection: "row",
    gap: 8,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
  },
  addTagButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addTagButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  addTagButtonTextDisabled: {
    color: "#999",
  },
  addCategoryContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  categoryInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  addCategoryButtons: {
    flexDirection: "row",
    gap: 8,
  },
  addCategoryButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addCategoryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "white",
  },
  inlineCategoryInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inlineCategoryTextInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    minWidth: 100,
  },
  inlineButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  cancelInlineButton: {
    backgroundColor: "#6c757d",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
    color: "#666",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  buttonInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#6c757d",
    fontSize: 12,
    fontWeight: "600",
  },
  dateTimePickerContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 16,
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  pickerCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  pickerCancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerSubmitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  pickerSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
}); 