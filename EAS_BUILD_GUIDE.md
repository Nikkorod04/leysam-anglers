# Build Your App Using EAS (Cloud Build) - No Android SDK Needed!

## Why EAS is Better for You Right Now

✅ **No Android SDK installation needed**
✅ **No local dependencies to manage**
✅ **Builds in the cloud (on Expo's servers)**
✅ **Works from any computer**
✅ **Much faster than setting up Android Studio**

## Step-by-Step: Build with EAS

### Step 1: Create an Expo Account (Free)
1. Go to https://expo.dev
2. Click "Sign Up"
3. Create an account (use your email)
4. Verify your email

### Step 2: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 3: Login to Expo
```bash
eas login
```
(Use the account you just created)

### Step 4: Configure Your Project
```bash
eas init
```
This will create an `eas.json` file in your project.

### Step 5: Build for Android
```bash
eas build --platform android
```

You'll be asked:
- **"Android device type?"** → Choose "phone"
- **"Use managed keystore?"** → Say "yes" (recommended)
- **"Build type?"** → Choose "release" for production

### Step 6: Wait for the Build
The build will happen on Expo's servers. You'll get a link to download the APK.

Download time: Usually 5-15 minutes

### Step 7: Install on Your Phone
Once the build is done:
1. Download the APK file
2. Transfer it to your Android phone via USB or download link
3. Open the APK to install
4. Or use `adb install app.apk` if you have ADB installed

## Alternative: Test in Expo Go First

If you want to test the app logic without AdMob ads:
```bash
npm start
```
Then scan the QR code with Expo Go app (download from Play Store)

This won't show ads but lets you verify everything else works.

## Important Notes

- EAS builds are free for the first 30 minutes per month
- Your app with AdMob will be fully functional after build
- Ads will show with your test Ad Unit IDs
- When ready to publish, you can build again with production Ad Unit IDs

## Next Steps

1. Create free Expo account at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Run: `eas login`
4. Run: `eas build --platform android`
5. Wait for build to complete
6. Download and install APK on your phone

Would you like me to help with any of these steps?
