import { getApps, initializeApp } from "firebase-admin/app";
import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";

const args = new Set(process.argv.slice(2));
const applyChanges = args.has("--apply");
const projectArg = process.argv.find((value) => value.startsWith("--project="));
const projectId = projectArg?.split("=")[1] || process.env.GCLOUD_PROJECT;

if (!projectId) {
  throw new Error("Pass --project=<firebase-project-id> or set GCLOUD_PROJECT.");
}

if (!getApps().length) {
  initializeApp({ projectId });
}

const db = getFirestore();
const pageSize = 100;
let lastDocument = null;
let scanned = 0;
let changed = 0;

async function countPostEngagement(postId) {
  const postRef = db.collection("communityPosts").doc(postId);
  const [likes, comments, saves] = await Promise.all([
    postRef.collection("likes").count().get(),
    postRef.collection("comments").count().get(),
    db.collectionGroup("savedCommunityPosts").where("postId", "==", postId).count().get(),
  ]);

  return {
    likeCount: likes.data().count,
    commentCount: comments.data().count,
    saveCount: saves.data().count,
  };
}

do {
  let pageQuery = db
    .collection("communityPosts")
    .orderBy(FieldPath.documentId())
    .limit(pageSize);

  if (lastDocument) {
    pageQuery = pageQuery.startAfter(lastDocument);
  }

  const page = await pageQuery.get();
  if (page.empty) {
    break;
  }

  const batch = db.batch();
  const reconciliationTimeMs = Date.now();
  let pageChanges = 0;

  for (const postDocument of page.docs) {
    const actual = await countPostEngagement(postDocument.id);
    const current = postDocument.data();
    const differs =
      Number(current.likeCount || 0) !== actual.likeCount ||
      Number(current.commentCount || 0) !== actual.commentCount ||
      Number(current.saveCount || 0) !== actual.saveCount;

    scanned += 1;
    if (!differs) {
      continue;
    }

    changed += 1;
    pageChanges += 1;
    console.log(
      `${applyChanges ? "APPLY" : "DRY-RUN"} ${postDocument.id}: ` +
        `likes ${current.likeCount || 0}->${actual.likeCount}, ` +
        `comments ${current.commentCount || 0}->${actual.commentCount}, ` +
        `saves ${current.saveCount || 0}->${actual.saveCount}`,
    );

    if (applyChanges) {
      const stateRef = db.collection("communityPostCounterState").doc(postDocument.id);
      batch.update(postDocument.ref, actual);
      batch.set(
        stateRef,
        {
          postId: postDocument.id,
          likesCount: actual.likeCount,
          commentsCount: actual.commentCount,
          savesCount: actual.saveCount,
          likeEventTimeMs: reconciliationTimeMs,
          commentEventTimeMs: reconciliationTimeMs,
          saveEventTimeMs: reconciliationTimeMs,
          likeEventId: "reconciliation",
          commentEventId: "reconciliation",
          saveEventId: "reconciliation",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  if (applyChanges && pageChanges > 0) {
    await batch.commit();
  }

  lastDocument = page.docs.at(-1);
} while (lastDocument);

console.log(
  `${applyChanges ? "Reconciliation complete" : "Dry run complete"}: ` +
    `${scanned} posts scanned, ${changed} posts require changes.`,
);
