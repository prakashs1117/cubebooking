import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon, { type IconName } from '@components/icons/Icon';

export type LegalTab = 'privacy' | 'terms';

interface TabConfig {
  key: LegalTab;
  label: string;
  icon: IconName;
}

interface LegalModalTabsProps {
  activeTab: LegalTab;
  onTabChange: (tab: LegalTab) => void;
  tabs: TabConfig[];
  isRTL: boolean;
}

/**
 * LegalModalTabs
 *
 * Reusable tab navigation component for switching between legal documents.
 */
export const LegalModalTabs: React.FC<LegalModalTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
  isRTL,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.tabContainer,
        { backgroundColor: theme.background.secondary },
      ]}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tab,
              isActive && {
                borderBottomColor: theme.text.link,
                borderBottomWidth: 3,
              },
            ]}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={isActive ? theme.text.link : theme.text.tertiary}
            />
            <CustomText
              style={[
                styles.tabText,
                {
                  color: isActive ? theme.text.link : theme.text.tertiary,
                  marginLeft: isRTL ? 0 : 8,
                  marginRight: isRTL ? 8 : 0,
                },
              ]}
            >
              {tab.label}
            </CustomText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
