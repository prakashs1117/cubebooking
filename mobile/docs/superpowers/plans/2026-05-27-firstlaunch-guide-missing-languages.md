# First Launch Guide — Add Missing Languages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the 5 missing languages (German, Spanish, Italian, Japanese, Portuguese, Chinese) to `firstLaunchGuide.json` and update `FirstLaunchCarousel.tsx` to resolve language codes from the new supported set, with `'en'` as the default fallback.

**Architecture:** All carousel content lives in `src/data/firstLaunchGuide.json` keyed by 2-letter language code. The `FirstLaunchCarousel` component already has a `supportedLang` guard — we extend the supported array and add the 6 new language blocks to the JSON. No new files, no new components. The Ionic app's `LOADING_SDS_HINT` and `GREETINGS_TEXT` translations are used as the basis for the slide content in each language.

**Tech Stack:** React Native, `src/data/firstLaunchGuide.json` (static JSON), `FirstLaunchCarousel.tsx` (update supported language list)

---

## Files Overview

| File | Action | What changes |
|------|--------|--------------|
| `src/data/firstLaunchGuide.json` | **Modify** | Add `de`, `es`, `it`, `ja`, `pt`, `zh` language blocks |
| `src/components/onboarding/FirstLaunchCarousel.tsx` | **Modify** | Extend supported language array from `['en','fr','ar']` to include all 8 |

---

## Language Content Reference

The slide titles and descriptions are derived from Ionic app translations plus native translations for the app-specific features not in the Ionic app. The 5-slide structure per language:

| Slide | Title (en) | Description source |
|-------|-----------|-------------------|
| 1 | Welcome to My M Safety | Ionic: `LOADING_SDS_HINT` |
| 2 | Search or Scan Your Product | Translated new content |
| 3 | GHS Symbols At First Sight | Translated new content |
| 4 | Print a Safety Tag | Translated new content |
| 5 | Share Favorite Products | Translated new content |

UI string sources from Ionic (used verbatim):
- `skip` → Ionic: `SKIP` key
- `next` → translated ("Weiter", "Siguiente", "Avanti", "次へ", "Próximo", "下一步")
- `getStarted` → translated ("Los geht's", "Empezar", "Inizia", "始める", "Começar", "开始")

---

## Task 1: Add 6 language blocks to `firstLaunchGuide.json`

**Files:**
- Modify: `react-native-mobileapp/src/data/firstLaunchGuide.json`

The file currently has `en`, `fr`, `ar` keys. We append `de`, `es`, `it`, `ja`, `pt`, `zh`.

- [ ] **Step 1: Open the file and locate the closing `}` of the root object**

File: `src/data/firstLaunchGuide.json` — the root is `{ "en": {...}, "fr": {...}, "ar": {...} }`

- [ ] **Step 2: Add the 6 new language blocks**

The complete additions to append before the final `}` of the root object:

