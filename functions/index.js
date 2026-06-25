/* eslint-env node */
import * as functions from "firebase-functions";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import cors from "cors";
import express from "express";

import { createHash } from "node:crypto";
import process from "node:process";
import { Resend } from "resend";

const firebaseProjectId = process.env.ADMIN_PROJECT_ID;
const firebaseClientEmail = process.env.ADMIN_CLIENT_EMAIL;
const firebasePrivateKey = process.env.ADMIN_PRIVATE_KEY;
const isFunctionsEmulator = process.env.FUNCTIONS_EMULATOR === "true";

if (!getApps().length) {
  if (!isFunctionsEmulator && firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
    initializeApp({
      credential: cert({
        projectId: firebaseProjectId,
        clientEmail: firebaseClientEmail,
        privateKey: firebasePrivateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    initializeApp();
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

// ---------------------------------------------------------------------------
// Admin middleware — verifies the caller's ID token and checks admins/{uid}
// ---------------------------------------------------------------------------
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing auth token." });

    const decoded = await adminAuth.verifyIdToken(token);
    const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();
    if (!adminDoc.exists) return res.status(403).json({ error: "Admin access required." });

    req.adminUid = decoded.uid;
    req.adminData = adminDoc.data();
    next();
  } catch (err) {
    console.error("requireAdmin:", err.message);
    return res.status(401).json({ error: "Invalid or expired auth token." });
  }
}



const api = express();
api.use(cors({ origin: true }));
api.use(express.json());

const EMAIL_VERIFICATION_COOLDOWN_MS = 5 * 60 * 1000;
const VERIFICATION_RATE_LIMITS = {
  emailDailyMax: 5,
  connectionWindowMs: 15 * 60 * 1000,
  connectionWindowMax: 3,
  connectionDailyMax: 10,
  clientWindowMs: 60 * 60 * 1000,
  clientWindowMax: 3,
  clientDailyMax: 8,
};
const PASSWORD_RESET_COOLDOWN_MS = 10 * 60 * 1000;
const PASSWORD_RESET_RATE_LIMITS = {
  emailDailyMax: 3,
  connectionWindowMs: 15 * 60 * 1000,
  connectionWindowMax: 10,
  connectionDailyMax: 50,
  clientWindowMs: 60 * 60 * 1000,
  clientWindowMax: 3,
  clientDailyMax: 8,
};

class RateLimitError extends Error {
  constructor(message, retryAfterSeconds, code = "rate_limited") {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.code = code;
  }
}

function hashValue(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getRequestIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const rawForwardedFor = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return String(rawForwardedFor || req.ip || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim() || "unknown";
}

function normalizeClientId(clientId) {
  const normalized = String(clientId || "").trim();
  if (!normalized || normalized.length > 128) {
    return null;
  }
  return normalized;
}

function getUtcDayKey(nowMs) {
  return new Date(nowMs).toISOString().slice(0, 10);
}

function getNextUtcDayMs(nowMs) {
  const now = new Date(nowMs);
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
}

function secondsUntil(targetMs, nowMs) {
  return Math.max(1, Math.ceil((targetMs - nowMs) / 1000));
}

function getRateState(snapshot, config, nowMs, dayKey) {
  const data = snapshot.exists ? snapshot.data() : {};
  const dayCount = data.dayKey === dayKey ? Number(data.dayCount) || 0 : 0;
  const lastSentAtMs = Number(data.lastSentAtMs) || 0;

  let windowStartMs = nowMs;
  let windowCount = 0;
  if (config.windowMs) {
    const existingWindowStartMs = Number(data.windowStartMs) || 0;
    const existingWindowActive =
      existingWindowStartMs > 0 && nowMs - existingWindowStartMs < config.windowMs;

    windowStartMs = existingWindowActive ? existingWindowStartMs : nowMs;
    windowCount = existingWindowActive ? Number(data.windowCount) || 0 : 0;
  }

  return {
    dayCount,
    lastSentAtMs,
    windowStartMs,
    windowCount,
  };
}

function assertRateLimit(config, state, nowMs, emailKind = "verification") {
  if (
    config.cooldownMs &&
    state.lastSentAtMs &&
    nowMs - state.lastSentAtMs < config.cooldownMs
  ) {
    throw new RateLimitError(
      `Please wait before requesting another ${emailKind} email.`,
      secondsUntil(state.lastSentAtMs + config.cooldownMs, nowMs),
      "cooldown"
    );
  }

  if (config.dailyMax && state.dayCount >= config.dailyMax) {
    throw new RateLimitError(
      `Too many ${emailKind} email requests today. Please try again later.`,
      secondsUntil(getNextUtcDayMs(nowMs), nowMs)
    );
  }

  if (
    config.windowMs &&
    config.windowMax &&
    state.windowCount >= config.windowMax
  ) {
    throw new RateLimitError(
      `Too many ${emailKind} email requests. Please wait before trying again.`,
      secondsUntil(state.windowStartMs + config.windowMs, nowMs)
    );
  }
}

async function enforceVerificationRateLimit({ emailHash, connectionHash, clientHash, uid, reason }) {
  const nowMs = Date.now();
  const dayKey = getUtcDayKey(nowMs);
  const rateLimitCollection = adminDb.collection("verificationRateLimits");
  const configs = [
    {
      kind: "email",
      ref: rateLimitCollection.doc(`email_${emailHash}`),
      cooldownMs: EMAIL_VERIFICATION_COOLDOWN_MS,
      dailyMax: VERIFICATION_RATE_LIMITS.emailDailyMax,
    },
    {
      kind: "connection",
      ref: rateLimitCollection.doc(`connection_${connectionHash}`),
      windowMs: VERIFICATION_RATE_LIMITS.connectionWindowMs,
      windowMax: VERIFICATION_RATE_LIMITS.connectionWindowMax,
      dailyMax: VERIFICATION_RATE_LIMITS.connectionDailyMax,
    },
  ];

  if (clientHash) {
    configs.push({
      kind: "client",
      ref: rateLimitCollection.doc(`client_${clientHash}`),
      windowMs: VERIFICATION_RATE_LIMITS.clientWindowMs,
      windowMax: VERIFICATION_RATE_LIMITS.clientWindowMax,
      dailyMax: VERIFICATION_RATE_LIMITS.clientDailyMax,
    });
  }

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await Promise.all(configs.map((config) => transaction.get(config.ref)));
    const states = snapshots.map((snapshot, index) =>
      getRateState(snapshot, configs[index], nowMs, dayKey)
    );

    configs.forEach((config, index) => {
      assertRateLimit(config, states[index], nowMs);
    });

    configs.forEach((config, index) => {
      const state = states[index];
      const nextData = {
        kind: config.kind,
        dayKey,
        dayCount: state.dayCount + 1,
        lastSentAtMs: nowMs,
        updatedAt: FieldValue.serverTimestamp(),
        lastReason: reason,
      };

      if (uid) {
        nextData.uidHash = hashValue(uid);
      }

      if (config.windowMs) {
        nextData.windowStartMs = state.windowStartMs;
        nextData.windowCount = state.windowCount + 1;
      }

      transaction.set(config.ref, nextData, { merge: true });
    });
  });
}

async function enforcePasswordResetRateLimit({ emailHash, connectionHash, clientHash, reason }) {
  const nowMs = Date.now();
  const dayKey = getUtcDayKey(nowMs);
  const rateLimitCollection = adminDb.collection("passwordResetRateLimits");
  const configs = [
    {
      kind: "email",
      ref: rateLimitCollection.doc(`email_${emailHash}`),
      cooldownMs: PASSWORD_RESET_COOLDOWN_MS,
      dailyMax: PASSWORD_RESET_RATE_LIMITS.emailDailyMax,
    },
    {
      kind: "connection",
      ref: rateLimitCollection.doc(`connection_${connectionHash}`),
      windowMs: PASSWORD_RESET_RATE_LIMITS.connectionWindowMs,
      windowMax: PASSWORD_RESET_RATE_LIMITS.connectionWindowMax,
      dailyMax: PASSWORD_RESET_RATE_LIMITS.connectionDailyMax,
    },
  ];

  if (clientHash) {
    configs.push({
      kind: "client",
      ref: rateLimitCollection.doc(`client_${clientHash}`),
      windowMs: PASSWORD_RESET_RATE_LIMITS.clientWindowMs,
      windowMax: PASSWORD_RESET_RATE_LIMITS.clientWindowMax,
      dailyMax: PASSWORD_RESET_RATE_LIMITS.clientDailyMax,
    });
  }

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await Promise.all(configs.map((config) => transaction.get(config.ref)));
    const states = snapshots.map((snapshot, index) =>
      getRateState(snapshot, configs[index], nowMs, dayKey)
    );

    configs.forEach((config, index) => {
      assertRateLimit(config, states[index], nowMs, "password reset");
    });

    configs.forEach((config, index) => {
      const state = states[index];
      const nextData = {
        kind: config.kind,
        dayKey,
        dayCount: state.dayCount + 1,
        lastSentAtMs: nowMs,
        updatedAt: FieldValue.serverTimestamp(),
        lastReason: reason,
      };

      if (config.windowMs) {
        nextData.windowStartMs = state.windowStartMs;
        nextData.windowCount = state.windowCount + 1;
      }

      transaction.set(config.ref, nextData, { merge: true });
    });
  });
}

function verificationEmailTemplate(verificationLink) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:24px;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0f172a;padding:20px 24px;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;">Gradiate</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:.9;">Verify your email to continue</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px;line-height:1.6;">Welcome to Gradiate. Please confirm your email address to activate your account.</p>
        <a href="${verificationLink}" style="display:inline-block;margin:12px 0;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Verify Email</a>
        <p style="margin:12px 0 0;line-height:1.6;font-size:13px;color:#4b5563;">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;font-size:12px;color:#1d4ed8;">${verificationLink}</p>
      </div>
    </div>
  </div>`;
}

function passwordResetEmailTemplate(passwordResetLink) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:24px;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0f172a;padding:20px 24px;color:#ffffff;">
        <h1 style="margin:0;font-size:24px;">Gradiate</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:.9;">Reset your password securely</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px;line-height:1.6;">We received a request to reset your Gradiate password.</p>
        <a href="${passwordResetLink}" style="display:inline-block;margin:12px 0;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
        <p style="margin:12px 0;line-height:1.6;font-size:13px;color:#4b5563;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
        <p style="margin:12px 0 0;line-height:1.6;font-size:13px;color:#4b5563;">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;font-size:12px;color:#1d4ed8;">${passwordResetLink}</p>
      </div>
    </div>
  </div>`;
}

