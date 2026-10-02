/**
 * AllSubmissionsScreen
 *
 * View all submissions with filtering and search capabilities
 * Watcher/Admin/Approver/Super Admin role access
 * Features:
 * - Full list of submissions with TanStack Query
 * - Filter by status and priority
 * - Search by title/reference
 * - Pull-to-refresh
 * - Navigation to submission details
 * - Pagination support
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { submissionService } from '@services/api/demand';
import {
  useSubmissionStore,
  useFilteredSubmissions,
} from '@stores/submissionStore';
import type { Submission, Status, Priority } from '@demand/shared';
import type { RequestsStackScreenProps } from '@navigation/demand';

type FilterValue = Status | Priority | 'All';

/**
 * AllSubmissionsScreen Component
 * Full list of all submissions with filtering and search
 */
const AllSubmissionsScreen: React.FC<
  RequestsStackScreenProps<'AllSubmissions'>
> = ({ navigation }) => {
  const { theme } = useTheme();
  const { setSubmissions, setFilters } = useSubmissionStore();
  useFilteredSubmissions();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('All');
  const [priorityFilter, setPriorityFilter] = useState<FilterValue>('All');

  // Fetch all submissions
  const {
    data: submissions = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['submissions', 'all'],
    queryFn: async () => {
      const result = await submissionService.getAll();
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnReconnect: true,
  });

  // Update store when data changes
  React.useEffect(() => {
    setSubmissions(submissions);
  }, [submissions, setSubmissions]);

  // Apply filters when they change
  React.useEffect(() => {
    const newFilters: any = {};
    if (statusFilter !== 'All') newFilters.status = statusFilter;
    if (priorityFilter !== 'All') newFilters.priority = priorityFilter;
    if (searchText.trim()) newFilters.search = searchText.trim();

    setFilters(newFilters);
  }, [statusFilter, priorityFilter, searchText, setFilters]);

  // Local filtering based on selected filters
  const displaySubmissions = useMemo(() => {
    return submissions.filter(submission => {
      if (statusFilter !== 'All' && submission.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'All' && submission.priority !== priorityFilter) {
        return false;
      }
      if (searchText.trim()) {
        const search = searchText.toLowerCase();
        return (
          submission.title?.toLowerCase().includes(search) ||
          submission.ref?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [submissions, statusFilter, priorityFilter, searchText]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle submission press
  const handleSubmissionPress = useCallback(
    (submission: Submission) => {
      navigation.navigate('SubmissionDetail', { id: submission.id });
    },
    [navigation],
  );

  // Status filter options
  const statusOptions: FilterValue[] = [
    'All',
    'Draft',
    'Under Review',
    'Awaiting Input',
    'Approved',
    'Rejected',
  ];

  // Priority filter options
  const priorityOptions: FilterValue[] = [
    'All',
    'Low',
    'Medium',
    'High',
    'Critical',
  ];

  // Loading state
  if (isLoading && submissions.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.button.primary.background}
          />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            Loading submissions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && submissions.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.errorText,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h4').fontFamily,
              },
            ]}
          >
            Failed to load submissions
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.button.primary.background },
            ]}
            onPress={handleRefresh}
          >
            <Text
              style={[
                styles.retryButtonText,
                {
                  color: theme.button.primary.text,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={theme.button.primary.background}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                borderColor: theme.text.tertiary,
              },
            ]}
            placeholder="Search by title or reference"
            placeholderTextColor={theme.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text
            style={[
              styles.filterLabel,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            Status
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
          >
            {statusOptions.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === status
                        ? theme.button.primary.background
                        : theme.background.secondary,
                    borderColor:
                      statusFilter === status
                        ? theme.button.primary.background
                        : theme.text.tertiary,
                  },
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        statusFilter === status
                          ? theme.button.primary.text
                          : theme.text.primary,
                      fontFamily: getFontStyle('caption').fontFamily,
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Priority Filter */}
        <View style={styles.filterSection}>
          <Text
            style={[
              styles.filterLabel,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            Priority
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChips}
          >
            {priorityOptions.map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      priorityFilter === priority
                        ? theme.button.primary.background
                        : theme.background.secondary,
                    borderColor:
                      priorityFilter === priority
                        ? theme.button.primary.background
                        : theme.text.tertiary,
                  },
                ]}
                onPress={() => setPriorityFilter(priority)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        priorityFilter === priority
                          ? theme.button.primary.text
                          : theme.text.primary,
                      fontFamily: getFontStyle('caption').fontFamily,
                    },
                  ]}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.countSection}>
          <Text
            style={[
              styles.countText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            {displaySubmissions.length} result
            {displaySubmissions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Submissions List */}
        <View style={styles.listSection}>
          {displaySubmissions.length > 0 ? (
            displaySubmissions.map(submission => (
              <SubmissionItem
                key={submission.id}
                submission={submission}
                onPress={() => handleSubmissionPress(submission)}
                theme={theme}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.text.secondary,
                    fontFamily: getFontStyle('body').fontFamily,
                  },
                ]}
              >
                No submissions found
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Submission Item Component
 */
interface SubmissionItemProps {
  submission: Submission;
  onPress: () => void;
  theme: any;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  submission,
  onPress,
  theme,
}) => {
  const getStatusColor = useCallback(
    (status: string) => {
      switch (status) {
        case 'Draft':
        case 'Under Review':
          return '#F59E0B';
        case 'Approved':
          return '#10B981';
        case 'Rejected':
          return '#EF4444';
        case 'Awaiting Input':
          return '#8B5CF6';
        default:
          return theme.text.secondary;
      }
    },
    [theme],
  );

  const getPriorityColor = useCallback(
    (priority: string) => {
      switch (priority) {
        case 'Critical':
          return '#DC2626';
        case 'High':
          return '#EA580C';
        case 'Medium':
          return '#F59E0B';
        case 'Low':
          return '#3B82F6';
        default:
          return theme.text.secondary;
      }
    },
    [theme],
  );

  const statusColor = getStatusColor(submission.status);
  const priorityColor = getPriorityColor(submission.priority);

  return (
    <TouchableOpacity
      style={[
        styles.submissionItem,
        { backgroundColor: theme.background.secondary },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.submissionContent}>
        <Text
          style={[
            styles.submissionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
          numberOfLines={2}
        >
          {submission.title || 'Untitled'}
        </Text>
        <Text
          style={[
            styles.submissionRef,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
          numberOfLines={1}
        >
          {submission.ref} • {submission.department}
        </Text>
        <View style={styles.submissionMeta}>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${statusColor}20`, borderColor: statusColor },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: statusColor,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {submission.status}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${priorityColor}20`,
                borderColor: priorityColor,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: priorityColor,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {submission.priority}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.submissionArrow}>
        <Text style={[{ color: theme.text.secondary, fontSize: 20 }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Count Section
  countSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 12,
  },

  // List Section
  listSection: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  submissionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submissionContent: {
    flex: 1,
  },
  submissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  submissionRef: {
    fontSize: 12,
    marginBottom: 8,
  },
  submissionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  submissionArrow: {
    marginLeft: 8,
  },

  // Empty State
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },

  // Bottom Padding
  bottomPadding: {
    height: 32,
  },
});

export default AllSubmissionsScreen;
