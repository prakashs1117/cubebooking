# branding/

Place your source assets here before running `yarn rebrand`.

```
branding/
  icon.png                        # Master icon: >= 1024x1024 px, square, NO alpha channel (iOS)
  splash.png                      # Splash/bootsplash source image
  firebase/
    GoogleService-Info.plist      # iOS Firebase config (download from Firebase Console)
    google-services.json          # Android Firebase config (download from Firebase Console)
```

## Icon requirements

- Minimum 1024 × 1024 px
- Square (1:1 ratio)
- PNG format
- **No alpha/transparency** — the iOS App Store rejects icons with an alpha channel.
  If your source has alpha, flatten it against the background colour first:
  ```
  convert icon-with-alpha.png -background white -flatten icon.png
  ```

## Firebase configs

Download fresh configs from the Firebase Console **after** registering the new
bundle ID / application ID:

- iOS: Firebase Console → Project settings → iOS app → Download `GoogleService-Info.plist`
- Android: Firebase Console → Project settings → Android app → Download `google-services.json`

Place both files in `branding/firebase/` before running `yarn rebrand` (or use
`--skip-firebase` to skip this step during the run).

## .gitignore note

`branding/firebase/` files contain API keys — consider adding them to `.gitignore`
and distributing them via a secrets manager or CI environment instead.
