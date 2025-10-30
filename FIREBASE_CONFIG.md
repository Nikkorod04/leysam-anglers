# Firebase Configuration - Quick Reference

## Important URLs

- **Firebase Console**: https://console.firebase.google.com/
- **Project Settings**: Click ⚙️ icon → Project settings
- **Authentication**: Left menu → Authentication
- **Firestore**: Left menu → Firestore Database
- **Storage**: Left menu → Storage

## Configuration File Location

Update this file with your Firebase credentials:
```
src/services/firebase.ts
```

## Where to Find Your Firebase Config Values

| Value | Where to Find |
|-------|---------------|
| `apiKey` | Project Settings → General → Your apps → Web app config |
| `authDomain` | Same location as above |
| `projectId` | Same location as above (also visible in URL) |
| `storageBucket` | Same location as above |
| `messagingSenderId` | Same location as above |
| `appId` | Same location as above |

## Required Firebase Services

### 1. Authentication
- **Path**: Authentication → Sign-in method
- **Provider**: Email/Password
- **Status**: Must be ENABLED ✅

### 2. Firestore Database
- **Path**: Firestore Database
- **Mode**: Test mode (for development)
- **Location**: asia-southeast1 (Singapore) - recommended for Philippines
- **Collections** (created automatically by app):
  - `users` - User profiles
  - `fishingSpots` - Fishing location data
  - `catchReports` - User catch reports

### 3. Firebase Storage
- **Path**: Storage
- **Mode**: Test mode (for development)
- **Location**: Same as Firestore
- **Folders** (created automatically by app):
  - `spots/` - Fishing spot images
  - `catches/` - Catch report images

## Step-by-Step Configuration

1. ✅ Create Firebase project
2. ✅ Enable Email/Password authentication
3. ✅ Create Firestore database (test mode, asia-southeast1)
4. ✅ Enable Storage (test mode, same location)
5. ✅ Get web app config (Project Settings → Add web app)
6. ✅ Copy config values to `src/services/firebase.ts`
7. ✅ Save file
8. ✅ Run `npm start`

## Testing Your Configuration

After updating the config:

1. Start the app: `npm start`
2. Open in Expo Go
3. Try to sign up with a test email
4. If successful, you'll see "Account created successfully!"
5. Check Firebase Console → Authentication → Users to see your new user

## Common Configuration Errors

### Error: "Firebase: Error (auth/invalid-api-key)"
- **Fix**: Check that `apiKey` is correct in `firebase.ts`

### Error: "Firebase: Error (auth/configuration-not-found)"
- **Fix**: Check that `authDomain` matches your project

### Error: "Firebase: Error (auth/operation-not-allowed)"
- **Fix**: Enable Email/Password in Authentication → Sign-in method

### Error: "FirebaseError: Missing or insufficient permissions"
- **Fix**: Ensure Firestore is in test mode or update security rules

## Example Config (DO NOT USE - Replace with yours!)

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "leysam-anglers-xxxxx.firebaseapp.com",
  projectId: "leysam-anglers-xxxxx",
  storageBucket: "leysam-anglers-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Security Notes

⚠️ **For Development:**
- Test mode is fine
- Anyone can read/write data

⚠️ **Before Production:**
- Update Firestore security rules
- Update Storage security rules
- See SETUP_GUIDE.md for production rules

## Need Help?

1. Check that all services are enabled in Firebase Console
2. Verify config values are copied exactly (no extra spaces)
3. Restart Metro bundler after changing config
4. Check Firebase Console → Authentication/Firestore for error logs

---

**Once configured, you won't need to change these values again!**