```json
  "de": {
    "skip": "Überspringen",
    "next": "Weiter",
    "getStarted": "Los geht's",
    "screens": [
      {
        "id": "1",
        "title": "Willkommen bei My M Safety",
        "description": "Bitte beachten Sie, dass die App die neusten Produktsicherheitsinformationen zur Verfügung stellt. Diese können von einem heruntergeladenen Sicherheitsdatenblatt abweichen.",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "Produkt suchen oder scannen",
        "description": "Suchen oder scannen Sie das Produktetikett nach Produktnamen, Produktnummern oder CAS-Nummern. Das Scannen des 2D-Barcodes des Produktetiketts ist möglich.",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "GHS-Symbole auf einen Blick",
        "description": "Ein einfaches Tippen auf die Sicherheitskachel führt Sie zu den Details der GHS-Klassifizierung.",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "Sicherheitsetikett drucken",
        "description": "Drucken Sie ein Sicherheitsetikett für Ihr Produkt mit einem verbundenen Drucker oder speichern Sie es als Bild.",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "Lieblingsprodukte teilen",
        "description": "Erstellen und teilen Sie Ihre Lieblingsprodukte nach der kostenlosen Registrierung.",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  },
  "es": {
    "skip": "Omitir",
    "next": "Siguiente",
    "getStarted": "Empezar",
    "screens": [
      {
        "id": "1",
        "title": "Bienvenido a My M Safety",
        "description": "Tenga en cuenta que esta aplicación proporciona los datos más recientes sobre seguridad de los productos. Esta información puede diferir de una SDS que pudiera descargarse.",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "Busque o escanee su producto",
        "description": "Busque o escanee la etiqueta del producto por nombre, número de producto o número CAS. Es posible escanear el código de barras 2D de la etiqueta del producto.",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "Símbolos GHS a primera vista",
        "description": "Un solo toque en el mosaico de seguridad le llevará a los detalles de la clasificación GHS.",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "Imprimir una etiqueta de seguridad",
        "description": "Imprima una etiqueta de seguridad para su producto con una impresora conectada o guárdela como imagen.",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "Compartir productos favoritos",
        "description": "Cree y comparta sus productos favoritos una vez que se haya registrado con una cuenta gratuita.",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  },
  "it": {
    "skip": "Salta",
    "next": "Avanti",
    "getStarted": "Inizia",
    "screens": [
      {
        "id": "1",
        "title": "Benvenuto in My M Safety",
        "description": "Questa app fornisce i dati di sicurezza più recenti disponibili per il prodotto. Queste informazioni potrebbero differire da quelle riportate su una SDS scaricata.",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "Cerca o scansiona il tuo prodotto",
        "description": "Cerca o scansiona l'etichetta del prodotto per nome, numero di prodotto o numero CAS. È possibile scansionare il codice a barre 2D dell'etichetta del prodotto.",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "Simboli GHS a colpo d'occhio",
        "description": "Un semplice tocco sul riquadro di sicurezza ti porta ai dettagli della classificazione GHS.",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "Stampa un'etichetta di sicurezza",
        "description": "Stampa un'etichetta di sicurezza per il tuo prodotto con una stampante collegata o salvala come immagine.",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "Condividi i prodotti preferiti",
        "description": "Crea e condividi i tuoi prodotti preferiti dopo esserti registrato con un account gratuito.",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  },
  "ja": {
    "skip": "スキップ",
    "next": "次へ",
    "getStarted": "始める",
    "screens": [
      {
        "id": "1",
        "title": "My M Safety へようこそ",
        "description": "本アプリケーションでは、入手可能な最新SDSを提供しています。この情報はダウンロードしたSDSと異なる場合がございます。",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "製品を検索またはスキャン",
        "description": "製品名、製品番号、またはCAS番号で製品ラベルを検索またはスキャンできます。製品ラベルの2Dバーコードのスキャンも可能です。",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "一目でわかるGHSシンボル",
        "description": "安全タイルをタップするだけで、GHS分類の詳細を確認できます。",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "安全タグを印刷",
        "description": "接続されたプリンターで製品の安全タグを印刷するか、画像として保存できます。",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "お気に入り製品を共有",
        "description": "無料アカウントに登録すると、お気に入りの製品を作成して共有できます。",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  },
  "pt": {
    "skip": "Pular",
    "next": "Próximo",
    "getStarted": "Começar",
    "screens": [
      {
        "id": "1",
        "title": "Bem-vindo ao My M Safety",
        "description": "Observe que este aplicativo fornece os dados de segurança do produto mais recentes disponíveis. Essas informações podem diferir de um SDS baixado.",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "Pesquise ou escaneie seu produto",
        "description": "Pesquise ou escaneie o rótulo do produto por nomes de produto, números de produto ou números CAS. O escaneamento do código de barras 2D do rótulo do produto é possível.",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "Símbolos GHS à primeira vista",
        "description": "Um único toque no mosaico de segurança irá levá-lo aos detalhes da classificação GHS.",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "Imprimir uma etiqueta de segurança",
        "description": "Imprima uma etiqueta de segurança para o seu produto com uma impressora conectada ou salve-a como imagem.",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "Compartilhar produtos favoritos",
        "description": "Crie e compartilhe seus produtos favoritos após se registrar em uma conta gratuita.",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  },
  "zh": {
    "skip": "跳过",
    "next": "下一步",
    "getStarted": "开始",
    "screens": [
      {
        "id": "1",
        "title": "欢迎使用 My M Safety",
        "description": "请注意，此应用程序提供可用的最新产品安全数据。此信息可能与下载的SDS不同。",
        "imageUrl": "",
        "iconName": "merck-logo",
        "backgroundColor": "#4A0E8F"
      },
      {
        "id": "2",
        "title": "搜索或扫描您的产品",
        "description": "通过产品名称、产品编号或CAS编号搜索或扫描产品标签。可以扫描产品标签上的二维条形码。",
        "imageUrl": "",
        "iconName": "lab",
        "backgroundColor": "#F5C518"
      },
      {
        "id": "3",
        "title": "一眼识别GHS符号",
        "description": "轻触安全磁贴即可查看GHS分类的详细信息。",
        "imageUrl": "",
        "iconName": "shield-person",
        "backgroundColor": "#3C8B84"
      },
      {
        "id": "4",
        "title": "打印安全标签",
        "description": "使用连接的打印机打印产品的安全标签，或将其保存为图片。",
        "imageUrl": "",
        "iconName": "checkbox-checked",
        "backgroundColor": "#503291"
      },
      {
        "id": "5",
        "title": "分享收藏的产品",
        "description": "注册免费账户后，即可创建和分享您的收藏产品。",
        "imageUrl": "",
        "iconName": "favorite",
        "backgroundColor": "#0070C0"
      }
    ]
  }
```

