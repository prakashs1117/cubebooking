import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AppModal, { type ModalConfig } from '@components/modals/AppModal';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import CustomText from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { getFontStyle } from '@utils/fonts';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import type { ThemeColors } from '@theme/colors';
import { SearchStackParamList } from '@/types/navigation';
import { addToArticleHistory } from '@services/articleHistoryService';
import {
  getFavoriteLists,
  getListArticles,
} from '@services/favoritesListService';
import type { Article } from '@components/search/ArticleCard';
import AddToFavoritesSheet from '@components/favorites/AddToFavoritesSheet';
import { useSearchOverlay } from '@context/SearchOverlayContext';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { getArticleDetailByMaterialNumber } from '@services/api/articleDetail.service';

type ArticleDetailRouteProp = RouteProp<SearchStackParamList, 'ArticleDetail'>;
type ArticleDetailNavProp = StackNavigationProp<
  SearchStackParamList,
  'ArticleDetail'
>;

const AMBER = '#F5C518';
const CHEMISPHERE_URL = 'https://app.chemisphere.io/scanner';

// ─── Favourite status card ────────────────────────────────────────────────────

interface FavouriteStatusCardProps {
  savedListNames: string[];
  onPress: () => void;
  theme: ThemeColors;
  isDark: boolean;
}

