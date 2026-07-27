import { FieldValue } from "firebase-admin/firestore";

const COUNTER_CONFIG = {
  likes: {
    postField: "likeCount",
    stateTimeField: "likeEventTimeMs",
    stateIdField: "likeEventId",
  },
  comments: {
    postField: "commentCount",
    stateTimeField: "commentEventTimeMs",
    stateIdField: "commentEventId",
  },
  saves: {
    postField: "saveCount",
    stateTimeField: "saveEventTimeMs",
    stateIdField: "saveEventId",
  },
};

const clampPreview = (value, maxLength) => String(value || "").slice(0, maxLength);

const getEventOrder = (event) => ({
  timeMs: Number.isFinite(Date.parse(event.time)) ? Date.parse(event.time) : Date.now(),
  id: String(event.id || ""),
});

const isNewerEvent = (state = {}, config, order) => {
  const previousTimeMs = Number(state[config.stateTimeField]) || 0;
  const previousId = String(state[config.stateIdField] || "");

  return (
    order.timeMs > previousTimeMs ||
    (order.timeMs === previousTimeMs && order.id > previousId)
  );
};

async function getCounterTotal(db, counterType, postId) {
  if (counterType === "saves") {
    const aggregate = await db
      .collectionGroup("savedCommunityPosts")
      .where("postId", "==", postId)
      .count()
      .get();
    return aggregate.data().count;
  }

  const aggregate = await db
    .collection("communityPosts")
    .doc(postId)
    .collection(counterType)
    .count()
    .get();
  return aggregate.data().count;
}

async function syncCounter(db, event, counterType) {
  const postId = event.params.postId;
  const config = COUNTER_CONFIG[counterType];
  const total = await getCounterTotal(db, counterType, postId);
  const order = getEventOrder(event);
  const postRef = db.collection("communityPosts").doc(postId);
  const stateRef = db.collection("communityPostCounterState").doc(postId);

  await db.runTransaction(async (transaction) => {
    const [postSnapshot, stateSnapshot] = await Promise.all([
      transaction.get(postRef),
      transaction.get(stateRef),
    ]);

    if (!postSnapshot.exists || !isNewerEvent(stateSnapshot.data(), config, order)) {
      return;
    }

    transaction.update(postRef, {
      [config.postField]: total,
      lastActivityAt: FieldValue.serverTimestamp(),
    });
    transaction.set(
      stateRef,
      {
        postId,
        [config.stateTimeField]: order.timeMs,
        [config.stateIdField]: order.id,
        [`${counterType}Count`]: total,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return total;
}

async function createNotificationIfMissing(db, recipientId, notificationId, payload) {
  if (!recipientId || recipientId === payload.actorId) {
    return;
  }

  const notificationRef = db
    .collection("users")
    .doc(recipientId)
    .collection("notifications")
    .doc(notificationId);

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(notificationRef);
    if (existing.exists) {
      return;
    }

    transaction.create(notificationRef, {
      recipientId,
      actorPhotoURL: "",
      postPreview: "",
      commentId: "",
      commentPreview: "",
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      ...payload,
    });
  });
}

async function notifyForLike(db, event) {
  const { postId, userId } = event.params;
  const [postSnapshot, actorSnapshot] = await Promise.all([
    db.collection("communityPosts").doc(postId).get(),
    db.collection("users").doc(userId).get(),
  ]);

  if (!postSnapshot.exists) {
    return;
  }

  const post = postSnapshot.data();
  const actor = actorSnapshot.data() || {};
  const actorName = actor.displayName || actor.email?.split("@")[0] || "Gradiate Student";

  await createNotificationIfMissing(db, post.authorId, `like_${postId}_${userId}`, {
    actorId: userId,
    actorName: clampPreview(actorName, 80),
    actorPhotoURL: clampPreview(actor.photoURL, 500),
    type: "like",
    postId,
    postPreview: clampPreview(post.content, 160),
  });
}

async function notifyForComment(db, event) {
  const { postId, commentId } = event.params;
  const comment = event.data?.data() || {};
  const postSnapshot = await db.collection("communityPosts").doc(postId).get();

  if (!postSnapshot.exists) {
    return;
  }

  const post = postSnapshot.data();
  await createNotificationIfMissing(
    db,
    post.authorId,
    `comment_${postId}_${commentId}`,
    {
      actorId: comment.authorId,
      actorName: clampPreview(comment.authorName || "Gradiate Student", 80),
      actorPhotoURL: clampPreview(comment.authorPhotoURL, 500),
      type: "comment",
      postId,
      postPreview: clampPreview(post.content, 160),
      commentId,
      commentPreview: clampPreview(comment.content, 160),
    },
  );
}

export function createCommunitySecurityHandlers(db) {
  return {
    async onLikeCreated(event) {
      await syncCounter(db, event, "likes");
      await notifyForLike(db, event);
    },
    async onLikeDeleted(event) {
      await syncCounter(db, event, "likes");
    },
    async onCommentCreated(event) {
      await syncCounter(db, event, "comments");
      await notifyForComment(db, event);
    },
    async onCommentDeleted(event) {
      await syncCounter(db, event, "comments");
    },
    async onSavedPostCreated(event) {
      await syncCounter(db, event, "saves");
    },
    async onSavedPostDeleted(event) {
      await syncCounter(db, event, "saves");
    },
  };
}

export const communitySecurityInternals = {
  getEventOrder,
  isNewerEvent,
};
