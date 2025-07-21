import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  findNodeHandle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { CheckCircleIcon } from "react-native-heroicons/outline";

const { width } = Dimensions.get("window");

export default function TasksDashboardScreen({ navigation }) {
  const { user } = useUser();
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const tagInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Create, 1 = Tasks
  const [taskInput, setTaskInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  const tasks = useQuery(api.tasks.getTasks, {
    category: selectedCategory === "All" ? undefined : selectedCategory,
    dueDateFilter: selectedDueDateFilter || undefined
  });
  const focusTask = useQuery(api.tasks.getFocusTask);
  const createTask = useMutation(api.tasks.createTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const addCategory = useMutation(api.tasks.addCategory);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteCategory = useMutation(api.tasks.deleteCategory);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const categories = useQuery(api.tasks.getCategories) || ["Work", "Errands", "Self-care", "Urgent", "Other"];
  
  // Get unique tags from tasks
  const taskTags = ["All", ...new Set(tasks?.flatMap(task => task.tags || []).filter(Boolean) || [])];
  
  // Combine task-based tags with user-added ones
  const [userTags, setUserTags] = useState<string[]>([]);
  const tags = [...new Set([...taskTags, ...userTags])];

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

  const handleDeleteCategory = async (categoryToDelete: string) => {
    try {
      await deleteCategory({ name: categoryToDelete });
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory("All");
      }
      // Optionally, you can refetch categories or filter them out locally if needed
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert("Error", "Failed to delete category");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setUserTags([...userTags, newTag.trim()]);
      setNewTag("");
      setShowAddTag(false);
    }
  };

  const handleShowAddTag = () => {
    setShowAddTag(true);
    // KeyboardAwareScrollView will automatically handle scrolling when the input is focused
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    setUserTags(userTags.filter(tag => tag !== tagToDelete));
    if (selectedTag === tagToDelete) {
      setSelectedTag("All");
    }
    // Remove tag from all tasks in the database
    if (tasks) {
      for (const task of tasks) {
        if (task.tags && task.tags.includes(tagToDelete)) {
          try {
            await updateTask({
              taskId: task._id,
              title: task.title,
              description: task.description || "",
              category: task.category,
              priority: task.priority,
              estimatedTime: task.estimatedTime || 30,
              dueDate: task.dueDate || undefined,
              dueDateTime: task.dueDateTime || undefined,
              tags: task.tags.filter((t: string) => t !== tagToDelete),
            });
          } catch (error) {
            console.error(`Error removing tag from task ${task._id}:`, error);
            Alert.alert("Error", "Failed to remove tag from a task");
          }
        }
      }
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
    const matchesTag = selectedTag === "All" || (task.tags && task.tags.includes(selectedTag));
    return matchesSearch && matchesCategory && matchesTag;
  }) || [];

  const handleCreateTask = async () => {
    if (!taskInput.trim()) return;

    setIsCreating(true);
    try {
      await createTask({
        userInput: taskInput.trim(),
      });
      setTaskInput("");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 500);
    } catch (error) {
      Alert.alert("Error", "Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask({ taskId }),
        },
      ]
    );
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus({ taskId, status: newStatus });
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#FF6B6B";
      case "medium": return "#FFA726";
      case "low": return "#66BB6A";
      default: return "#9E9E9E";
    }
  };

  const renderTaskCard = ({ item, index }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={[styles.taskTitle, item.status === "Completed" && { textDecorationLine: 'line-through', color: '#6b7280' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}> 
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        <View style={styles.taskActions}>
          {/* Edit icon always visible */}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditTask', { taskId: item._id })}
            style={styles.editButton}
          >
            <Feather name="edit-2" size={16} color="#666" />
          </TouchableOpacity>
          {/* Focus and check only if not completed */}
          {item.status !== "Completed" && (
            <>
              <TouchableOpacity
                onPress={() => navigation.navigate('FocusMode', { task: item })}
                style={styles.focusTaskButton}
              >
                <Ionicons name="timer-outline" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleStatusChange(item._id, item.status === "Completed" ? "Pending" : "Completed")}
                style={{ marginHorizontal: 4, alignSelf: 'center' }}
                accessibilityLabel={item.status === "Completed" ? "Mark as incomplete" : "Mark as completed"}
              >
                <CheckCircleIcon
                  size={28}
                  color={"#22c55e"}
                  fill={item.status === "Completed" ? "#22c55e" : "none"}
                />
              </TouchableOpacity>
            </>
          )}
          {/* Delete icon always visible */}
          <TouchableOpacity
            onPress={() => handleDeleteTask(item._id)}
            style={styles.deleteButton}
          >
            <Feather name="trash-2" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
      <View style={styles.taskMeta}>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
        {item.estimatedTime && (
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.timeText}>{item.estimatedTime}m</Text>
          </View>
        )}
        {item.dueDate && (
          <View style={styles.dueDateBadge}>
            <Ionicons name="calendar-outline" size={12} color="#FF6B6B" />
            <Text style={styles.dueDateText}>
              Due: {item.dueDateTime 
                ? new Date(item.dueDateTime).toLocaleString() 
                : new Date(item.dueDate).toLocaleDateString()
              }
            </Text>
          </View>
        )}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const renderFilterChip = ({ item, type }) => {
    const isSelected = (type === 'category' ? selectedCategory : selectedTag) === item;
    // For tags, show 'x' for all except 'All'. For categories, keep as before.
    const isUserCreated = type === 'tag' ? item !== 'All' : categories.includes(item);

    const onSelect = (selectedItem: string) => {
      if (type === 'category') {
        setSelectedCategory(selectedItem);
      } else {
        setSelectedTag(selectedItem);
      }
    };

    const onDelete = (itemToDelete: string) => {
      if (type === 'category') {
        handleDeleteCategory(itemToDelete);
      } else {
        handleDeleteTag(itemToDelete);
      }
    };

    return (
      <View style={styles.filterChipContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            isSelected && styles.filterChipActive
          ]}
          onPress={() => onSelect(item)}
        >
          <Text style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextActive
          ]}>
            {item}
          </Text>
          {isUserCreated && (
            <TouchableOpacity
              onPress={() => onDelete(item)}
              style={{ marginLeft: 6, padding: 2, borderRadius: 8, backgroundColor: 'transparent' }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={14} color="#888" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Notification Popup */}
      {showNotification && (
        <View style={styles.notificationContainer}>
          <View style={styles.notificationContent}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.notificationText}>Task Added!</Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TaskWise</Text>
        <TouchableOpacity
          onPress={() => {
            if (focusTask === undefined) {
              Alert.alert('Loading', 'Please wait while we load your tasks...');
              return;
            }
            if (focusTask) {
              navigation.navigate('FocusMode', { task: focusTask });
            } else {
              Alert.alert('No Focus Task', 'No pending tasks available for focus mode. Create a task first!');
            }
          }}
          style={styles.focusButton}
        >
          <Text style={[styles.focusButtonText, { color: focusTask ? "#007AFF" : "#999" }]}>
            Focus Mode
          </Text>
          {focusTask && (
            <View style={styles.focusIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            Create Task
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            My Tasks ({filteredTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 0 ? (
        /* Create Task Tab */
        <View style={styles.createContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="What do you need to do?"
              value={taskInput}
              onChangeText={setTaskInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.createButton,
                !taskInput.trim() && styles.createButtonDisabled
              ]}
              onPress={handleCreateTask}
              disabled={!taskInput.trim() || isCreating}
            >
              {isCreating ? (
                <Text style={styles.createButtonText}>Creating...</Text>
              ) : (
                <Text style={styles.createButtonText}>Create Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Tasks List Tab */
        <KeyboardAwareScrollView 
          ref={scrollViewRef}
          style={styles.tasksContainer} 
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersContainer}>
            <Text style={styles.filterLabel}>Categories:</Text>
            <View style={styles.filterSection}>
              <FlatList
                data={categories}
                renderItem={(props) => renderFilterChip({ ...props, type: 'category' })}
                keyExtractor={(item) => `category-${item}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterList}
              />
              {showAddCategory ? (
                <View style={styles.addInputContainer}>
                  <TextInput
                    style={styles.addInput}
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="New category"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCategory}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddCategory(false);
                      setNewCategory("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addChipButton}
                  onPress={() => setShowAddCategory(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addChipText}>Add Category</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.filterLabel}>Tags:</Text>
            <View style={styles.filterSection}>
              <FlatList
                data={tags}
                renderItem={(props) => renderFilterChip({ ...props, type: 'tag' })}
                keyExtractor={(item) => `tag-${item}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterList}
              />
              {showAddTag ? (
                <View style={styles.addInputContainer}>
                  <TextInput
                    ref={tagInputRef}
                    style={styles.addInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="New tag"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddTag}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowAddTag(false);
                      setNewTag("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addChipButton}
                  onPress={handleShowAddTag}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addChipText}>Add Tag</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.filterLabel}>Due Date:</Text>
            <View style={styles.filterSection}>
              <FlatList
                data={[
                  { value: "overdue", label: "Overdue" },
                  { value: "today", label: "Today" },
                  { value: "tomorrow", label: "Tomorrow" },
                  { value: "this-week", label: "This Week" },
                  { value: "next-week", label: "Next Week" },
                ]}
                renderItem={({ item }) => (
                  <View style={styles.filterChipContainer}>
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        selectedDueDateFilter === item.value && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedDueDateFilter(selectedDueDateFilter === item.value ? "" : item.value)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedDueDateFilter === item.value && styles.filterChipTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => `dueDate-${item.value}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterList}
              />
            </View>
          </View>

          {/* Tasks List */}
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={48} color="#DDD" />
                <Text style={styles.emptyStateText}>No tasks yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first task to get started!
                </Text>
              </View>
            }
          />
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    //borderBottomWidth: 1,
    //borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: RFValue(24),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  focusButton: {
    padding: 8,
    position: 'relative',
  },
  focusButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
  },
  focusIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#FFF",
  },
  createContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskInput: {
    fontSize: RFValue(16),
    color: "#1A1A1A",
    minHeight: 130,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#E9ECEF",
  },
  createButtonText: {
    color: "#FFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  tasksContainer: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(16),
    color: "#1A1A1A",
  },
  filtersContainer: {
    marginBottom: 20,
    borderBottomColor: "#E9ECEF",
    borderBottomWidth: 1,
  },
  filterLabel: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 16,
  },
  filterList: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    flexDirection: "row",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterChipText: {
    fontSize: RFValue(12),
    color: "#666",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  tasksList: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  focusTaskButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  priorityText: {
    fontSize: RFValue(10),
    color: "#FFF",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  deleteButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: RFValue(14),
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: RFValue(10),
    color: "#1976D2",
    fontWeight: "500",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  timeText: {
    fontSize: RFValue(9),
    color: "#666",
    fontWeight: "500",
    marginLeft: 2,
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  dueDateText: {
    fontSize: RFValue(9),
    color: "#FF6B6B",
    fontWeight: "500",
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagBadge: {
    backgroundColor: "#F3E5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  tagText: {
    fontSize: RFValue(9),
    color: "#7B1FA2",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: RFValue(10),
    color: "#666",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: RFValue(14),
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  notificationContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: 8,
  },
  filterChipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  deleteChipButton: {
    marginLeft: 4,
    padding: 2,
  },
  filterSection: {
    marginBottom: 16,
  },
  addInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: RFValue(14),
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
  addChipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    gap: 4,
  },
  addChipText: {
    color: "#007AFF",
    fontSize: RFValue(12),
    fontWeight: "500",
  },
});