const FavouriteStatusCard: React.FC<FavouriteStatusCardProps> = ({
  savedListNames,
  onPress,
  theme,
  isDark,
}) => {
  const { t } = useTranslation();
  const isSaved = savedListNames.length > 0;
  const bodyFont = getFontStyle('body').fontFamily;
  const captionFont = getFontStyle('caption').fontFamily;

  const label = !isSaved
    ? t('favorites.saveToFavorites')
    : savedListNames.length === 1
    ? t('favorites.savedInOne', { name: savedListNames[0] })
    : t('favorites.savedInMultiple', { count: savedListNames.length });

  if (isSaved) {
    return (
      <TouchableOpacity
        style={[
          favStyles.favCardSaved,
          { backgroundColor: theme.background.card },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={favStyles.favCardStrip} />
        <View style={favStyles.favCardInner}>
          <View
            style={[
              favStyles.favCardIconWrap,
              { backgroundColor: theme.background.secondary },
            ]}
          >
            <Icon name="star-circle" size={20} color={AMBER} />
          </View>
          <CustomText
            style={[
              favStyles.favCardLabelSaved,
              {
                fontFamily: bodyFont,
                color: isDark ? BaseColors.white : BaseColors.merckPurple,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </CustomText>
          <Icon
            name="chevron-right"
            size={15}
            color={isDark ? BaseColors.white : BaseColors.merckPurple}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        favStyles.favCardUnsaved,
        {
          backgroundColor: theme.background.card,
          borderColor: theme.border.secondary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={favStyles.favCardInner}>
        <View
          style={[
            favStyles.favCardIconWrapFaded,
            { backgroundColor: theme.background.secondary },
          ]}
        >
          <Icon name="star-circle" size={20} color={theme.text.secondary} />
        </View>
        <CustomText
          style={[
            favStyles.favCardLabelUnsaved,
            { fontFamily: captionFont, color: theme.text.secondary },
          ]}
          numberOfLines={1}
        >
          {label}
        </CustomText>
        <Icon name="chevron-right" size={15} color={theme.border.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const favStyles = StyleSheet.create({
  favCardUnsaved: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  favCardSaved: {
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: BaseColors.merckPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  favCardStrip: {
    width: 4,
    backgroundColor: BaseColors.merckPurple,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  favCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  favCardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favCardIconWrapFaded: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favCardLabelSaved: { flex: 1, fontSize: 14, fontWeight: '600' },
  favCardLabelUnsaved: { flex: 1, fontSize: 13 },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

interface IdentifierRowProps {
  label: string;
  value: string;
  bodyFont: string;
  captionFont: string;
  isLast?: boolean;
  theme: ThemeColors;
}

const IdentifierRow: React.FC<IdentifierRowProps> = ({
  label,
  value,
  bodyFont,
  captionFont,
  isLast,
  theme,
}) => (
  <View
    style={[
      subStyles.identifierRow,
      !isLast && {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border.secondary,
      },
    ]}
  >
    <CustomText
      style={[
        subStyles.identifierLabel,
        { fontFamily: captionFont, color: theme.text.secondary },
      ]}
    >
      {label}
    </CustomText>
    <CustomText
      style={[
        subStyles.identifierValue,
        { fontFamily: bodyFont, color: theme.text.primary },
      ]}
      selectable
    >
      {value}
    </CustomText>
  </View>
);

interface QuickLinkButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  bodyFont: string;
  isExternal?: boolean;
  theme: ThemeColors;
  isDark: boolean;
}

const QuickLinkButton: React.FC<QuickLinkButtonProps> = ({
  icon,
  label,
  onPress,
  bodyFont,
  isExternal,
  theme,
  isDark,
}) => (
  <TouchableOpacity
    style={[subStyles.quickLink, { borderTopColor: theme.border.secondary }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View
      style={[
        subStyles.quickLinkIcon,
        { backgroundColor: theme.background.secondary },
      ]}
    >
      <Icon
        name={icon as any}
        size={20}
        color={isDark ? BaseColors.white : BaseColors.merckPurple}
      />
    </View>
    <CustomText
      style={[
        subStyles.quickLinkLabel,
        { fontFamily: bodyFont, color: theme.text.primary },
      ]}
      numberOfLines={1}
    >
      {label}
    </CustomText>
    <Icon
      name={isExternal ? 'globe-outline' : 'chevron-right'}
      size={16}
      color={theme.text.tertiary}
    />
  </TouchableOpacity>
);

const subStyles = StyleSheet.create({
  identifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  identifierLabel: { width: 110, fontSize: 13, flexShrink: 0 },
  identifierValue: { flex: 1, fontSize: 14, fontWeight: '500' },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickLinkLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const ArticleDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<ArticleDetailNavProp>();
  const route = useRoute<ArticleDetailRouteProp>();
  const { article: initialArticle } = route.params;
  const [article, setArticle] = useState(initialArticle);
  const { isGuest, user } = useAuth();
  const isLoggedIn = !isGuest && !!user;
  const { data: remoteLists = [], refetch: refetchFavoriteLists } =
    useFavoriteLists(isLoggedIn);
  const cameFromOverlay = (route.params as any)?.cameFromOverlay ?? false;
  const { openSearch } = useSearchOverlay();

  useEffect(() => {
    if (!cameFromOverlay) return;
    return () => {
      setTimeout(() => openSearch(), 50);
    };
  }, [cameFromOverlay, openSearch]);

  // Enrich article data if missing critical fields
  useEffect(() => {
    const enrichArticleData = async () => {
      const isMissingData =
        !article.casNumber ||
        !article.articleNumber ||
        article.casNumber === '' ||
        article.articleNumber === '';

      if (isMissingData) {
        const fullArticle = await getArticleDetailByMaterialNumber(
          article.materialNumber,
        );
        if (fullArticle) {
          setArticle(prev => ({
            ...prev,
            casNumber: fullArticle.casNumber || prev.casNumber,
            articleNumber: fullArticle.articleNumber || prev.articleNumber,
            substance: fullArticle.substance || prev.substance,
            brand: fullArticle.system || prev.brand,
          }));
        }
      }
    };

    enrichArticleData();
  }, [article.materialNumber]);

  useEffect(() => {
    addToArticleHistory({
      materialNumber: article.materialNumber,
      articleName: article.articleName,
      substance: article.substance,
      casNumber: article.casNumber,
      articleNumber: article.articleNumber,
      brand: article.brand,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.materialNumber]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [savedListNames, setSavedListNames] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const checkFavouriteState = useCallback(async () => {
    if (isLoggedIn) {
      const names = remoteLists
        .filter(r =>
          r.articles?.some(a => a.materialNumber === article.materialNumber),
        )
        .map(r => r.name);
      setSavedListNames(names);
    } else {
      const lists = await getFavoriteLists();
      const names: string[] = [];
      await Promise.all(
        lists.map(async list => {
          const articles = await getListArticles(list.id);
          if (articles.some(a => a.materialNumber === article.materialNumber)) {
            names.push(list.name);
          }
        }),
      );
      setSavedListNames(names);
    }
  }, [isLoggedIn, remoteLists, article.materialNumber]);

  useEffect(() => {
    checkFavouriteState();
  }, [checkFavouriteState]);

  const bodyStyle = getFontStyle('body');
  const captionStyle = getFontStyle('caption');
  const h3Style = getFontStyle('h3');

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSafetyLabel = useCallback(
    () => navigation.navigate('SafetyLabel', { article }),
    [article, navigation],
  );

  const handleDocumentLinks = useCallback(() => {
    setModal({
      variant: 'info',
      title: t('article.documentLinks'),
      message: t('article.comingSoon'),
    });
  }, [t]);

  const handleChemiSphere = useCallback(async () => {
    const supported = await Linking.canOpenURL(CHEMISPHERE_URL);
    if (supported) {
      Linking.openURL(CHEMISPHERE_URL);
    } else {
      setModal({
        variant: 'error',
        title: t('article.openError'),
        message: CHEMISPHERE_URL,
      });
    }
  }, [t]);

  const handleFavorite = useCallback(() => setSheetOpen(true), []);

  const showSubstance =
    article.substance && article.substance !== article.articleName;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <CustomHeader
        title={t('article.title')}
        showBack
        onBackPress={handleBack}
        showHamburger={false}
        hideSearch
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product name hero card */}
        <View
          style={[styles.heroCard, { backgroundColor: theme.background.card }]}
        >
          <View style={styles.heroStrip} />
          <View style={styles.heroBody}>
            <CustomText
              style={[
                styles.articleName,
                { fontFamily: h3Style.fontFamily, color: theme.text.primary },
              ]}
            >
              {article.articleName}
            </CustomText>
            <CustomText
              style={[
                styles.materialBadge,
                {
                  fontFamily: captionStyle.fontFamily,
                  backgroundColor: theme.background.secondary,
                  color: isDark ? BaseColors.white : BaseColors.merckPurple,
                },
              ]}
            >
              {article.materialNumber}
            </CustomText>
          </View>
        </View>

        {/* Favourite status card */}
        <FavouriteStatusCard
          savedListNames={savedListNames}
          onPress={handleFavorite}
          theme={theme}
          isDark={isDark}
        />

        {/* Identifiers section */}
        <View
          style={[styles.section, { backgroundColor: theme.background.card }]}
        >
          <CustomText
            style={[
              styles.sectionTitle,
              { fontFamily: bodyStyle.fontFamily, color: theme.text.secondary },
            ]}
          >
            {t('article.productDetails')}
          </CustomText>

          {article.casNumber ? (
            <IdentifierRow
              label={t('article.casNumber')}
              value={article.casNumber}
              bodyFont={bodyStyle.fontFamily}
              captionFont={captionStyle.fontFamily}
              theme={theme}
            />
          ) : null}

          {article.articleNumber ? (
            <IdentifierRow
              label={t('article.articleNumber')}
              value={article.articleNumber}
              bodyFont={bodyStyle.fontFamily}
              captionFont={captionStyle.fontFamily}
              theme={theme}
            />
          ) : null}

          {showSubstance ? (
            <IdentifierRow
              label={t('article.substance')}
              value={article.substance!}
              bodyFont={bodyStyle.fontFamily}
              captionFont={captionStyle.fontFamily}
              theme={theme}
            />
          ) : null}

          {article.brand ? (
            <IdentifierRow
              label={t('article.brand')}
              value={article.brand}
              bodyFont={bodyStyle.fontFamily}
              captionFont={captionStyle.fontFamily}
              isLast
              theme={theme}
            />
          ) : null}
        </View>

        {/* Quick Links section */}
        <View
          style={[styles.section, { backgroundColor: theme.background.card }]}
        >
          <CustomText
            style={[
              styles.sectionTitle,
              { fontFamily: bodyStyle.fontFamily, color: theme.text.secondary },
            ]}
          >
            {t('article.quickLinks')}
          </CustomText>

          <QuickLinkButton
            icon="shield-check"
            label={t('article.safetyLabel')}
            onPress={handleSafetyLabel}
            bodyFont={bodyStyle.fontFamily}
            theme={theme}
            isDark={isDark}
          />

          <QuickLinkButton
            icon="document"
            label={t('article.documentLinks')}
            onPress={handleDocumentLinks}
            bodyFont={bodyStyle.fontFamily}
            theme={theme}
            isDark={isDark}
          />

          <QuickLinkButton
            icon="globe"
            label={t('article.verifyChemiSphere')}
            onPress={handleChemiSphere}
            bodyFont={bodyStyle.fontFamily}
            isExternal
            theme={theme}
            isDark={isDark}
          />
        </View>
      </ScrollView>

      <AddToFavoritesSheet
        visible={sheetOpen}
        article={article as Article}
        onClose={() => setSheetOpen(false)}
        onSaved={() => {
          if (isLoggedIn) {
            refetchFavoriteLists();
          } else {
            checkFavouriteState();
          }
        }}
        isLoggedIn={isLoggedIn}
        remoteLists={remoteLists}
      />
      <AppModal config={modal} onClose={() => setModal(null)} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  heroStrip: { width: 6, backgroundColor: BaseColors.merckPurple },
  heroBody: { flex: 1, paddingHorizontal: 16, paddingVertical: 18 },
  articleName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 2,
  },
  materialBadge: {
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },

  section: {
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
});

export default ArticleDetailScreen;