api.post(["/send-verification", "/api/send-verification"], async (req, res) => {
  try {
    const { email, idToken, clientId, reason } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const safeReason = String(reason || "manual").trim().slice(0, 32) || "manual";

    if (
      !normalizedEmail ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    let decodedUid = null;
    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      decodedUid = decodedToken.uid;
      if (decodedToken.email && normalizeEmail(decodedToken.email) !== normalizedEmail) {
        return res.status(403).json({ error: "Email mismatch for authenticated user." });
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured." });
    }

    const authUser = await adminAuth.getUserByEmail(normalizedEmail).catch((error) => {
      if (error.code === "auth/user-not-found") {
        return null;
      }
      throw error;
    });

    if (!authUser) {
      return res.status(200).json({ success: true, skipped: true });
    }

    if (authUser.emailVerified) {
      return res.status(200).json({ success: true, alreadyVerified: true });
    }

    const emailHash = hashValue(normalizedEmail);
    const connectionHash = hashValue(getRequestIp(req));
    const normalizedClientId = normalizeClientId(clientId);
    const clientHash = normalizedClientId ? hashValue(normalizedClientId) : null;

    await enforceVerificationRateLimit({
      emailHash,
      connectionHash,
      clientHash,
      uid: decodedUid || authUser.uid,
      reason: safeReason,
    });

    const verificationLink = await adminAuth.generateEmailVerificationLink(normalizedEmail, {
      url: process.env.VERIFICATION_CONTINUE_URL || "https://gradiate.co.za/auth",
      handleCodeInApp: false,
    });

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Gradiate <noreply@gradiate.co.za>",
      to: normalizedEmail,
      subject: "Verify your Gradiate account",
      html: verificationEmailTemplate(verificationLink),
    });

    try {
      await adminDb.collection("verificationEmailRequests").add({
        emailHash,
        connectionHash,
        clientHash: clientHash || null,
        uidHash: hashValue(authUser.uid),
        reason: safeReason,
        status: "sent",
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error("Failed to write verification email audit log:", logError.message);
    }

    return res.status(200).json({
      success: true,
      cooldownSeconds: Math.ceil(EMAIL_VERIFICATION_COOLDOWN_MS / 1000),
    });
  } catch (error) {
    if (error instanceof RateLimitError || error.name === "RateLimitError") {
      return res
        .status(429)
        .set("Retry-After", String(error.retryAfterSeconds))
        .json({
          error: error.message,
          code: error.code,
          retryAfterSeconds: error.retryAfterSeconds,
        });
    }

    console.error("Error in /api/send-verification:", error);
    return res.status(500).json({ error: error.message || "Failed to send verification email." });
  }
});

api.post(["/send-password-reset", "/api/send-password-reset"], async (req, res) => {
  const neutralResponse = {
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  };

  try {
    const { email, clientId, reason } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const safeReason = String(reason || "wrong_password").trim().slice(0, 32) || "wrong_password";

    if (
      !normalizedEmail ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: "Password reset email service is not configured." });
    }

    const emailHash = hashValue(normalizedEmail);
    const connectionHash = hashValue(getRequestIp(req));
    const normalizedClientId = normalizeClientId(clientId);
    const clientHash = normalizedClientId ? hashValue(normalizedClientId) : null;

    await enforcePasswordResetRateLimit({
      emailHash,
      connectionHash,
      clientHash,
      reason: safeReason,
    });

    const authUser = await adminAuth.getUserByEmail(normalizedEmail).catch((error) => {
      if (error.code === "auth/user-not-found") {
        return null;
      }
      throw error;
    });

    if (!authUser) {
      return res.status(200).json({
        ...neutralResponse,
        cooldownSeconds: Math.ceil(PASSWORD_RESET_COOLDOWN_MS / 1000),
      });
    }

    const passwordResetLink = await adminAuth.generatePasswordResetLink(normalizedEmail, {
      url: process.env.PASSWORD_RESET_CONTINUE_URL || "https://gradiate.co.za/auth",
      handleCodeInApp: false,
    });

    const resend = new Resend(resendApiKey);
    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Gradiate <noreply@gradiate.co.za>",
      to: normalizedEmail,
      subject: "Reset your Gradiate password",
      html: passwordResetEmailTemplate(passwordResetLink),
    });

    if (resendError) {
      throw new Error(resendError.message || "Resend failed to send the password reset email.");
    }

    try {
      await adminDb.collection("passwordResetEmailRequests").add({
        emailHash,
        connectionHash,
        clientHash: clientHash || null,
        uidHash: hashValue(authUser.uid),
        reason: safeReason,
        status: "sent",
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error("Failed to write password reset email audit log:", logError.message);
    }

    return res.status(200).json({
      ...neutralResponse,
      cooldownSeconds: Math.ceil(PASSWORD_RESET_COOLDOWN_MS / 1000),
    });
  } catch (error) {
    if (error instanceof RateLimitError || error.name === "RateLimitError") {
      return res
        .status(429)
        .set("Retry-After", String(error.retryAfterSeconds))
        .json({
          error: error.message,
          code: error.code,
          retryAfterSeconds: error.retryAfterSeconds,
        });
    }

    console.error("Error in /api/send-password-reset:", error);
    return res.status(500).json({ error: "Failed to send password reset email." });
  }
});

