# Firebase Analytics Implementation Guide

**Status**: Phase 1 & 2 in progress  
**Last Updated**: 2026-06-01  
**Related**: `/Users/M324550/.claude/plans/can-we-work-on-iterative-key.md`

---

## Quick Reference: How to Log Events

All analytics methods are on the `analytics` object from `@services/analyticsService`:

```typescript
import { analytics } from '@services/analyticsService';

// Search
analytics.logAtlasSearch({
  search_query: 'sodium chloride',
  search_type: 'text',
  result_count: 42,
  result_limit: 20,
  validity_area: 'EU',
  language: 'EN',
  api_response_time_ms: 234,
});

// Favorites
analytics.logFavoriteAdded({
  material_number: 'MAT-12345',
  list_id: 'uuid-1234',
  list_name: 'Emergency Materials',
  list_item_count_before: 5,
  list_item_count_after: 6,
  validity_area: 'EU',
  language: 'EN',
  product_name: 'Sodium Chloride',
});

// Labels
analytics.logLabelGenerated({
  material_number: 'MAT-12345',
  label_count: 3,
  hazard_categories: ['Acute Toxicity', 'Skin Irritant'],
  validity_area: 'EU',
  language: 'EN',
});

// User properties
analytics.setUserProperty('last_login_date', new Date().toISOString());
analytics.setUserProperty('favorite_lists_count', '5');
```

**All events automatically include `platform_os: 'ios' | 'android'` via getCommonParams().**

---

## Pattern 1: Service-level Instrumentation (Atlas Search)

**Where**: `src/services/api/atlasSearch.service.ts`  
**Why**: Single point of instrumentation — all callers benefit

```typescript
import { analytics } from '@services/analyticsService';

export async function searchArticles(
  query: string,
  limit = 20,
  offset = 0,
  context?: { validity_area?: string; language?: string },
): Promise<AtlasSearchResult> {
  const startTime = Date.now();
  
  // API call
  const response = await atlasClient.get<AtlasSearchResult>(SEARCH_PATH, {
    params: { q: query, limit, offset },
  });
  const apiResponseTime = Date.now() - startTime;

  // Process results
  const filtered = (response.data.results ?? []).filter(isValidArticle);

  // Log analytics
  try {
    analytics.logAtlasSearch({
      search_query: query,
      search_type: 'text',
      result_count: filtered.length,
      result_limit: limit,
      validity_area: (context?.validity_area || 'EU') as 'EU' | 'US' | 'CN',
      language: (context?.language || 'EN') as 'EN' | 'FR' | 'AR' | 'ZH',
      api_response_time_ms: apiResponseTime,
    });
  } catch (analyticsError) {
    console.warn('Failed to log search analytics:', analyticsError);
    // Never block the app on analytics failure
  }

  return { hits: ..., results: filtered };
}
```

---

## Pattern 2: Component-level Instrumentation (AddToFavoritesSheet)

**Where**: `src/components/favorites/AddToFavoritesSheet.tsx`  
**Why**: UI component directly calls API — instrument where mutation happens

```typescript
import { analytics } from '@services/analyticsService';

const handlePickList = useCallback(
  async (list: FavoriteList) => {
    if (savedListIds.has(list.id) || saving) return;
    setSaving(true);
    
    try {
      const countBefore = savedListIds.size;
      
      if (isLoggedIn) {
        await favoritesApiService.addArticleToList(
          Number(list.id),
          toRemoteArticle(article),
        );
      } else {
        await addArticleToList(list.id, article);
      }
      
      // Log analytics after successful addition
      analytics.logFavoriteAdded({
        material_number: article.materialNumber,
        list_id: String(list.id),
        list_name: list.name,
        list_item_count_before: countBefore,
        list_item_count_after: countBefore + 1,
        validity_area: 'EU', // get from settings/context as needed
        language: 'EN',
        product_name: article.articleName,
      });
      
      setSaving(false);
      onSaved();
      onClose();
    } catch (error) {
      setSaving(false);
      console.error('Failed to add favorite:', error);
    }
  },
  [savedListIds, saving, article, isLoggedIn, onSaved, onClose],
);
```

---

## Pattern 3: Screen-level Instrumentation (BarcodeScreen)

**Where**: `src/screens/BarcodeScreen.tsx`  
**Why**: Barcode scan result is handled by the screen component

