#!/bin/bash

# ============================================================================
# rename-app.sh — Change the app display name across iOS & Android
#
# Usage:
#   ./scripts/rename-app.sh "My New App Name"
#
# This updates:
#   - app.json              (displayName)
#   - iOS Info.plist         (CFBundleDisplayName)
#   - Android strings.xml   (app_name)
# ============================================================================

set -euo pipefail

NEW_NAME="${1:-}"

if [ -z "$NEW_NAME" ]; then
  echo "Usage: $0 \"New App Name\""
  echo ""
  echo "Example: $0 \"Merck Events\""
  exit 1
fi

# Project root is one level up from scripts/
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

APP_JSON="$PROJECT_ROOT/app.json"
INFO_PLIST="$PROJECT_ROOT/ios/TodoAppRN/Info.plist"
STRINGS_XML="$PROJECT_ROOT/android/app/src/main/res/values/strings.xml"

CHANGED=0

# ---------- app.json ----------
if [ -f "$APP_JSON" ]; then
  # Use node for reliable JSON editing
  node -e "
    const fs = require('fs');
    const json = JSON.parse(fs.readFileSync('$APP_JSON', 'utf8'));
    json.displayName = '$NEW_NAME';
    fs.writeFileSync('$APP_JSON', JSON.stringify(json, null, 2) + '\n');
  "
  echo "[OK] app.json  ->  displayName = \"$NEW_NAME\""
  CHANGED=$((CHANGED + 1))
else
  echo "[SKIP] app.json not found"
fi

# ---------- iOS Info.plist ----------
if [ -f "$INFO_PLIST" ]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $NEW_NAME" "$INFO_PLIST" 2>/dev/null \
    || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string $NEW_NAME" "$INFO_PLIST"
  echo "[OK] Info.plist ->  CFBundleDisplayName = \"$NEW_NAME\""
  CHANGED=$((CHANGED + 1))
else
  echo "[SKIP] Info.plist not found at $INFO_PLIST"
fi

# ---------- Android strings.xml ----------
if [ -f "$STRINGS_XML" ]; then
  # Escape special XML characters in the name
  ESCAPED_NAME=$(echo "$NEW_NAME" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&apos;/g')
  sed -i '' "s|<string name=\"app_name\">.*</string>|<string name=\"app_name\">${ESCAPED_NAME}</string>|" "$STRINGS_XML"
  echo "[OK] strings.xml -> app_name = \"$NEW_NAME\""
  CHANGED=$((CHANGED + 1))
else
  echo "[SKIP] strings.xml not found at $STRINGS_XML"
fi

echo ""
if [ "$CHANGED" -gt 0 ]; then
  echo "Done! Updated $CHANGED file(s)."
  echo ""
  echo "Next steps:"
  echo "  iOS     ->  cd ios && bundle exec pod install && cd .."
  echo "  Android ->  cd android && ./gradlew clean && cd .."
  echo "  Then rebuild the app."
else
  echo "No files were updated."
fi
