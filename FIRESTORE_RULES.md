# Firestore Security Rules

Copy and paste the following rules into your Firebase Console (Firestore > Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to create fishing spots
    // Allow anyone to read, but only creator can update/delete
    match /fishingSpots/{spotId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow authenticated users to create catch reports
    // Allow anyone to read, but only creator can update/delete
    match /catchReports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Allow authenticated users to create and read reports (flags/moderation)
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.reporterId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.reporterId == request.auth.uid;
    }

    // Allow tracking of user activity for spam prevention
    match /userActivity/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Key Change:
I added the `reports` collection rule:
```
match /reports/{reportId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.resource.data.reporterId == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.reporterId == request.auth.uid;
}
```

This allows:
- ✅ **Read**: Any authenticated user can read reports
- ✅ **Create**: Any authenticated user can create a report (and must be the reporterId)
- ✅ **Update/Delete**: Only the user who created the report can modify it

## Steps to Update:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Firestore Database > **Rules** tab
4. Replace all the rules with the code above
5. Click **Publish**

This will fix the "Missing or insufficient permissions" error when submitting reports!