export const apiRouter = functions.https.onRequest(api);

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

// POST /api/admin/announce — broadcast in-app notification to all users
api.post("/admin/announce", requireAdmin, async (req, res) => {
  try {
    const { title, message } = req.body || {};
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Announcement title is required." });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Announcement message is required." });
    }

    const adminUser = await adminAuth.getUser(req.adminUid);

    // Page through all users and write a notification for each
    let pageToken;
    let recipientCount = 0;
    const batchSize = 400; // Firestore batch limit is 500

    do {
      const listResult = await adminAuth.listUsers(1000, pageToken);
      pageToken = listResult.pageToken;

      // Write in chunks of batchSize to stay under Firestore batch limits
      for (let i = 0; i < listResult.users.length; i += batchSize) {
        const chunk = listResult.users.slice(i, i + batchSize);
        const batch = adminDb.batch();

        for (const targetUser of chunk) {
          if (targetUser.disabled) continue;
          const notifRef = adminDb
            .collection("users")
            .doc(targetUser.uid)
            .collection("notifications")
            .doc();

          batch.set(notifRef, {
            recipientId: targetUser.uid,
            actorId: req.adminUid,
            actorName: adminUser.displayName || "Gradiate Admin",
            actorPhotoURL: adminUser.photoURL || "",
            type: "adminAnnouncement",
            notificationType: "adminAnnouncement",
            category: "announcement",
            title: title.trim(),
            message: message.trim(),
            postId: null,
            postPreview: "",
            commentId: "",
            commentPreview: "",
            read: false,
            createdAt: FieldValue.serverTimestamp(),
          });
          recipientCount++;
        }

        await batch.commit();
      }
    } while (pageToken);

    // Audit log
    await adminDb.collection("adminAuditLog").add({
      action: "announce",
      adminUid: req.adminUid,
      title: title.trim(),
      message: message.trim(),
      recipientCount,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, recipientCount });
  } catch (err) {
    console.error("POST /admin/announce:", err.message);
    return res.status(500).json({ error: err.message || "Failed to send announcement." });
  }
});

