/* eslint-env node */
import * as functions from "firebase-functions";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import cors from "cors";
import express from "express";

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

api.post("/send-verification", async (req, res) => {
  try {
    const { email, idToken } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "A valid email is required." });
    }

    if (idToken) {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      if (decodedToken.email && decodedToken.email !== email) {
        return res.status(403).json({ error: "Email mismatch for authenticated user." });
      }
    }

    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: process.env.VERIFICATION_CONTINUE_URL || "https://gradiate.co.za/auth",
      handleCodeInApp: false,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: "RESEND_API_KEY is not configured." });
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Gradiate <noreply@gradiate.co.za>",
      to: email,
      subject: "Verify your Gradiate account",
      html: verificationEmailTemplate(verificationLink),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in /api/send-verification:", error);
    return res.status(500).json({ error: error.message || "Failed to send verification email." });
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
            title: title.trim(),
            message: message.trim(),
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


