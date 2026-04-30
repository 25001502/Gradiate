/* eslint-env node */
import * as functions from "firebase-functions";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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