// GET /api/admin/users — list all Firebase Auth users
api.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = [];
    let pageToken;

    do {
      const result = await adminAuth.listUsers(1000, pageToken);
      pageToken = result.pageToken;
      for (const u of result.users) {
        users.push({
          uid: u.uid,
          email: u.email || null,
          displayName: u.displayName || null,
          photoURL: u.photoURL || null,
          disabled: u.disabled,
          createdAt: u.metadata.creationTime || null,
          lastSignIn: u.metadata.lastSignInTime || null,
        });
      }
    } while (pageToken);

    // Most-recent first
    users.sort((a, b) => (b.createdAt || "") > (a.createdAt || "") ? 1 : -1);

    return res.status(200).json({ users });
  } catch (err) {
    console.error("GET /admin/users:", err.message);
    return res.status(500).json({ error: err.message || "Failed to list users." });
  }
});

// POST /api/admin/force-signout/:targetUid — invalidate all sessions for a user
api.post("/admin/force-signout/:targetUid", requireAdmin, async (req, res) => {
  try {
    const { targetUid } = req.params;
    if (!targetUid) return res.status(400).json({ error: "targetUid is required." });

    // Write globalSignOutAt so AuthContext triggers client-side sign-out
    await adminDb.collection("users").doc(targetUid).set(
      { globalSignOutAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    // Also revoke refresh tokens (belt & suspenders)
    await adminAuth.revokeRefreshTokens(targetUid);

    await adminDb.collection("adminAuditLog").add({
      action: "forceSignOut",
      adminUid: req.adminUid,
      targetUid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST /admin/force-signout:", err.message);
    return res.status(500).json({ error: err.message || "Failed to force sign-out." });
  }
});

// POST /api/admin/disable-user/:targetUid
api.post("/admin/disable-user/:targetUid", requireAdmin, async (req, res) => {
  try {
    const { targetUid } = req.params;
    if (!targetUid) return res.status(400).json({ error: "targetUid is required." });
    if (targetUid === req.adminUid) {
      return res.status(400).json({ error: "Cannot disable your own account." });
    }

    await adminAuth.updateUser(targetUid, { disabled: true });

    await adminDb.collection("adminAuditLog").add({
      action: "disableUser",
      adminUid: req.adminUid,
      targetUid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST /admin/disable-user:", err.message);
    return res.status(500).json({ error: err.message || "Failed to disable user." });
  }
});

// POST /api/admin/enable-user/:targetUid
api.post("/admin/enable-user/:targetUid", requireAdmin, async (req, res) => {
  try {
    const { targetUid } = req.params;
    if (!targetUid) return res.status(400).json({ error: "targetUid is required." });

    await adminAuth.updateUser(targetUid, { disabled: false });

    await adminDb.collection("adminAuditLog").add({
      action: "enableUser",
      adminUid: req.adminUid,
      targetUid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST /admin/enable-user:", err.message);
    return res.status(500).json({ error: err.message || "Failed to enable user." });
  }
});

