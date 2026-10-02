# Ionic → React Native Settings Migration Mapping

This document maps each Ionic settings feature to its React Native implementation.

---

## 1. Component Structure Comparison

### Ionic Settings Layout (settings.html + settings.ts)

```html
<ion-content>
  <!-- Desktop: Tabs Navigation -->
  <ion-tabs>
    <ion-tab-bar slot="top">
      <ion-tab-button tab="articledetail">Article Details</ion-tab-button>
      <ion-tab-button tab="settingslanguage">Language Settings</ion-tab-button>
      <ion-tab-button tab="userdata">User Data</ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>

  <!-- Mobile: Accordion Sections -->
  <div class="card-style">
    <div class="settings-header" (click)="toggleArticleClick()">
      ARTICLE DETAILS
      <ion-icon [src]="toggledArticle ? upArrow : downArrow"></ion-icon>
    </div>
    <ion-card *ngIf="toggledArticle">
      <!-- Content here -->
    </ion-card>
  </div>
</ion-content>
```

### React Native Implementation

```typescript
<ScrollView>
  {/* Profile Header */}
  <ProfileHeader user={user} />

  {/* Settings Sections - Accordion Style */}
  <SettingsSection title="Home Settings">
    <SettingsSectionToggle icon="barcode" label="Barcode Scanner" />
  </SettingsSection>

  <SettingsSection title="Article Details">
    <SettingsSectionToggle icon="document" label="Safety Data Sheet" />
    <SettingsSectionToggle icon="health" label="EHS Information" />
    <SettingsSectionToggle icon="truck" label="Transport Information" />
  </SettingsSection>

  {/* More sections... */}
</ScrollView>
```

---

## 2. Feature-by-Feature Mapping

### 2.1 Barcode Scanner Toggle

#### Ionic

```html
<!-- settings.html -->
<ion-item>
  <ion-label>SETTINGS_BARCODE_SCANNER</ion-label>
  <ion-toggle
    [(ngModel)]="settings.home.barcodeScanner"
    (ngModelChange)="updateSettings()"
  ></ion-toggle>
</ion-item>
```

```typescript
// settings.ts
async updateSettings() {
  try {
    await this.settingsService.updateSettings(this.settings);
    const toggleVar = this.settings.home.barcodeScanner;
    this.sdsService.showScanner$.next(toggleVar ? "" : "1");
    localStorage.setItem("showScan", toggleVar ? "" : "1");
  } catch (err) {
    this.dialogService.notify("ERROR_MESSAGE_APP");
  }
}
```

#### React Native

```typescript
// src/screens/SettingsScreen.tsx
const { settings, updateSetting } = useSettings();

const handleBarcodeToggle = async (value: boolean) => {
  try {
    await updateSetting('home', { ...settings.home, barcodeScanner: value });
    showSuccess({
      title: 'Updated',
      message: 'Barcode scanner setting updated',
    });
  } catch (error) {
    showError({ title: 'Error', message: 'Failed to update setting' });
  }
};

<SettingsSectionToggle
  icon="qrcode"
  label={t('settings.barcodeScanner')}
  enabled={settings?.home.barcodeScanner}
  onToggle={handleBarcodeToggle}
/>;
```

---

### 2.2 SDS Sections Toggles (16 Sections)

#### Ionic

```html
<!-- settings.html -->
<div *ngFor="let sectionNo of sectionsCount">
  <ion-item>
    <ion-label
      >{{sectionNo}}. {{'SDS_CATEGORY_TITLE_' + sectionNo |
      translate}}</ion-label
    >
    <ion-toggle
      [(ngModel)]="settings.sections[sectionNo-1]"
      (ngModelChange)="updateSettings()"
    ></ion-toggle>
  </ion-item>
  <hr *ngIf="sectionNo != 15" />
</div>
```

```typescript
// settings.ts
sectionsCount = Array.from(Array(16)).map((x, i) => i + 1);
```

#### React Native

```typescript
// src/components/settings/SectionsList.tsx
interface SectionsListProps {
  sections: boolean[];
  onUpdate: (index: number, value: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  onUpdate,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View>
      {sections.map((enabled, index) => (
        <React.Fragment key={`section-${index}`}>
          <View style={styles.sectionItem}>
            <BodyText color={theme.text.primary}>
              {index + 1}. {t(`sds.section.${index + 1}`)}
            </BodyText>
            <Switch
              value={enabled}
              onValueChange={value => onUpdate(index, value)}
              disabled={isLoading}
              trackColor={{
                false: theme.border.primary,
                true: theme.text.link,
              }}
              thumbColor={theme.background.card}
            />
          </View>
          {index < sections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </View>
  );
};
```

---

### 2.3 Country & Language Selectors

