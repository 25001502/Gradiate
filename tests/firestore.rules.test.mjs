import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { createTransitionalRules } from "../scripts/generate-transitional-firestore-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strictRules = await readFile(path.join(root, "firestore.rules"), "utf8");

const authToken = (email, verified = true) => ({
  email,
  email_verified: verified,
});

const initialProfile = (uid, email) => ({
  uid,
  displayName: "Test Student",
  email,
  avatarSeed: uid,
  avatarStyle: "adventurer",
  photoURL: `https://api.dicebear.com/9.x/adventurer/svg?seed=${uid}`,
  createdAt: serverTimestamp(),
});

const communityPost = (authorId, authorIsAdmin = false) => ({
  authorId,
  authorName: "Test Student",
  authorPhotoURL: "",
  authorAvatarSeed: authorId,
  authorAvatarStyle: "adventurer",
  authorUniversity: "",
  authorProgram: "",
  authorYearOfStudy: "",
  authorIsAdmin,
  category: "general",
  content: "A valid community post",
  moduleCode: "",
  tags: [],
  likeCount: 0,
  commentCount: 0,
  saveCount: 0,
  lastActivityAt: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

async function seed(environment, callback) {
  await environment.withSecurityRulesDisabled(async (context) => callback(context.firestore()));
}

test("strict Firestore community rules", async (t) => {
  const environment = await initializeTestEnvironment({
    projectId: "gradiate-rules-strict-test",
    firestore: { rules: strictRules },
  });

  t.after(async () => environment.cleanup());
  t.beforeEach(async () => environment.clearFirestore());

  await t.test("allows only the minimal initial profile for an unverified signup", async () => {
    const uid = "unverified-user";
    const email = "unverified@example.com";
    const db = environment.authenticatedContext(uid, authToken(email, false)).firestore();

    await assertSucceeds(setDoc(doc(db, "users", uid), initialProfile(uid, email)));
    await seed(environment, async (adminDb) => {
      await setDoc(doc(adminDb, "communityPosts", "existing-post"), communityPost("author"));
      await setDoc(doc(adminDb, "admins", uid), { role: "admin" });
    });
    await assertFails(
      setDoc(doc(db, "users", uid, "bookmarks", "univen"), { name: "UNIVEN" }),
    );
    await assertFails(setDoc(doc(db, "communityPosts", "blocked-post"), communityPost(uid)));
    await assertFails(
      setDoc(doc(db, "communityPosts", "existing-post", "likes", uid), {
        uid,
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, "communityPosts", "existing-post", "comments", "blocked-comment"), {
        authorId: uid,
        authorName: "Test Student",
        authorPhotoURL: "",
        authorAvatarSeed: uid,
        authorAvatarStyle: "adventurer",
        authorUniversity: "",
        authorProgram: "",
        authorYearOfStudy: "",
        authorIsAdmin: false,
        content: "Blocked comment",
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, "users", uid, "savedCommunityPosts", "existing-post"), {
        postId: "existing-post",
        authorId: "author",
        authorName: "Post Author",
        category: "general",
        contentPreview: "Existing post",
        isAnswered: false,
        savedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, "communityReports", "blocked-report"), {
        reporterId: uid,
        reporterName: "Test Student",
        targetType: "post",
        targetId: "existing-post",
        postId: "existing-post",
        commentId: "",
        targetAuthorId: "author",
        reason: "Spam",
        contentPreview: "Existing post",
        status: "open",
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(getDoc(doc(db, "admins", uid)));
  });

  await t.test("rejects unauthenticated community writes", async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, "communityPosts", "anonymous-post"), communityPost("anon")));
  });

  await t.test("accepts verified source writes but rejects forged admin identity", async () => {
    const uid = "verified-user";
    const db = environment
      .authenticatedContext(uid, authToken("verified@example.com"))
      .firestore();

    await assertSucceeds(setDoc(doc(db, "communityPosts", "valid-post"), communityPost(uid)));
    await assertSucceeds(
      setDoc(doc(db, "communityPosts", "valid-post", "likes", uid), {
        uid,
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, "communityPosts", "forged-admin-post"), communityPost(uid, true)),
    );
  });

  await t.test("allows a real admin to publish an admin-authored post", async () => {
    const uid = "real-admin";
    await seed(environment, async (adminDb) => {
      await setDoc(doc(adminDb, "admins", uid), { role: "admin" });
    });
    const db = environment.authenticatedContext(uid, authToken("admin@example.com")).firestore();

    await assertSucceeds(
      setDoc(doc(db, "communityPosts", "admin-post"), communityPost(uid, true)),
    );
  });

  await t.test("denies direct counter and notification writes", async () => {
    const authorId = "post-author";
    const actorId = "post-actor";
    await seed(environment, async (adminDb) => {
      await setDoc(doc(adminDb, "communityPosts", "secured-post"), communityPost(authorId));
    });
    const actorDb = environment
      .authenticatedContext(actorId, authToken("actor@example.com"))
      .firestore();

    await assertFails(
      updateDoc(doc(actorDb, "communityPosts", "secured-post"), {
        likeCount: 1,
        lastActivityAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(actorDb, "users", authorId, "notifications", "forged"), {
        recipientId: authorId,
        actorId,
        actorName: "Actor",
        actorPhotoURL: "",
        type: "like",
        postId: "secured-post",
        postPreview: "A valid community post",
        commentId: "",
        commentPreview: "",
        read: false,
        createdAt: serverTimestamp(),
      }),
    );
  });

  await t.test("allows recipients to mark trusted notifications read only", async () => {
    const uid = "notification-owner";
    await seed(environment, async (adminDb) => {
      await setDoc(doc(adminDb, "users", uid, "notifications", "trusted"), {
        recipientId: uid,
        actorId: "someone-else",
        actorName: "Someone Else",
        actorPhotoURL: "",
        type: "like",
        postId: "post-id",
        postPreview: "Preview",
        commentId: "",
        commentPreview: "",
        read: false,
        createdAt: serverTimestamp(),
      });
    });
    const db = environment.authenticatedContext(uid, authToken("owner@example.com")).firestore();

    await assertSucceeds(
      updateDoc(doc(db, "users", uid, "notifications", "trusted"), {
        read: true,
        readAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, "users", uid, "notifications", "trusted"), {
        actorName: "Tampered",
      }),
    );
  });
});

test("transitional rules preserve old verified PWA community batches", async (t) => {
  const environment = await initializeTestEnvironment({
    projectId: "gradiate-rules-transitional-test",
    firestore: { rules: createTransitionalRules(strictRules) },
  });

  t.after(async () => environment.cleanup());
  await environment.clearFirestore();
  const authorId = "legacy-author";
  const actorId = "legacy-actor";
  await seed(environment, async (adminDb) => {
    await setDoc(doc(adminDb, "communityPosts", "legacy-post"), communityPost(authorId));
  });

  const actorDb = environment
    .authenticatedContext(actorId, authToken("legacy@example.com"))
    .firestore();

  await assertSucceeds(
    updateDoc(doc(actorDb, "communityPosts", "legacy-post"), {
      likeCount: 1,
      lastActivityAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    setDoc(doc(actorDb, "users", authorId, "notifications", "legacy-notification-single"), {
      recipientId: authorId,
      actorId,
      actorName: "Legacy Actor",
      actorPhotoURL: "",
      type: "like",
      postId: "legacy-post",
      postPreview: "A valid community post",
      commentId: "",
      commentPreview: "",
      read: false,
      createdAt: serverTimestamp(),
    }),
  );

  const batch = writeBatch(actorDb);
  batch.update(doc(actorDb, "communityPosts", "legacy-post"), {
    likeCount: 2,
    lastActivityAt: serverTimestamp(),
  });
  batch.set(doc(actorDb, "users", authorId, "notifications", "legacy-notification"), {
    recipientId: authorId,
    actorId,
    actorName: "Legacy Actor",
    actorPhotoURL: "",
    type: "like",
    postId: "legacy-post",
    postPreview: "A valid community post",
    commentId: "",
    commentPreview: "",
    read: false,
    createdAt: serverTimestamp(),
  });

  await assertSucceeds(batch.commit());
});
