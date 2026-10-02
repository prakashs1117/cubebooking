/**
 * DashboardScreen
 *
 * Mobile dashboard with KPI cards and recent submissions list
 * Features:
 * - KPI cards showing submission counts by status
 * - Recent submissions list with FlashList
 * - Pull-to-refresh functionality
 * - Role-aware greeting
 * - Navigation to submission details and all submissions
 * - TanStack Query for data fetching and caching
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { submissionService } from '@services/api/demand';
import { useSubmissionStore } from '@stores/submissionStore';
import { useCurrentUser } from '@stores/userStore';
import type { Submission } from '@demand/shared';
import type { RequestsStackScreenProps } from '@navigation/demand';

const { width } = Dimensions.get('window');
const KPI_CARD_WIDTH = (width - 48) / 2; // Account for padding and gap

/**
 * DashboardScreen Component
 * Main dashboard showing KPIs and recent submissions
 */
const DashboardScreen: React.FC<RequestsStackScreenProps<'Dashboard'>> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const currentUser = useCurrentUser();
  const { setRecentSubmissions } = useSubmissionStore();

  // Fetch all submissions
  const {
    data: submissions = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['submissions', 'dashboard'],
    queryFn: async () => {
      const result = await submissionService.getAll();
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnReconnect: true,
  });

  // Update store with recent submissions
  React.useEffect(() => {
    if (submissions.length > 0) {
      const recent = submissions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentSubmissions(recent);
    }
  }, [submissions, setRecentSubmissions]);

  // Calculate KPI metrics
  const kpiData = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(
      s => s.status === 'Draft' || s.status === 'Under Review',
    ).length;
    const approved = submissions.filter(s => s.status === 'Approved').length;
    const rejected = submissions.filter(s => s.status === 'Rejected').length;

    return { total, pending, approved, rejected };
  }, [submissions]);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle submission press - navigate to detail
  const handleSubmissionPress = useCallback(
    (submission: Submission) => {
      navigation.navigate('SubmissionDetail', { id: submission.id });
    },
    [navigation],
  );

  // Handle "View All" button
  const handleViewAll = useCallback(() => {
    navigation.navigate('AllSubmissions');
  }, [navigation]);

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
            Loading dashboard...
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
            Failed to load dashboard
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

  const recentSubmissions = submissions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

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
        {/* Header with Greeting */}
        <View style={styles.headerSection}>
          <Text
            style={[
              styles.greeting,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h2').fontFamily,
              },
            ]}
          >
            {greeting}
          </Text>
          {currentUser && (
            <Text
              style={[
                styles.userName,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              {currentUser.name}
            </Text>
          )}
        </View>

        {/* KPI Cards Grid */}
        <View style={styles.kpiGridSection}>
          <KPICard
            label="Total Requests"
            value={kpiData.total}
            color="#3B82F6"
            theme={theme}
          />
          <KPICard
            label="Pending"
            value={kpiData.pending}
            color="#F59E0B"
            theme={theme}
          />
          <KPICard
            label="Approved"
            value={kpiData.approved}
            color="#10B981"
            theme={theme}
          />
          <KPICard
            label="Rejected"
            value={kpiData.rejected}
            color="#EF4444"
            theme={theme}
          />
        </View>

        {/* Recent Submissions Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text
              style={[
                styles.recentTitle,
                {
                  color: theme.text.primary,
                  fontFamily: getFontStyle('h3').fontFamily,
                },
              ]}
            >
              Recent Submissions
            </Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text
                style={[
                  styles.viewAllButton,
                  {
                    color: theme.button.primary.background,
                    fontFamily: getFontStyle('body').fontFamily,
                  },
                ]}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentSubmissions.length > 0 ? (
            <View style={styles.submissionsList}>
              {recentSubmissions.map(submission => (
                <SubmissionItem
                  key={submission.id}
                  submission={submission}
                  onPress={() => handleSubmissionPress(submission)}
                  theme={theme}
                />
              ))}
            </View>
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
                No submissions yet
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * KPI Card Component
 */
interface KPICardProps {
  label: string;
  value: number;
  color: string;
  theme: any;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, color, theme }) => {
  return (
    <View
      style={[
        styles.kpiCard,
        {
          backgroundColor: theme.background.secondary,
          borderLeftColor: color,
          width: KPI_CARD_WIDTH,
        },
      ]}
    >
      <Text
        style={[
          styles.kpiLabel,
          {
            color: theme.text.secondary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.kpiValue,
          { color: color, fontFamily: getFontStyle('h2').fontFamily },
        ]}
      >
        {value}
      </Text>
    </View>
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
        { backgroundColor: theme.background.tertiary },
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
          numberOfLines={1}
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
          {submission.ref}
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
        <Text style={[{ color: theme.text.secondary }]}>›</Text>
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
    paddingHorizontal: 16,
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

  // Header Section
  headerSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
  },

  // KPI Grid
  kpiGridSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  kpiCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: '700',
  },

  // Recent Submissions
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  submissionsList: {
    gap: 8,
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
    fontSize: 20,
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

export default DashboardScreen;