- [ ] **Step 3: Commit**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms
git add react-native-mobileapp/src/data/firstLaunchGuide.json
git commit -m "content: add de/es/it/ja/pt/zh language blocks to firstLaunchGuide.json"
```

Expected: commit succeeds, JSON is valid

---

## Task 2: Extend the supported language list in `FirstLaunchCarousel.tsx`

**Files:**
- Modify: `react-native-mobileapp/src/components/onboarding/FirstLaunchCarousel.tsx`

Currently line ~95:
```typescript
const supportedLang = ['en', 'fr', 'ar'].includes(lang) ? lang : 'en';
```

- [ ] **Step 1: Find the supported language array**

Search for `['en', 'fr', 'ar']` in `FirstLaunchCarousel.tsx`. It is inside the `currentLang` useMemo block.

- [ ] **Step 2: Replace the supported language list**

Change:
```typescript
const supportedLang = ['en', 'fr', 'ar'].includes(lang) ? lang : 'en';
```

To:
```typescript
const supportedLang = ['en', 'fr', 'ar', 'de', 'es', 'it', 'ja', 'pt', 'zh'].includes(lang) ? lang : 'en';
```

- [ ] **Step 3: Commit**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms
git add react-native-mobileapp/src/components/onboarding/FirstLaunchCarousel.tsx
git commit -m "feat: support de/es/it/ja/pt/zh in FirstLaunchCarousel language selection"
```

---

## Verification

### TypeScript check
```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit
```
Expected: no new errors

### Manual test — change device language
1. Set simulator/device language to German (`de`)
2. Kill and relaunch the app
3. Run `resetOnboarding()` from a dev button or via AsyncStorage clear
4. Relaunch → First launch guide should appear **in German**
5. Repeat for Spanish (`es`), Chinese (`zh`)
6. Set to an unsupported language (e.g., Korean `ko`) → guide should show **in English**

### Validate JSON
```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
node -e "require('./src/data/firstLaunchGuide.json'); console.log('JSON valid')"
```
Expected: `JSON valid`
