/**
 * TodoListExample - Demonstrates TanStack React Query integration
 * Shows data fetching, mutations, optimistic updates, and network awareness
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { createCommonStyles } from '@theme/commonStyles';
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
  useCanMutate,
} from '@hooks/useTodos';
import { Todo } from '@services/api';
import { useNetwork } from '@context/NetworkContext';

export const TodoListExample: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createCommonStyles(theme);
  const { isOffline } = useNetwork();
  const canMutate = useCanMutate();

  // State for new todo input
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // React Query hooks
  const {
    data: todos,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTodos({
    // Show cached data while refetching in background
    refetchOnMount: true,
  });

  const createTodoMutation = useCreateTodo({
    onSuccess: () => {
      setNewTodoTitle('');
      Alert.alert(t('common.success'), 'Todo created successfully!');
    },
    onError: error => {
      Alert.alert(t('common.error'), `Failed to create todo: ${error.message}`);
    },
  });

  const updateTodoMutation = useUpdateTodo({
    onError: error => {
      Alert.alert(t('common.error'), `Failed to update todo: ${error.message}`);
    },
  });

  const deleteTodoMutation = useDeleteTodo({
    onSuccess: () => {
      Alert.alert(t('common.success'), 'Todo deleted successfully!');
    },
    onError: error => {
      Alert.alert(t('common.error'), `Failed to delete todo: ${error.message}`);
    },
  });

  const toggleTodoMutation = useToggleTodo({
    onError: error => {
      Alert.alert(t('common.error'), `Failed to toggle todo: ${error.message}`);
    },
  });

  // Handler functions
  const handleCreateTodo = () => {
    if (!newTodoTitle.trim()) {
      Alert.alert(t('common.error'), 'Please enter a todo title');
      return;
    }

    if (!canMutate) {
      Alert.alert(t('network.offline'), 'Cannot create todos while offline');
      return;
    }

    createTodoMutation.mutate({
      userId: 1,
      title: newTodoTitle.trim(),
      completed: false,
    });
  };

  const handleToggleTodo = (todo: Todo) => {
    if (!canMutate) {
      Alert.alert(t('network.offline'), 'Cannot update todos while offline');
      return;
    }

    toggleTodoMutation.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  const handleDeleteTodo = (todo: Todo) => {
    if (!canMutate) {
      Alert.alert(t('network.offline'), 'Cannot delete todos while offline');
      return;
    }

    Alert.alert('Confirm Delete', `Delete "${todo.title}"?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteTodoMutation.mutate(todo.id),
      },
    ]);
  };

  const renderTodoItem: ListRenderItem<Todo> = ({ item }) => (
    <View style={[styles.card, { marginVertical: 4 }]}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => handleToggleTodo(item)}
        disabled={!canMutate}
      >
        <View
          style={[
            styles.checkbox,
            item.completed && styles.checkboxChecked,
            !canMutate && { opacity: 0.5 },
          ]}
        >
          {item.completed && (
            <Text style={[styles.checkboxText, { color: theme.text.primary }]}>
              ✓
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.text,
            item.completed && {
              textDecorationLine: 'line-through',
              opacity: 0.6,
            },
            !canMutate && { opacity: 0.5 },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteButton, !canMutate && { opacity: 0.5 }]}
        onPress={() => handleDeleteTodo(item)}
        disabled={!canMutate}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !todos) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator
          size="large"
          color={theme.button.primary.background}
        />
        <Text style={[styles.text, { marginTop: 16 }]}>Loading todos...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text
          style={[styles.text, { color: theme.status.error, marginBottom: 16 }]}
        >
          Error loading todos: {error?.message}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Network Status Indicator */}
      {isOffline && (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: theme.status.warning },
          ]}
        >
          <Text style={[styles.text, { color: theme.text.primary }]}>
            {t('network.offline')} - Changes will sync when back online
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Todo List with React Query</Text>
        <Text style={styles.subtitle}>
          {todos?.length || 0} todos •{' '}
          {isRefetching ? 'Syncing...' : 'Up to date'}
        </Text>
      </View>

      {/* Add Todo Form */}
      <View style={[styles.card, { marginBottom: 16 }]}>
        <TextInput
          style={[styles.textInput, !canMutate && { opacity: 0.5 }]}
          placeholder="Enter new todo..."
          placeholderTextColor={theme.text.secondary}
          value={newTodoTitle}
          onChangeText={setNewTodoTitle}
          editable={canMutate}
          onSubmitEditing={handleCreateTodo}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { marginTop: 12 },
            (!canMutate || createTodoMutation.isPending) && { opacity: 0.5 },
          ]}
          onPress={handleCreateTodo}
          disabled={!canMutate || createTodoMutation.isPending}
        >
          {createTodoMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.button.primary.text} />
          ) : (
            <Text style={styles.buttonText}>{t('common.add')} Todo</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Todo List */}
      <FlatList
        data={todos?.slice(0, 20)} // Show first 20 for demo
        renderItem={renderTodoItem}
        keyExtractor={item => item.id.toString()}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.text}>No todos yet. Add one above!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Mutation Status */}
      {(updateTodoMutation.isPending || deleteTodoMutation.isPending) && (
        <View
          style={[
            styles.loadingBanner,
            { backgroundColor: theme.background.card },
          ]}
        >
          <ActivityIndicator
            size="small"
            color={theme.button.primary.background}
          />
          <Text style={[styles.text, { marginLeft: 12 }]}>
            {updateTodoMutation.isPending ? 'Updating...' : 'Deleting...'}
          </Text>
        </View>
      )}
    </View>
  );
};