#### Ionic

```html
<!-- settings.html -->
<ion-item>
  <ion-label>SETTINGS_COUNTRY</ion-label>
  <ion-select
    [(ngModel)]="selectedValidityArea"
    (ngModelChange)="onValidityAreaChange()"
  >
    <ion-select-option *ngFor="let v of validityAreaLanguages | async">
      {{ 'COUNTRY.' + v.validityArea | translate }}
    </ion-select-option>
  </ion-select>
</ion-item>

<ion-item *ngIf="selectedValidityArea">
  <ion-label>SETTINGS_LANGUAGE</ion-label>
  <ion-select
    [(ngModel)]="settings.validityAreaLanguage.language"
    (ngModelChange)="onLanguageChange()"
  >
    <ion-select-option *ngFor="let language of selectedValidityArea.languages">
      {{ 'LANGUAGE.' + language | translate }}
    </ion-select-option>
  </ion-select>
</ion-item>
```

```typescript
// settings.ts
async onValidityAreaChange() {
  try {
    const sortedLanguages = this.selectedValidityArea.languages.sort(...);
    await this.settingsService.updateValidityAreaAndLanguage(
      this.selectedValidityArea.validityArea,
      this.selectedValidityArea.languages[0]
    );
  } catch (e) {
    console.log("Error", e);
  }
}

async onLanguageChange() {
  const isLangPresent = this.settingsService.syncToMobileLang(
    this.settings.validityAreaLanguage.language
  );
  await this.updateSettings();
}
```

#### React Native

```typescript
// src/components/settings/LanguageSelector.tsx
import { useValidityAreaLanguages } from '@hooks/useValidityAreaLanguages';
import { useSetting } from '@hooks/useSettings';

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { validityAreaLanguages } = useValidityAreaLanguages();
  const [selectedArea, setSelectedArea] = useState<string>(
    settings?.validityAreaLanguage?.validityArea,
  );

  const handleCountryChange = async (countryCode: string) => {
    try {
      setSelectedArea(countryCode);
      await updateSetting('validityAreaLanguage', {
        ...settings.validityAreaLanguage,
        validityArea: countryCode,
      });
      showSuccess({ title: 'Country Updated' });
    } catch (error) {
      showError({ title: 'Failed to update country' });
    }
  };

  const handleLanguageChange = async (language: string) => {
    try {
      await updateSetting('validityAreaLanguage', {
        ...settings.validityAreaLanguage,
        language,
      });
      showSuccess({ title: 'Language Updated' });
    } catch (error) {
      showError({ title: 'Failed to update language' });
    }
  };

  return (
    <View>
      <Picker selectedValue={selectedArea} onValueChange={handleCountryChange}>
        {validityAreaLanguages?.map(area => (
          <Picker.Item
            key={area.validityArea}
            label={t(`country.${area.validityArea}`)}
            value={area.validityArea}
          />
        ))}
      </Picker>

      <Picker
        selectedValue={settings?.validityAreaLanguage?.language}
        onValueChange={handleLanguageChange}
      >
        {/* Language options based on selected area */}
      </Picker>
    </View>
  );
};
```

---

### 2.4 Location Settings

#### Ionic

```html
<!-- settings.html -->
<ion-item>
  <ion-label translate>SETTINGS_LOCATION_UPDATE_DIALOG</ion-label>
  <ion-toggle
    [(ngModel)]="settings.location.askLocationAgain"
    (ngModelChange)="updateSettings()"
  ></ion-toggle>
</ion-item>

<ion-item *ngIf="!settings.location.askLocationAgain">
  <ion-label translate>SETTINGS_AUTO_UPDATE_LOCATION</ion-label>
  <ion-toggle
    [(ngModel)]="settings.location.locationUpdate"
    (ngModelChange)="updateSettings()"
  ></ion-toggle>
</ion-item>

<ion-item>
  <ion-label
    >{{ 'SETTINGS_GPS_CODE_' + settings.location.error | translate }}</ion-label
  >
</ion-item>
```

#### React Native

```typescript
// src/components/settings/LocationSettings.tsx
export const LocationSettings: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { t } = useTranslation();

  return (
    <View>
      <SettingsSectionToggle
        label={t('settings.askLocationAgain')}
        enabled={settings?.location?.askLocationAgain || false}
        onToggle={value =>
          updateSetting('location', {
            ...settings.location,
            askLocationAgain: value,
          })
        }
      />

      {!settings?.location?.askLocationAgain && (
        <SettingsSectionToggle
          label={t('settings.autoUpdateLocation')}
          enabled={settings?.location?.locationUpdate || false}
          onToggle={value =>
            updateSetting('location', {
              ...settings.location,
              locationUpdate: value,
            })
          }
        />
      )}

      <BodyText color={theme.text.secondary}>
        {t(`settings.gpsCode.${settings?.location?.error || 0}`)}
      </BodyText>
    </View>
  );
};
```

