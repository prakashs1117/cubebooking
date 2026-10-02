import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTheme } from '@/theme';
import DashboardSidebar from '@/components/home/DashboardSidebar';
import SearchBar from '@/components/common/SearchBar';
import HeroStrip from '@/components/home/HeroStrip';
import KPIGrid from '@/components/home/KPIGrid';
import MiniCalendar from '@/components/home/MiniCalendar';
import EngagementChart from '@/components/home/EngagementChart';
import FeedPost from '@/components/home/FeedPost';
import CustomText from '@/components/common/CustomText';
import Avatar from '@/components/common/Avatar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { mockFeedPosts } from './HomeScreen.shared';

export default function HomeScreenTablet() {
  const { theme, isDark } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
      flexDirection: 'row',
    },
    mainContent: {
      flex: 1,
      flexDirection: 'column',
    },
    header: {
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 22,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
      backgroundColor: theme.background.primary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.5,
      color: theme.text.primary,
    },
    headerSearch: {
      flex: 1,
      maxWidth: 340,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    body: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 22,
      overflow: 'scroll',
    },
    contentGrid: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'flex-start',
    },
    feedPanel: {
      flex: 1.55,
    },
    feedTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text.primary,
      marginBottom: 14,
    },
    sideStack: {
      flex: 1,
      gap: 16,
    },
    feedPosts: {
      gap: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background.primary}
      />

      <DashboardSidebar activeItem={activeNav} onItemPress={setActiveNav} />

      <View style={styles.mainContent}>
        <View style={styles.header}>
          <CustomText style={styles.headerTitle}>Dashboard</CustomText>
          <View style={styles.headerSearch}>
            <SearchBar
              placeholder="Search everything…"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.headerRight}>
            <NotificationBell color={theme.text.primary} size={22} />
            <Avatar initials="PK" size="md" />
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <HeroStrip
            greeting="Good morning, Prakash 👋"
            subtitle="3 announcements need your acknowledgment, your AI in Pharma seat is confirmed for 16 June, and the Frontend Guild just earned a Spot Award."
            onCtaPress={() => console.log('Review now')}
          />

          <KPIGrid onKPIPress={id => console.log('KPI pressed:', id)} />

          <View style={styles.contentGrid}>
            <View style={styles.feedPanel}>
              <CustomText style={styles.feedTitle}>Company feed</CustomText>
              <View style={styles.feedPosts}>
                {mockFeedPosts.map(post => (
                  <FeedPost
                    key={post.id}
                    {...post}
                    onLike={() => console.log('Like post', post.id)}
                    onComment={() => console.log('Comment on post', post.id)}
                    onShare={() => console.log('Share post', post.id)}
                    onSave={() => console.log('Save post', post.id)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sideStack}>
              <MiniCalendar month={6} year={2026} />
              <EngagementChart />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
