import assert from "node:assert/strict";
import process from "node:process";
import { after, before, beforeEach, test } from "node:test";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createCommunitySecurityHandlers } from "../communitySecurity.js";

let app;
let db;
let handlers;

const event = ({ id, time, params, data = null }) => ({
  id,
  time,
  params,
  data: data ? { data: () => data } : undefined,
});

async function clearCollection(name) {
  await db.recursiveDelete(db.collection(name));
}

before(() => {
  assert.ok(
    process.env.FIRESTORE_EMULATOR_HOST,
    "Run Functions tests through `npm run test:firebase` so Firestore is never contacted in production.",
  );
  app = initializeApp({ projectId: "gradiate-functions-security-test" }, "community-security-tests");
  db = getFirestore(app);
  handlers = createCommunitySecurityHandlers(db);
});

beforeEach(async () => {
  await Promise.all([
    clearCollection("communityPosts"),
    clearCollection("communityPostCounterState"),
    clearCollection("users"),
  ]);
});

after(async () => {
  await deleteApp(app);
});

test("like triggers reconcile exact counts and create one deterministic notification", async () => {
  const postId = "like-post";
  const authorId = "post-author";
  const actorId = "post-actor";
  const postRef = db.collection("communityPosts").doc(postId);

  await Promise.all([
    postRef.set({ authorId, content: "A useful post", likeCount: 0 }),
    db.collection("users").doc(actorId).set({
      displayName: "Helpful Student",
      photoURL: "https://example.com/avatar.png",
    }),
    postRef.collection("likes").doc(actorId).set({ uid: actorId }),
  ]);

  const createdEvent = event({
    id: "like-created-1",
    time: "2026-06-28T10:00:00.000Z",
    params: { postId, userId: actorId },
    data: { uid: actorId },
  });

  await handlers.onLikeCreated(createdEvent);
  await handlers.onLikeCreated(createdEvent);

  assert.equal((await postRef.get()).data().likeCount, 1);
  const notificationRef = db
    .collection("users")
    .doc(authorId)
    .collection("notifications")
    .doc(`like_${postId}_${actorId}`);
  const notification = await notificationRef.get();
  assert.equal(notification.exists, true);
  assert.equal(notification.data().actorName, "Helpful Student");
  assert.equal(notification.data().read, false);

  await postRef.collection("likes").doc(actorId).delete();
  await handlers.onLikeDeleted(
    event({
      id: "like-deleted-1",
      time: "2026-06-28T10:01:00.000Z",
      params: { postId, userId: actorId },
    }),
  );
  assert.equal((await postRef.get()).data().likeCount, 0);
});

test("self likes and self comments do not create notifications", async () => {
  const postId = "self-like-post";
  const userId = "same-user";
  const postRef = db.collection("communityPosts").doc(postId);
  await postRef.set({ authorId: userId, content: "My post", likeCount: 0 });
  await postRef.collection("likes").doc(userId).set({ uid: userId });

  await handlers.onLikeCreated(
    event({
      id: "self-like-created",
      time: "2026-06-28T10:02:00.000Z",
      params: { postId, userId },
      data: { uid: userId },
    }),
  );

  const commentId = "self-comment";
  const comment = {
    authorId: userId,
    authorName: "Post Author",
    authorPhotoURL: "",
    content: "Adding context to my own post.",
  };
  await postRef.collection("comments").doc(commentId).set(comment);
  await handlers.onCommentCreated(
    event({
      id: "self-comment-created",
      time: "2026-06-28T10:02:30.000Z",
      params: { postId, commentId },
      data: comment,
    }),
  );

  const notifications = await db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .get();
  assert.equal(notifications.empty, true);
  assert.equal((await postRef.get()).data().commentCount, 1);
});

test("comment triggers reconcile counts and create comment notifications", async () => {
  const postId = "comment-post";
  const commentId = "comment-1";
  const authorId = "comment-post-author";
  const commenterId = "commenter";
  const postRef = db.collection("communityPosts").doc(postId);
  const comment = {
    authorId: commenterId,
    authorName: "Commenting Student",
    authorPhotoURL: "",
    content: "This is the answer.",
  };
  await postRef.set({ authorId, content: "Can anyone help?", commentCount: 0 });
  await postRef.collection("comments").doc(commentId).set(comment);

  await handlers.onCommentCreated(
    event({
      id: "comment-created-1",
      time: "2026-06-28T10:03:00.000Z",
      params: { postId, commentId },
      data: comment,
    }),
  );

  assert.equal((await postRef.get()).data().commentCount, 1);
  const notification = await db
    .collection("users")
    .doc(authorId)
    .collection("notifications")
    .doc(`comment_${postId}_${commentId}`)
    .get();
  assert.equal(notification.data().commentPreview, "This is the answer.");

  await postRef.collection("comments").doc(commentId).delete();
  await handlers.onCommentDeleted(
    event({
      id: "comment-deleted-1",
      time: "2026-06-28T10:04:00.000Z",
      params: { postId, commentId },
    }),
  );
  assert.equal((await postRef.get()).data().commentCount, 0);
});

test("concurrent and duplicate events settle on exact like and save totals", async () => {
  const postId = "concurrent-post";
  const postRef = db.collection("communityPosts").doc(postId);
  await postRef.set({ authorId: "author", content: "Post", likeCount: 99, saveCount: 99 });
  await Promise.all([
    postRef.collection("likes").doc("user-a").set({ uid: "user-a" }),
    postRef.collection("likes").doc("user-b").set({ uid: "user-b" }),
    db.collection("users").doc("user-a").set({ displayName: "A" }),
    db.collection("users").doc("user-b").set({ displayName: "B" }),
    db
      .collection("users")
      .doc("user-a")
      .collection("savedCommunityPosts")
      .doc(postId)
      .set({ postId }),
    db
      .collection("users")
      .doc("user-b")
      .collection("savedCommunityPosts")
      .doc(postId)
      .set({ postId }),
  ]);

  await Promise.all([
    handlers.onLikeCreated(
      event({
        id: "concurrent-like-a",
        time: "2026-06-28T10:05:00.001Z",
        params: { postId, userId: "user-a" },
        data: { uid: "user-a" },
      }),
    ),
    handlers.onLikeCreated(
      event({
        id: "concurrent-like-b",
        time: "2026-06-28T10:05:00.002Z",
        params: { postId, userId: "user-b" },
        data: { uid: "user-b" },
      }),
    ),
    handlers.onSavedPostCreated(
      event({
        id: "concurrent-save-a",
        time: "2026-06-28T10:05:00.003Z",
        params: { postId, userId: "user-a" },
      }),
    ),
    handlers.onSavedPostCreated(
      event({
        id: "concurrent-save-b",
        time: "2026-06-28T10:05:00.004Z",
        params: { postId, userId: "user-b" },
      }),
    ),
  ]);

  const post = (await postRef.get()).data();
  assert.equal(post.likeCount, 2);
  assert.equal(post.saveCount, 2);

  await db
    .collection("users")
    .doc("user-a")
    .collection("savedCommunityPosts")
    .doc(postId)
    .delete();
  const deletedEvent = event({
    id: "save-deleted-a",
    time: "2026-06-28T10:06:00.000Z",
    params: { postId, userId: "user-a" },
  });
  await handlers.onSavedPostDeleted(deletedEvent);
  await handlers.onSavedPostDeleted(deletedEvent);
  assert.equal((await postRef.get()).data().saveCount, 1);
});