```typescript
import { analytics } from '@services/analyticsService';

const handleBarcodeScanned = useCallback(
  async (barcode: string) => {
    const scanStartTime = Date.now();
    const scanTime = Date.now() - scanStartTime;
    
    try {
      const result = await atlasSearch.searchArticles(barcode);
      
      analytics.logBarcodeScanned({
        barcode_value: barcode,
        barcode_format: 'ean128',
        scan_result: result.results.length > 0 ? 'success' : 'not_found',
        material_number: result.results[0]?.materialNumber,
        validity_area: 'EU',
        scan_time_ms: scanTime,
      });
      
      // Navigate to results
    } catch (error) {
      analytics.logBarcodeScanned({
        barcode_value: barcode,
        barcode_format: 'ean128',
        scan_result: 'invalid',
        validity_area: 'EU',
        scan_time_ms: scanTime,
      });
    }
  },
  [],
);
```

---

## Pattern 4: Hook-based Instrumentation (useSDSTracking)

**File**: `src/hooks/useSDSTracking.ts` (NEW)  
**Purpose**: Track scroll depth, sections viewed, time spent on SDS

```typescript
import { useEffect, useRef } from 'react';
import { analytics } from '@services/analyticsService';

interface UseSDSTrackingProps {
  materialNumber: string;
  productName?: string;
  validity_area: 'EU' | 'US' | 'CN';
  language: 'EN' | 'FR' | 'AR' | 'ZH';
}

export function useSDSTracking({
  materialNumber,
  productName,
  validity_area,
  language,
}: UseSDSTrackingProps) {
  const mountTimeRef = useRef(Date.now());
  const maxScrollPercentRef = useRef(0);
  const sectionsViewedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // On mount: log SDS viewed
    analytics.logSDSViewed({
      material_number: materialNumber,
      product_name: productName,
      validity_area,
      language,
    });

    // On unmount: log with accumulated metrics
    return () => {
      const timeOnSds = Math.floor((Date.now() - mountTimeRef.current) / 1000);
      analytics.logSDSViewed({
        material_number: materialNumber,
        product_name: productName,
        validity_area,
        language,
        scroll_depth_percent: maxScrollPercentRef.current,
        time_on_sds_seconds: timeOnSds,
        sections_viewed: Array.from(sectionsViewedRef.current),
      });
    };
  }, [materialNumber, productName, validity_area, language]);

  const handleScroll = (contentOffsetY: number, contentHeight: number, scrollViewHeight: number) => {
    const percentage = Math.floor((contentOffsetY / (contentHeight - scrollViewHeight)) * 100);
    maxScrollPercentRef.current = Math.max(maxScrollPercentRef.current, percentage);
  };

  const handleSectionViewed = (sectionNumber: string) => {
    sectionsViewedRef.current.add(sectionNumber);
  };

  return { handleScroll, handleSectionViewed };
}
```

**Usage in SDSDetailScreen**:

```typescript
const { handleScroll, handleSectionViewed } = useSDSTracking({
  materialNumber: sds.materialNumber,
  productName: sds.productName,
  validity_area: 'EU',
  language: 'EN',
});

// On FlatList scroll
onScroll={(event) => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  handleScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
}}

// On section tap
onSectionPress={(num) => {
  handleSectionViewed(String(num));
}}
```

---

## Privacy Checklist

✅ **Always safe to log**:
- Material numbers (MAT-12345)
- Product names (Sodium Chloride, Acetone)
- Regions (EU, US, CN)
- Languages (EN, FR, AR, ZH)
- Favorite list names (user-created categories)
- Search queries (product searches)
- Counts, durations, timestamps, performance metrics

❌ **NEVER log**:
- User IDs (even hashed)
- Email addresses
- Phone numbers
- User names or company names
- User locations
- Device IDs or model specifics
- Authentication tokens or passwords

---

## Testing

### 1. Enable Feature Flag
In `src/data/featureFlagNew.json`, ensure `analytics_tracking` is enabled for your environment.

### 2. Firebase Real-time Dashboard
After logging events, check Firebase Console → Analytics → Realtime:
- Events should appear within seconds
- Check that all params are present and correct
- Verify no sensitive data in params

### 3. Code Review Checklist
```bash
# No user IDs
grep -r "user_id" src/

# No emails
grep -r "@.*\|email" src/services/analyticsService.ts

# No phone
grep -r "phone" src/services/analyticsService.ts

# All custom events have platform_os
grep -r "analytics.log" src/ | grep -v "platform_os"
```

### 4. Manual Testing Scenario
1. Sign in → verify `login` event + user properties in Firebase
2. Search → verify `atlas_search` event with query, result_count
3. Add to favorites → verify `favorite_added` event with list_name
4. Create list → verify `favorites_list_created` + user properties updated
5. Generate label → verify `label_generated` with hazard_categories
6. Disable `analytics_tracking` flag → verify no events fire

---

## Future Work

- Add BigQuery export for custom dashboards
- Create GA4 calculated metrics (Favorites/Users ratio, search success rate)
- Implement retention cohort analysis using registration_date property
- Build Looker Studio dashboard for business metrics
