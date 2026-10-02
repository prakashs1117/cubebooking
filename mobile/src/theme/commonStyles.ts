import { StyleSheet } from 'react-native';
import { ThemeColors } from './colors';

/**
 * Common styles that can be reused across the application
 * These styles are theme-aware and should be used with the theme colors
 */

export const createCommonStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },

    safeContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },

    scrollContainer: {
      flex: 1,
      backgroundColor: theme.background.secondary,
    },

    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },

    // Card styles
    card: {
      backgroundColor: theme.background.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },

    cardHeader: {
      backgroundColor: theme.background.card,
      borderRadius: 15,
      padding: 30,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },

    // Section styles
    section: {
      backgroundColor: theme.background.card,
      padding: 20,
      marginBottom: 15,
      borderRadius: 12,
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border.secondary,
    },

    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },

    // List item styles
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
      backgroundColor: theme.background.card,
    },

    listItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    listItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    lastListItem: {
      borderBottomWidth: 0,
    },

    // Button styles
    primaryButton: {
      backgroundColor: theme.button.primary.background,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.button.primary.border,
    },

    secondaryButton: {
      backgroundColor: theme.button.secondary.background,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.button.secondary.border,
    },

    outlineButton: {
      backgroundColor: theme.button.outline.background,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.button.outline.border,
    },

    successButton: {
      backgroundColor: theme.button.success.background,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.button.success.border,
    },

    errorButton: {
      backgroundColor: theme.button.error.background,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.button.error.border,
    },

    // Language selector styles
    languageButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      gap: 10,
    },

    languageButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      backgroundColor: theme.background.tertiary,
      borderWidth: 1,
      borderColor: theme.border.primary,
      minWidth: 90,
      alignItems: 'center',
    },

    activeLanguageButton: {
      backgroundColor: theme.button.primary.background,
      borderColor: theme.button.primary.border,
    },

    // Form styles
    inputContainer: {
      marginBottom: 16,
    },

    input: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text.primary,
    },

    inputFocused: {
      borderColor: theme.border.focus,
    },

    inputError: {
      borderColor: theme.border.error,
    },

    // Icon styles
    iconContainer: {
      marginRight: 15,
    },

    rtlIconContainer: {
      marginRight: 0,
      marginLeft: 15,
    },

    // Avatar styles
    avatarContainer: {
      position: 'relative',
      marginBottom: 20,
    },

    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: theme.border.focus,
    },

    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.button.primary.background,
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.background.card,
    },

    // Stats styles
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },

    statItem: {
      alignItems: 'center',
    },

    // Navigation styles
    navItems: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },

    navItem: {
      alignItems: 'center',
      padding: 10,
    },

    // Icon showcase styles
    iconShowcase: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginTop: 15,
      gap: 15,
    },

    iconDemoItem: {
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.background.tertiary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border.secondary,
      minWidth: 70,
    },

    iconLabel: {
      marginTop: 8,
      fontSize: 12,
      color: theme.text.secondary,
      textAlign: 'center' as const,
    },

    // Font showcase styles
    fontShowcase: {
      marginTop: 20,
    },

    fontDemoItem: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.secondary,
    },

    // RTL support
    rtlContainer: {
      // RTL specific styles can be added here
    },

    rtlText: {
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
    },

    // Spacing utilities
    marginTop: {
      marginTop: 16,
    },

    marginBottom: {
      marginBottom: 16,
    },

    marginHorizontal: {
      marginHorizontal: 16,
    },

    marginVertical: {
      marginVertical: 16,
    },

    paddingTop: {
      paddingTop: 16,
    },

    paddingBottom: {
      paddingBottom: 16,
    },

    paddingHorizontal: {
      paddingHorizontal: 16,
    },

    paddingVertical: {
      paddingVertical: 16,
    },

    // Flex utilities
    flex1: {
      flex: 1,
    },

    flexRow: {
      flexDirection: 'row' as const,
    },

    flexColumn: {
      flexDirection: 'column' as const,
    },

    alignCenter: {
      alignItems: 'center' as const,
    },

    justifyCenter: {
      justifyContent: 'center' as const,
    },

    justifySpaceBetween: {
      justifyContent: 'space-between' as const,
    },

    justifySpaceAround: {
      justifyContent: 'space-around' as const,
    },

    // Shadow utilities
    shadowLight: {
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },

    shadowMedium: {
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },

    shadowHeavy: {
      shadowColor: theme.text.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 8,
    },

    // Text styles
    text: {
      fontSize: 16,
      color: theme.text.primary,
      lineHeight: 24,
    },

    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: theme.text.primary,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: theme.text.primary,
      marginBottom: 12,
      marginTop: 8,
    },

    description: {
      fontSize: 16,
      color: theme.text.secondary,
      lineHeight: 22,
      marginBottom: 16,
      textAlign: 'left' as const,
    },

    // Layout utilities
    centered: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },

    header: {
      marginBottom: 20,
      paddingHorizontal: 16,
    },

    // Button text styles
    buttonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.button.primary.text,
    },

    // Form styles
    textInput: {
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: theme.border.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text.primary,
    },

    // Todo-specific styles
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.border.primary,
      marginRight: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },

    checkboxChecked: {
      backgroundColor: theme.button.primary.background,
      borderColor: theme.button.primary.background,
    },

    checkboxText: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: theme.button.primary.text,
    },

    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },

    deleteButtonText: {
      fontSize: 18,
    },

    // Status banners
    warningBanner: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center' as const,
      marginBottom: 16,
    },

    loadingBanner: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderTopWidth: 1,
      borderTopColor: theme.border.secondary,
    },
  });
