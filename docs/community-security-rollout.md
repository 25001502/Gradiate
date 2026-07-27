# Community security rollout

The default `firestore.rules` file is the strict final policy. Use the generated
transitional rules only during the seven-day installed-PWA update window.

## 1. Verify locally

```powershell
npm install
npm --prefix functions install
npm run lint
npm run build
npm run test:firebase
node --check functions/index.js
```

## 2. Deploy the trusted writers and refreshed client

```powershell
firebase deploy --only "functions:communityLikeCreated,functions:communityLikeDeleted,functions:communityCommentCreated,functions:communityCommentDeleted,functions:communitySavedPostCreated,functions:communitySavedPostDeleted,hosting"
```

The service-worker shell cache is versioned to `v4`, so existing installations
receive the normal in-app update prompt.

## 3. Deploy the transitional rules and index

```powershell
npm run firestore:prepare-transitional
firebase deploy --config firebase.transitional.json --only firestore
```

These rules enforce verified accounts and prevent admin impersonation immediately,
while temporarily accepting the old client's counter and notification batch writes.
The Functions recalculate totals from source documents. Monitor drift during this
compatibility window because legacy clients still have temporary side-effect access.

## 4. Reconcile existing totals

Wait until the `savedCommunityPosts.postId` collection-group index reports `Enabled`
in Firebase Console, then run the dry-run first:

```powershell
npm --prefix functions run community:reconcile
npm --prefix functions run community:reconcile:apply
```

Review the dry-run output before using the apply command. The apply command is
idempotent and can be rerun if interrupted.

## 5. Enforce strict client-write rules

After seven days, inspect Functions error rates and confirm that current clients are
receiving counter and notification updates. Run the reconciliation dry-run again and
apply any remaining drift before deploying the default strict rules:

```powershell
firebase deploy --only firestore:rules
```

Rollback, if needed, by regenerating and redeploying the transitional rules. Do not
disable the verified-email or admin-identity checks.

## 6. Stage App Check enforcement

In Firebase Console, monitor Firestore App Check metrics for at least 48 hours.
Enable enforcement only after valid requests remain at or above 99% and the web app,
installed PWA, admin dashboard, and local debug-token workflow are all represented.
App Check enforcement is a Firebase Console action; it is intentionally not changed
by repository deployment.