---

### 2.5 User Data Actions

#### Ionic

```html
<!-- settings.html -->
<ion-item *ngIf="isLogged">
  <ion-label>DELETE_ACCOUNT</ion-label>
  <ion-button (click)="deleteAccount()">
    <ion-icon slot="end" name="trash"></ion-icon>
  </ion-button>
</ion-item>

<ion-item>
  <ion-label>DELETE_USER_DATA</ion-label>
  <ion-button (click)="clearLocalUserData()">
    <ion-icon slot="end" name="trash"></ion-icon>
  </ion-button>
</ion-item>
```

```typescript
// settings.ts
async deleteAccount() {
  const result = await this.dialogService.confirm(...);
  if (result) {
    this.loading.start();
    await this.deleteService.deleteAccount(params);
    this.loading.stop();
    await this.router.navigateByUrl("/login", { replaceUrl: true });
  }
}

async clearLocalUserData() {
  const result = await this.dialogService.confirm(...);
  if (result) {
    this.loading.start();
    await this.settingsService.clearStorage();
    await this.favouriteService.clearFavourites(false);
    await this.historyService.clearHistory();
    this.loading.stop();
    this.router.navigateByUrl("/landingpage", { replaceUrl: true });
  }
}
```

#### React Native

```typescript
// src/screens/SettingsScreen.tsx
const { logout } = useAuth();

const handleDeleteAccount = () => {
  setModal({
    variant: 'confirm',
    title: t('settings.deleteAccount'),
    message: t('settings.deleteAccountConfirm'),
    confirmLabel: 'Delete',
    onConfirm: async () => {
      try {
        setIsLoading(true);
        await deleteAccountService.deleteAccount(params);
        await logout();
        showSuccess({ title: 'Account Deleted' });
        navigation.navigate('Login');
      } catch (error) {
        showError({ title: 'Failed to delete account' });
      } finally {
        setIsLoading(false);
      }
    },
  });
};

<TouchableOpacity
  style={styles.dangerButton}
  onPress={handleDeleteAccount}
  disabled={isLoading}
>
  <Icon name="trash" size={20} color={theme.button.error.text} />
  <ButtonText color={theme.button.error.text}>
    {t('settings.deleteAccount')}
  </ButtonText>
</TouchableOpacity>;
```

---

### 2.6 Rating & Version

#### Ionic

```html
<!-- settings.html -->
<ion-item (click)="openRatingDialog()">
  <ion-label translate>RATE_APPLICATION</ion-label>
  <ion-icon name="arrow-forward"></ion-icon>
</ion-item>

<ion-item>
  <ion-label translate>SETTINGS_VERSION</ion-label>
  <ion-label>{{appVersionInfo}}</ion-label>
</ion-item>
```

```typescript
// settings.ts
openRatingDialog() {
  AppRate.setPreferences({
    displayAppName: "My M Safety App",
    usesUntilPrompt: 6,
    // ... config
  });
  AppRate.promptForRating();
}
```

#### React Native

```typescript
// src/screens/SettingsScreen.tsx
import { useRatePrompt } from '@hooks/useRatePrompt';

const { triggerRatePrompt } = useRatePrompt();

<TouchableOpacity onPress={() => triggerRatePrompt('settings')}>
  <View style={styles.listItem}>
    <BodyText>{t('settings.rateApp')}</BodyText>
    <Icon name="arrow-right" />
  </View>
</TouchableOpacity>;
```

---

## 3. Service Layer Comparison

### Ionic: SettingsService (settings.service.ts)

```typescript
export class SettingsService {
  settings = new BehaviorSubject<ISettings>(initialSettings);

  getSettings(): Observable<ISettings> { ... }
  updateSettings(settings: ISettings): Promise<void> { ... }
  updateValidityAreaAndLanguage(area, lang): Promise<void> { ... }
  clearStorage(): Promise<void> { ... }
  syncToMobileLang(lang): string { ... }
  resetLocationError(): Promise<void> { ... }
}
```

**Usage**:

```typescript
this.settingsService.settings.subscribe(settings => {
  this.settings = settings;
});
```

### React Native: useSettings Hook

```typescript
export function useSettings() {
  const query = useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: () => safetyDataApiService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (newSettings: AppSettings) =>
      safetyDataApiService.updateSettings(newSettings),
    onSuccess: data => {
      queryClient.setQueryData(settingsQueryKeys.detail(), data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSetting: mutation.mutate,
  };
}
```

**Usage**:

```typescript
const { settings, isLoading, updateSetting } = useSettings();
```

