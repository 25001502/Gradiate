import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strictRulesPath = path.join(projectRoot, "firestore.rules");
const outputPath = path.join(projectRoot, ".firebase", "firestore.rules.transitional");
const strictMarker = "return false; // COMMUNITY_SECURITY_STRICT";
const transitionalMarker = "return true; // COMMUNITY_SECURITY_TRANSITIONAL";
const postUpdateStart = "      // COMMUNITY_POST_UPDATE_RULES_START";
const postUpdateEnd = "      // COMMUNITY_POST_UPDATE_RULES_END";
const notificationCreateStart = "      // COMMUNITY_NOTIFICATION_CREATE_RULES_START";
const notificationCreateEnd = "      // COMMUNITY_NOTIFICATION_CREATE_RULES_END";
const transitionalNotificationCreateRules = `      // COMMUNITY_NOTIFICATION_CREATE_RULES_START
      allow create: if verifiedUser()
        && request.resource.data.recipientId == userId
        && request.resource.data.actorId == request.auth.uid
        && request.resource.data.postId is string
        && request.resource.data.postId.size() > 0
        && request.resource.data.type in ['like', 'comment']
        && request.resource.data.read == false
        && request.resource.data.createdAt == request.time;
      // COMMUNITY_NOTIFICATION_CREATE_RULES_END`;
const transitionalPostUpdateRules = `      // COMMUNITY_POST_UPDATE_RULES_START
      allow update: if verifiedUser()
        && (
          (
            request.resource.data.diff(resource.data).affectedKeys().hasOnly([
              'likeCount', 'commentCount', 'saveCount', 'lastActivityAt'
            ])
            && request.resource.data.lastActivityAt == request.time
            && optionalCount(request.resource.data, 'likeCount')
            && optionalCount(request.resource.data, 'commentCount')
            && optionalCount(request.resource.data, 'saveCount')
          )
          || (
            resource.data.authorId == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
              'category', 'content', 'moduleCode', 'tags', 'updatedAt',
              'isAnswered', 'acceptedCommentId', 'acceptedAnswerPreview',
              'acceptedAnswerAuthorId', 'acceptedAnswerAuthorName', 'answeredAt',
              'lastActivityAt'
            ])
          )
          || (
            isCommunityAdmin()
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
              'category', 'content', 'moduleCode', 'tags', 'updatedAt',
              'isAnswered', 'acceptedCommentId', 'acceptedAnswerPreview',
              'acceptedAnswerAuthorId', 'acceptedAnswerAuthorName', 'answeredAt',
              'lastActivityAt', 'isOfficial', 'pinned', 'pinnedAt'
            ])
          )
        );
      // COMMUNITY_POST_UPDATE_RULES_END`;

export function createTransitionalRules(strictRules) {
  if (!strictRules.includes(strictMarker)) {
    throw new Error("The Firestore strict-mode marker is missing or changed.");
  }

  const updateStartIndex = strictRules.indexOf(postUpdateStart);
  const updateEndIndex = strictRules.indexOf(postUpdateEnd);
  if (updateStartIndex < 0 || updateEndIndex < updateStartIndex) {
    throw new Error("The community post update rule markers are missing or invalid.");
  }

  const notificationStartIndex = strictRules.indexOf(notificationCreateStart);
  const notificationEndIndex = strictRules.indexOf(notificationCreateEnd);
  if (notificationStartIndex < 0 || notificationEndIndex < notificationStartIndex) {
    throw new Error("The community notification rule markers are missing or invalid.");
  }

  const afterUpdateRules = updateEndIndex + postUpdateEnd.length;
  const rulesWithTransitionalPostUpdates =
    strictRules.slice(0, updateStartIndex) +
    transitionalPostUpdateRules +
    strictRules.slice(afterUpdateRules);
  const generatedNotificationStart = rulesWithTransitionalPostUpdates.indexOf(notificationCreateStart);
  const generatedNotificationEnd = rulesWithTransitionalPostUpdates.indexOf(notificationCreateEnd);
  const afterNotificationRules = generatedNotificationEnd + notificationCreateEnd.length;

  return (
    rulesWithTransitionalPostUpdates.slice(0, generatedNotificationStart) +
    transitionalNotificationCreateRules +
    rulesWithTransitionalPostUpdates.slice(afterNotificationRules)
  ).replace(strictMarker, transitionalMarker);
}

async function main() {
  const strictRules = await readFile(strictRulesPath, "utf8");
  const transitionalRules = createTransitionalRules(strictRules);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, transitionalRules, "utf8");
  console.log(`Generated transitional rules at ${path.relative(projectRoot, outputPath)}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
