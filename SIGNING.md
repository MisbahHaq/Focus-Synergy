# Code Signing & Release Setup for Focus Synergy

This document details how to configure code signing credentials for Focus Synergy installers across Windows and macOS, and how they integrate into CI/CD pipelines.

---

## 1. Windows Code Signing

To sign Windows installers (NSIS `.exe` and `.msi`), Tauri supports standard EV/OV certificates or Azure Trusted Signing.

### Required Secrets / Configuration:
- `certificateThumbprint`: Installed certificate thumbprint on the build machine.
- `digestAlgorithm`: Set to `sha256`.
- `timestampUrl`: Set to `http://timestamp.digicert.com` (or timestamp server of choice).

### Environment Variables for CI:
If using a PFX file:
- `WIN_CERTIFICATE_FILE`: Base64-encoded `.pfx` file or local path.
- `WIN_CERTIFICATE_PASSWORD`: Password for the `.pfx` certificate.

---

## 2. macOS Code Signing & Notarization

To distribute signed macOS builds outside the Mac App Store, you need an Apple Developer ID Application Certificate and App Store Connect API keys or Developer ID credentials for notarization.

### Required Secrets / Configuration:
- `signingIdentity`: "Developer ID Application: Your Name/Org (TEAMID)".
- `APPLE_CERTIFICATE`: Base64-encoded Developer ID Application `.p12` certificate.
- `APPLE_CERTIFICATE_PASSWORD`: Password for the `.p12` certificate.
- `APPLE_KEYCHAIN_PASSWORD`: Temporary password created during CI setup to unlock the keychain.

### Notarization Secrets:
- `APPLE_ID`: Your Apple ID email address.
- `APPLE_PASSWORD`: App-specific password generated at [appleid.apple.com](https://appleid.apple.com).
- `APPLE_TEAM_ID`: Your 10-character Apple Team ID.

---

## 3. Tauri Auto-Updater Public / Private Keys

The Tauri updater uses an ed25519 keypair to verify update signatures.

### Generate Keypair:
Run:
```bash
npx tauri signer generate
```
- Put the generated public key into `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.
- Store the generated private key as `TAURI_SIGNING_PRIVATE_KEY` in GitHub Repository Secrets.
- Store the passphrase as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in GitHub Repository Secrets.

---

## 4. GitHub Actions Secrets Mapping Summary

Add the following to **Settings > Secrets and variables > Actions**:

| Secret Name | Description |
| --- | --- |
| `FIREBASE_API_KEY` | Firebase API Key for frontend injection |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `FIREBASE_PROJECT_ID` | Firebase Project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `FIREBASE_APP_ID` | Firebase App ID |
| `TAURI_SIGNING_PRIVATE_KEY` | Tauri Auto-Updater Private Key |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Tauri Auto-Updater Key Passphrase |
| `APPLE_CERTIFICATE` | Base64 Apple Developer ID Certificate |
| `APPLE_CERTIFICATE_PASSWORD` | Password for Apple Certificate |
| `APPLE_ID` | Apple ID Email for Notarization |
| `APPLE_PASSWORD` | App-specific Password for Notarization |
| `APPLE_TEAM_ID` | Apple Team ID |