---

## 4. State Management Pattern

### Ionic: RxJS Observables

```typescript
private settingsSubscription = this.settingsService.settings.subscribe(
  (settings) => {
    this.settings = settings;
    // Reactive: any time settings change, component updates
  }
);

ngOnDestroy() {
  this.settingsSubscription.unsubscribe();
}
```

### React Native: TanStack Query

```typescript
const {
  data: settings,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,
  staleTime: 5 * 60 * 1000,
});
```

**Advantages**:

- Automatic caching (5 min stale time)
- Background refetch on focus
- Offline support via network detection
- Automatic retry (3 attempts)
- Cleaner subscription model

---

## 5. UI Component Patterns

### Ionic: Template-Driven

```html
<ion-toggle
  [(ngModel)]="settings.home.barcodeScanner"
  (ngModelChange)="updateSettings()"
></ion-toggle>
```

### React Native: Component-Driven

```typescript
<Switch
  value={settings?.home.barcodeScanner || false}
  onValueChange={value => {
    // Optimistic update
    setLocalSettings({ ...localSettings, home: { barcodeScanner: value } });
    // Then sync
    updateSetting('home', { barcodeScanner: value });
  }}
/>
```

**Differences**:

- RN is callback-based, not two-way binding
- Optimistic updates for better UX
- Manual state management for immediate feedback

---

## 6. Error Handling Comparison

### Ionic: DialogService

```typescript
try {
  await this.settingsService.updateSettings(this.settings);
} catch (err) {
  if (!this.connectivity.checkNetworkConnectivity()) {
    this.dialogService.notify('INTERNET_DISCONNECTED');
  } else {
    this.dialogService.notify('ERROR_MESSAGE_APP');
  }
}
```

### React Native: Toast System

```typescript
try {
  await updateSetting(...);
  showSuccess({ title: 'Updated', message: 'Setting saved' });
} catch (error) {
  if (error.isNetworkError) {
    showError({ title: 'No Connection', message: 'Please check your internet' });
  } else {
    showError({ title: 'Error', message: 'Failed to update setting' });
  }
}
```

---

## 7. Localization

### Ionic: ngx-translate

```html
<ion-label translate>SETTINGS_BARCODE_SCANNER</ion-label>
<!-- English: "Enable Barcode Scanner"
     French: "Activer le scanner de codes-barres"
     Arabic: "تفعيل ماسح الرموز الشريطية" -->
```

```typescript
this.translate.instant('SETTINGS_BARCODE_SCANNER');
```

### React Native: react-i18next

```typescript
const { t } = useTranslation();

<BodyText>{t('settings.barcodeScanner')}</BodyText>;
```

**Translation files** (same structure):

```json
// en.json
{
  "settings": {
    "barcodeScanner": "Enable Barcode Scanner"
  }
}

// fr.json
{
  "settings": {
    "barcodeScanner": "Activer le scanner de codes-barres"
  }
}
```

---

## 8. Navigation

### Ionic: NavController (old pattern)

```typescript
this.router.navigateByUrl('/landingpage', { replaceUrl: true });
```

### React Native: React Navigation

```typescript
navigation.navigate('Home', { screen: 'LandingPage' });
// or
navigation.reset({
  index: 0,
  routes: [{ name: 'LandingPage' }],
});
```

---

## 9. Quick Reference: File Mapping

| Ionic File                     | React Native Equivalent               | Purpose              |
| ------------------------------ | ------------------------------------- | -------------------- |
| `settings.service.ts`          | `src/services/settingsService.ts`     | API & business logic |
| `settings.ts`                  | `src/screens/SettingsScreen.tsx`      | Main screen          |
| `settings.html`                | SettingsScreen JSX                    | UI template          |
| `settings.scss`                | StyleSheet in component               | Styles               |
| `dialogService`                | `showError`, `showSuccess` from toast | Notifications        |
| `settingsService.settings` obs | `useSettings()` hook                  | State management     |
| RxJS subscription              | TanStack Query `useQuery`             | Data fetching        |
| Template binding               | Controlled components                 | State binding        |

---

## 10. Implementation Checklist

### Must Have (from Ionic)

- [x] Barcode Scanner toggle
- [x] Article Details toggles (3 options)
- [x] Data Privacy toggles (2 options)
- [x] SDS Sections toggles (16)
- [x] Country selector
- [x] Language selector
- [x] Location settings (ask again, auto-update)
- [x] User Data actions (delete account, clear data)
- [x] Rating prompt
- [x] Version display

### Nice to Have

- [ ] Offline mode badge
- [ ] Sync pending indicator
- [ ] Settings sync timestamp
- [ ] Analytics tracking per toggle

---

**End of Mapping Document**
