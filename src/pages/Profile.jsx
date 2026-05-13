import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl, AVATAR_STYLES, DEFAULT_AVATAR_STYLE } from "../utils/avatarUtils";
import avDefault from "../images/default-avatar.jpg";
import {
  updateProfile,
  signOut,
  deleteUser,
  updatePassword,
  reload,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  FaBell,
  FaBookmark,
  FaComments,
  FaPencilAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserCircle,
  FaHome,
  FaUsers,
} from "react-icons/fa";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import { routes } from "../lib/routes";
import { createCommunityPostPath } from "../lib/communityHelpers";
import SEO from '../components/SEO';

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { key: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { key: "number", label: "One number", test: (value) => /\d/.test(value) },
  { key: "symbol", label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const getPasswordStrength = (password = "") => {
  const checks = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(password),
  }));
  const passedCount = checks.filter((check) => check.passed).length;
  const ratio = checks.length ? passedCount / checks.length : 0;

  let label = "Very Weak";
  let color = "#dc2626";
  if (ratio >= 1) {
    label = "Strong";
    color = "#16a34a";
  } else if (ratio >= 0.8) {
    label = "Good";
    color = "#65a30d";
  } else if (ratio >= 0.6) {
    label = "Fair";
    color = "#d97706";
  } else if (ratio >= 0.4) {
    label = "Weak";
    color = "#ea580c";
  }

  return {
    checks,
    score: passedCount,
    ratio,
    label,
    color,
    isValid: checks.every((check) => check.passed),
  };
};

const formatSecurityDate = (value) => {
  if (!value) {
    return "Not available";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }
  return parsed.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCommunityDate = (value) => {
  const parsed = typeof value?.toDate === "function" ? value.toDate() : value ? new Date(value) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  return parsed.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sortByNewestCommunityDate = (items, field = "createdAt") =>
  [...items].sort((a, b) => {
    const aTime = typeof a[field]?.toMillis === "function" ? a[field].toMillis() : 0;
    const bTime = typeof b[field]?.toMillis === "function" ? b[field].toMillis() : 0;
    return bTime - aTime;
  });

const getDeviceDescriptor = () => {
  if (typeof navigator === "undefined") {
    return { browser: "Unknown Browser", platform: "Unknown Device" };
  }

  const userAgent = navigator.userAgent || "";
  let browser = "Unknown Browser";

  if (userAgent.includes("Edg/")) browser = "Microsoft Edge";
  else if (userAgent.includes("Chrome/")) browser = "Google Chrome";
  else if (userAgent.includes("Firefox/")) browser = "Mozilla Firefox";
  else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) browser = "Safari";

  const platform = navigator.platform || "Unknown Device";
  return { browser, platform };
};

const getSecurityActivityKey = (uid) => `gradiate_security_activity_${uid}`;

const defaultProfileData = {
  academicStage: "tertiary",
  bio: "",
  location: "",
  phone: "",
  institution: "",
  qualification: "",
  gradYear: "",
  careerGoal: "",
  skills: "",
  highSchoolName: "",
  highSchoolGrade: "",
  highSchoolStatus: "",
  matricYear: "",
  highSchoolSubjects: "",
};

const normalizeProfileData = (data = {}) => {
  const hasHighSchoolData = Boolean(
    data.highSchoolName ||
      data.highSchoolGrade ||
      data.highSchoolStatus ||
      data.matricYear ||
      data.highSchoolSubjects
  );

  return {
    academicStage: data.academicStage || (hasHighSchoolData ? "highSchool" : "tertiary"),
    bio: data.bio || "",
    location: data.location || "",
    phone: data.phone || "",
    institution: data.institution || "",
    qualification: data.qualification || "",
    gradYear: data.gradYear || "",
    careerGoal: data.careerGoal || "",
    skills: data.skills || "",
    highSchoolName: data.highSchoolName || "",
    highSchoolGrade: data.highSchoolGrade || "",
    highSchoolStatus: data.highSchoolStatus || "",
    matricYear: data.matricYear || "",
    highSchoolSubjects: data.highSchoolSubjects || "",
  };
};

const highSchoolFieldNames = [
  "highSchoolName",
  "highSchoolGrade",
  "highSchoolStatus",
  "matricYear",
  "highSchoolSubjects",
];

const tertiaryFieldNames = ["institution", "qualification", "gradYear", "skills"];

const avatarMap = {
  default: avDefault,
};

const resolveAvatarFromKey = (key) => {
  if (!key) return "";
  return avatarMap[key] || "";
};

const inferAvatarKeyFromUrl = (url = "") => {
  const normalized = String(url).toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("default-avatar")) return "default";
  if (normalized.includes("team1")) return "team1";
  if (normalized.includes("team2")) return "team2";
  if (normalized.includes("team3")) return "team3";
  return "";
};

const Profile = () => {
  const verificationEndpoint =
    import.meta.env.VITE_SEND_VERIFICATION_ENDPOINT || "/api/send-verification";

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarKey, setAvatarKey] = useState("");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState("");
  const [savedAvatarKey, setSavedAvatarKey] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarStyle, setAvatarStyle] = useState(DEFAULT_AVATAR_STYLE);
  const [savedAvatarSeed, setSavedAvatarSeed] = useState("");
  const [savedAvatarStyle, setSavedAvatarStyle] = useState(DEFAULT_AVATAR_STYLE);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [savedProfileData, setSavedProfileData] = useState(defaultProfileData);
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [savedCommunityPosts, setSavedCommunityPosts] = useState([]);
  const [communityNotifications, setCommunityNotifications] = useState([]);
  const menuRef = useRef(null);
  const deviceDescriptor = useMemo(() => getDeviceDescriptor(), []);
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          setEmailVerified(Boolean(currentUser.emailVerified));
          const inferredFallbackKey = inferAvatarKeyFromUrl(currentUser.photoURL || "");
          const fallbackAvatar =
            resolveAvatarFromKey(inferredFallbackKey) || currentUser.photoURL || "";
          setAvatarKey(inferredFallbackKey);
          setAvatarUrl(fallbackAvatar);
          setSavedAvatarKey(inferredFallbackKey);
          setSavedAvatarUrl(fallbackAvatar);

          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const resolvedAvatarKey =
              data.avatarKey || inferAvatarKeyFromUrl(data.photoURL || currentUser.photoURL || "");
            // Generated avatar takes priority; fall back to legacy avatarKey/photoURL
            const seed = data.avatarSeed || currentUser.uid;
            const style = data.avatarStyle || DEFAULT_AVATAR_STYLE;
            const resolvedAvatar = getAvatarUrl(seed, style) ||
              resolveAvatarFromKey(resolvedAvatarKey) || data.photoURL || currentUser.photoURL || "";
            const resolvedProfile = normalizeProfileData(data);
            setAvatarKey(resolvedAvatarKey);
            setAvatarUrl(resolvedAvatar);
            setSavedAvatarKey(resolvedAvatarKey);
            setSavedAvatarUrl(resolvedAvatar);
            setAvatarSeed(seed);
            setAvatarStyle(style);
            setSavedAvatarSeed(seed);
            setSavedAvatarStyle(style);
            setProfileData(resolvedProfile);
            setSavedProfileData(resolvedProfile);
          } else {
            // No Firestore doc yet — generate avatar from UID
            const seed = currentUser.uid;
            const style = DEFAULT_AVATAR_STYLE;
            const generatedUrl = getAvatarUrl(seed, style);
            setAvatarKey(inferredFallbackKey);
            setSavedAvatarKey(inferredFallbackKey);
            setAvatarSeed(seed);
            setAvatarStyle(style);
            setSavedAvatarSeed(seed);
            setSavedAvatarStyle(style);
            setAvatarUrl(generatedUrl);
            setSavedAvatarUrl(generatedUrl);
            setProfileData(defaultProfileData);
            setSavedProfileData(defaultProfileData);
          }
        } else {
          setUser(null);
          setEmailVerified(false);
          setAvatarKey("");
          setAvatarUrl("");
          setSavedAvatarKey("");
          setSavedAvatarUrl("");
          setAvatarSeed("");
          setAvatarStyle(DEFAULT_AVATAR_STYLE);
          setSavedAvatarSeed("");
          setSavedAvatarStyle(DEFAULT_AVATAR_STYLE);
          setProfileData(defaultProfileData);
          setSavedProfileData(defaultProfileData);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setCommunityPosts([]);
      setSavedCommunityPosts([]);
      setCommunityNotifications([]);
      return undefined;
    }

    const postsUnsubscribe = onSnapshot(
      query(collection(db, "communityPosts"), where("authorId", "==", user.uid), limit(8)),
      (snapshot) => {
        setCommunityPosts(sortByNewestCommunityDate(snapshot.docs.map((postDoc) => ({
          id: postDoc.id,
          ...postDoc.data(),
        }))));
      }
    );

    const savedUnsubscribe = onSnapshot(
      collection(db, "users", user.uid, "savedCommunityPosts"),
      (snapshot) => {
        setSavedCommunityPosts(sortByNewestCommunityDate(
          snapshot.docs.map((savedDoc) => ({ id: savedDoc.id, ...savedDoc.data() })),
          "savedAt"
        ));
      }
    );

    const notificationsUnsubscribe = onSnapshot(
      query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("createdAt", "desc"),
        limit(8)
      ),
      (snapshot) => {
        setCommunityNotifications(snapshot.docs.map((notificationDoc) => ({
          id: notificationDoc.id,
          ...notificationDoc.data(),
        })));
      }
    );

    return () => {
      postsUnsubscribe();
      savedUnsubscribe();
      notificationsUnsubscribe();
    };
  }, [user?.uid]);

  // Allow selecting from generated DiceBear styles (same seed, different style = different look)
  const avatarOptions = AVATAR_STYLES.map((s) => ({
    key: s.key,
    label: s.label,
    url: getAvatarUrl(avatarSeed || user?.uid || "default", s.key),
  }));

  const selectAvatar = (option) => {
    setAvatarStyle(option.key);
    setAvatarUrl(getAvatarUrl(avatarSeed || user?.uid || "default", option.key));
    setShowAvatarPicker(false);
    setError(null);
    setSuccess("");
  };

  const shuffleAvatarSeed = () => {
    const newSeed = `${user?.uid || "user"}-${Date.now()}`;
    setAvatarSeed(newSeed);
    setAvatarUrl(getAvatarUrl(newSeed, avatarStyle));
  };

  const addSecurityActivity = (action, status = "info") => {
    if (!user?.uid) {
      return;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action,
      status,
      at: new Date().toISOString(),
    };

    setActivityLog((prev) => {
      const next = [entry, ...prev].slice(0, 8);
      try {
        localStorage.setItem(getSecurityActivityKey(user.uid), JSON.stringify(next));
      } catch (storageError) {
        console.warn("Failed to persist security activity log", storageError);
      }
      return next;
    });
  };

  const handleFieldChange = (field, value) => {
    setProfileData((prev) => {
      const next = { ...prev, [field]: value };
      const hasValue = String(value || "").trim() !== "";

      // Smart switching: infer stage when users type into stage-specific fields.
      if (field !== "academicStage" && hasValue) {
        if (highSchoolFieldNames.includes(field)) {
          next.academicStage = "highSchool";
        } else if (tertiaryFieldNames.includes(field)) {
          next.academicStage = "tertiary";
        }
      }

      return next;
    });
    setError(null);
    setSuccess("");
  };

  const handleLogout = async () => {
    try {
      addSecurityActivity("Signed out this device", "info");
      await signOut(auth);
      // navigate to login or home after logout
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      setError("Failed to logout.");
    }
  };

  const handleSignOutAllSessions = async () => {
    if (!user?.uid) return;

    setSecurityLoading(true);
    setSecurityError("");
    setSecuritySuccess("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          globalSignOutAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      addSecurityActivity("Signed out all sessions", "success");
      await signOut(auth);
      navigate(routes.auth);
    } catch (err) {
      console.error(err);
      setSecurityError("Failed to sign out all sessions.");
      addSecurityActivity("Failed to sign out all sessions", "error");
    } finally {
      setSecurityLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    if (!auth.currentUser) return;
    setSecurityLoading(true);
    setSecurityError("");
    setSecuritySuccess("");

    try {
      await reload(auth.currentUser);
      const isVerified = Boolean(auth.currentUser.emailVerified);
      setEmailVerified(isVerified);
      setSecuritySuccess(isVerified ? "Email is verified." : "Email is still not verified.");
      addSecurityActivity(`Refreshed email verification status (${isVerified ? "verified" : "not verified"})`, "info");
    } catch (err) {
      console.error(err);
      setSecurityError("Failed to refresh verification status.");
      addSecurityActivity("Failed to refresh verification status", "error");
    } finally {
      setSecurityLoading(false);
    }
  };

  const sendVerificationLink = async () => {
    if (!auth.currentUser) return;
    setSecurityLoading(true);
    setSecurityError("");
    setSecuritySuccess("");

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(verificationEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
          idToken,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Verification service is unavailable. Start Firebase Functions emulator or deploy functions.");
        }
        throw new Error(data.error || "Could not send verification email.");
      }

      setSecuritySuccess("Verification email sent. Check your inbox.");
      addSecurityActivity("Sent verification email", "success");
    } catch (err) {
      console.error(err);
      setSecurityError(err.message || "Could not send verification email.");
      addSecurityActivity("Failed to send verification email", "error");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;
    setSecurityError("");
    setSecuritySuccess("");

    if (!newPassword || !confirmPassword) {
      setSecurityError("Please enter and confirm your new password.");
      return;
    }

    if (!passwordStrength.isValid) {
      setSecurityError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match.");
      return;
    }

    setSecurityLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setSecuritySuccess("Password updated successfully.");
      addSecurityActivity("Changed account password", "success");
    } catch (err) {
      console.error(err);
      const code = (err && err.code) || "";
      if (code.includes("requires-recent-login")) {
        setSecurityError("Please log out and log in again, then retry changing your password.");
      } else {
        setSecurityError("Failed to change password.");
      }
      addSecurityActivity("Failed to change account password", "error");
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user?.uid) {
      return;
    }

    setSecurityError("");
    setSecuritySuccess("");

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setSecurityError('Type "DELETE" to confirm account deletion.');
      return;
    }

    const lastSignInMs = new Date(auth.currentUser.metadata?.lastSignInTime || 0).getTime();
    if (!lastSignInMs || Date.now() - lastSignInMs > 10 * 60 * 1000) {
      setSecurityError("For safety, please log out and log in again before deleting your account.");
      return;
    }

    setDeleteLoading(true);
    try {
      const userId = user.uid;

      const bookmarkSnapshot = await getDocs(collection(db, "users", userId, "bookmarks"));
      await Promise.all(bookmarkSnapshot.docs.map((bookmarkDoc) => deleteDoc(bookmarkDoc.ref)));

      const practiceSnapshot = await getDocs(collection(db, "users", userId, "practiceSavedSubjects"));
      await Promise.all(practiceSnapshot.docs.map((savedDoc) => deleteDoc(savedDoc.ref)));

      const savedCommunitySnapshot = await getDocs(collection(db, "users", userId, "savedCommunityPosts"));
      await Promise.all(savedCommunitySnapshot.docs.map((savedDoc) => deleteDoc(savedDoc.ref)));

      const notificationSnapshot = await getDocs(collection(db, "users", userId, "notifications"));
      await Promise.all(notificationSnapshot.docs.map((notificationDoc) => deleteDoc(notificationDoc.ref)));

      await deleteDoc(doc(db, "users", userId));
      try {
        localStorage.removeItem(getSecurityActivityKey(userId));
      } catch (storageError) {
        console.warn("Failed to remove security activity storage", storageError);
      }

      await deleteUser(auth.currentUser);
      navigate(routes.home);
    } catch (err) {
      console.error(err);
      const code = (err?.code || "").toLowerCase();
      if (code.includes("requires-recent-login")) {
        setSecurityError("Please log out and log in again before deleting your account.");
      } else {
        setSecurityError("Failed to delete account. Please try again.");
      }
      addSecurityActivity("Failed account deletion attempt", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          photoURL: avatarUrl,
          avatarKey,
          avatarSeed,
          avatarStyle,
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (auth.currentUser && auth.currentUser.photoURL !== avatarUrl) {
        await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      }

      setSavedAvatarKey(avatarKey);
      setSavedAvatarUrl(avatarUrl);
      setSavedAvatarSeed(avatarSeed);
      setSavedAvatarStyle(avatarStyle);
      setSavedProfileData(profileData);
      setShowAvatarPicker(false);
      setError(null);
      setSuccess("Profile saved successfully.");
      setActiveTab("overview");
    } catch (err) {
      console.error(err);
      // If Firestore write blocked, try to at least update Auth profile with photoURL
      const code = err && (err.code || "").toLowerCase();
      if (
        code.includes("permission") ||
        code.includes("denied") ||
        code.includes("missing") ||
        code.includes("insufficient")
      ) {
        try {
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: avatarUrl });
            setSavedAvatarKey(avatarKey);
            setSavedAvatarUrl(avatarUrl);
            setSavedAvatarSeed(avatarSeed);
            setSavedAvatarStyle(avatarStyle);
            setSavedProfileData(profileData);
            setSuccess("Profile photo updated. Other details need Firestore access.");
            setActiveTab("overview");

            return;
          }
        } catch (authErr) {
          console.error("Failed to update Auth profile as fallback", authErr);
        }
      }
      setError(`Failed to save profile${err?.code ? ` (${err.code})` : ""}.`);
    } finally {
      setLoading(false);
    }
  };

  const markCommunityNotificationRead = async (notificationId) => {
    if (!user?.uid) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", notificationId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!user?.uid) {
      setActivityLog([]);
      return;
    }

    try {
      const raw = localStorage.getItem(getSecurityActivityKey(user.uid));
      const parsed = raw ? JSON.parse(raw) : [];
      setActivityLog(Array.isArray(parsed) ? parsed : []);
    } catch (storageError) {
      console.warn("Failed to load security activity log", storageError);
      setActivityLog([]);
    }
  }, [user?.uid]);

  // close menu on outside click or ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      if (menuRef && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, menuRef]);

  const completionChecks = [
    avatarUrl,
    profileData.bio,
    profileData.location,
    profileData.phone,
    profileData.careerGoal,
    ...(profileData.academicStage === "highSchool"
      ? [
          profileData.highSchoolName,
          profileData.highSchoolGrade,
          profileData.highSchoolStatus,
          profileData.matricYear,
          profileData.highSchoolSubjects,
        ]
      : [
          profileData.institution,
          profileData.qualification,
          profileData.gradYear,
          profileData.skills,
        ]),
  ];
  const completedCount = completionChecks.filter((item) => String(item).trim() !== "").length;
  const profileCompletion = Math.round((completedCount / completionChecks.length) * 100);

  if (loading)
    return (
      <div className="loading-container">
        <h1 className="loading-text">
          Loading
          <span className="dot dot1">.</span>
          <span className="dot dot2">.</span>
          <span className="dot dot3">.</span>
        </h1>
      </div>
    );

  if (!user)
    return (
      <div style={{ padding: 20, textAlign: "center" }}>No user logged in.</div>
    );

  const stageLabel = profileData.academicStage === "highSchool" ? "High School" : "Tertiary";
  const skillsCount = profileData.skills
    ? profileData.skills.split(",").filter((skill) => skill.trim()).length
    : 0;
  const unreadCommunityNotifications = communityNotifications.filter((notification) => !notification.read).length;

  return (
    <>
      <SEO
        title="My Profile"
        canonical="/profile"
        noindex
      />
      <nav className="navbar-responsive">
        <div className="navbar-container">
          <a
            className="logo"
            href="#"
            style={{
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#2c3e50",
              textDecoration: "none",
            }}
          >
            Grad<span style={{ color: "#3498db" }}>iate</span>
          </a>
          <div className="nav-actions">
            <button
              className="burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
            </button>
          </div>
          {menuOpen && (
            <div className="burger-menu" ref={menuRef}>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  navigate(routes.application);
                }}
              >
                Application
              </a>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  navigate(routes.practice);
                }}
              >
                Practise
              </a>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  navigate(routes.community);
                }}
              >
                Community
              </a>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  setActiveTab("overview");
                }}
                className="active"
              >
                Profile
              </a>

              <a
                onClick={() => {
                  setMenuOpen(false);
                  alert("Sorry! this feature is not yet available")
                }}
              >
                Bursaries
              </a>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-page">
        <header className="dashboard-welcome">
          <h1 className="dashboard-welcome__greeting">
            Profile Hub for <span>{user.displayName || "Student"}</span>
          </h1>
          <p className="dashboard-welcome__sub">
            Keep your profile, academic details, and security settings in one familiar dashboard flow.
          </p>
        </header>

        <div className="dashboard-shortcuts">



          <button className="dashboard-shortcut" onClick={() => navigate(routes.application)}>
            <FaHome /> Home
          </button>

          

          <button className="dashboard-shortcut" onClick={() => setActiveTab("security")}>
            <FaShieldAlt /> Security
          </button>

          <button className="dashboard-shortcut" onClick={() => setActiveTab("community")}>
            <FaComments /> Community Activity
          </button>

          

          
          
          <button className="dashboard-shortcut" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--blue">{profileCompletion}%</p>
            <p className="dashboard-stat__label">Profile Completion</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">{skillsCount}</p>
            <p className="dashboard-stat__label">Skills Tagged</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--purple">{stageLabel}</p>
            <p className="dashboard-stat__label">Academic Stage</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">{unreadCommunityNotifications}</p>
            <p className="dashboard-stat__label">Community Alerts</p>
          </div>
          
        </div>

        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "overview" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`dashboard-tab ${activeTab === "edit" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Profile
          </button>
          <button
            className={`dashboard-tab ${activeTab === "security" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="uni-grid">
            <article className="uni-card">
              <div className="uni-card__header" style={profileUi.heroHeader}>
                <div style={profileUi.heroIdentityWrap}>
                  <img src={avatarUrl || avDefault} alt="Avatar" style={profileUi.heroAvatar} />
                  <div>
                    <h3 className="uni-card__name" style={{ marginBottom: 4 }}>{user.displayName || "User"}</h3>
                    <p className="uni-card__location" style={{ marginBottom: 0 }}>{profileData.location || "Add your location"}</p>
                    <p style={profileUi.metaLine}>{user.email || "No email"}</p>
                  </div>
                </div>
                
              </div>
              <div className="uni-card__body">
                <p className="uni-card__desc">
                  {profileData.bio || "Add your short bio so opportunities can match your goals better."}
                </p>
                <div style={profileUi.progressRow}>
                  <span style={profileUi.progressLabel}>Completion</span>
                  <span style={profileUi.progressLabel}>{profileCompletion}%</span>
                </div>
                <div style={profileUi.progressTrack}>
                  <div style={{ ...profileUi.progressFill, width: `${profileCompletion}%` }} />
                </div>
                <div className="uni-card__status-row" style={{ marginTop: 12 }}>
                  <span className="uni-card__status-pill uni-card__status-pill--days">Stage: {stageLabel}</span>
                  <span
                    className="uni-card__status-pill"
                    style={emailVerified ? profileUi.verifiedPill : profileUi.pendingPill}
                  >
                    {emailVerified ? "Email Verified" : "Email Not Verified"}
                  </span>
                </div>
              </div>
            </article>

            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Contact</h3>
                <p className="uni-card__desc">Phone: {profileData.phone || "Not added"}</p>
                <p className="uni-card__desc">Location: {profileData.location || "Not added"}</p>
              </div>
            </article>

            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Academic Profile</h3>
                {profileData.academicStage === "highSchool" ? (
                  <>
                    <p className="uni-card__desc">School: {profileData.highSchoolName || "Not added"}</p>
                    <p className="uni-card__desc">Grade: {profileData.highSchoolGrade || "Not added"}</p>
                    <p className="uni-card__desc">Status: {profileData.highSchoolStatus || "Not added"}</p>
                    <p className="uni-card__desc">Matric Year: {profileData.matricYear || "Not added"}</p>
                    <p className="uni-card__desc">Subjects: {profileData.highSchoolSubjects || "Not added"}</p>
                  </>
                ) : (
                  <>
                    <p className="uni-card__desc">Institution: {profileData.institution || "Not added"}</p>
                    <p className="uni-card__desc">Qualification: {profileData.qualification || "Not added"}</p>
                    <p className="uni-card__desc">Graduation Year: {profileData.gradYear || "Not added"}</p>
                  </>
                )}
              </div>
            </article>

            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Career Goals</h3>
                <p className="uni-card__desc">{profileData.careerGoal || "Add your preferred roles and opportunities."}</p>
                <p className="uni-card__desc">Skills: {profileData.skills || "No skills added"}</p>
              </div>
            </article>
          </div>
        )}

        {activeTab === "edit" && (
          <div className="uni-grid" style={{ gridTemplateColumns: "1fr" }}>
            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Edit Profile</h3>
                <p className="uni-card__desc">Update your details so recommendations stay accurate across the platform.</p>

                <div style={profileUi.formGrid}>
                  <label style={profileUi.fieldWrap}>
                    Academic Stage
                    <select
                      style={profileUi.input}
                      value={profileData.academicStage}
                      onChange={(e) => handleFieldChange("academicStage", e.target.value)}
                    >
                      <option value="tertiary">Tertiary / University</option>
                      <option value="highSchool">High School</option>
                    </select>
                  </label>
                  <label style={profileUi.fieldWrap}>
                    Phone Number
                    <input
                      style={profileUi.input}
                      value={profileData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+27 71 234 5678"
                    />
                  </label>
                  <label style={profileUi.fieldWrap}>
                    Location
                    <input
                      style={profileUi.input}
                      value={profileData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="Johannesburg, South Africa"
                    />
                  </label>

                  {profileData.academicStage !== "highSchool" && (
                    <>
                      <label style={profileUi.fieldWrap}>
                        Institution
                        <input
                          style={profileUi.input}
                          value={profileData.institution}
                          onChange={(e) => handleFieldChange("institution", e.target.value)}
                          placeholder="University / College"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        Qualification / Major
                        <input
                          style={profileUi.input}
                          value={profileData.qualification}
                          onChange={(e) => handleFieldChange("qualification", e.target.value)}
                          placeholder="BSc Computer Science"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        Graduation Year
                        <input
                          style={profileUi.input}
                          value={profileData.gradYear}
                          onChange={(e) => handleFieldChange("gradYear", e.target.value)}
                          placeholder="2027"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        Skills (comma separated)
                        <input
                          style={profileUi.input}
                          value={profileData.skills}
                          onChange={(e) => handleFieldChange("skills", e.target.value)}
                          placeholder="React, Communication, Java"
                        />
                      </label>
                    </>
                  )}

                  {profileData.academicStage === "highSchool" && (
                    <>
                      <label style={profileUi.fieldWrap}>
                        High School Name
                        <input
                          style={profileUi.input}
                          value={profileData.highSchoolName}
                          onChange={(e) => handleFieldChange("highSchoolName", e.target.value)}
                          placeholder="Name of your high school"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        Current Grade / Level
                        <input
                          style={profileUi.input}
                          value={profileData.highSchoolGrade}
                          onChange={(e) => handleFieldChange("highSchoolGrade", e.target.value)}
                          placeholder="Grade 11 / Grade 12"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        High School Status
                        <input
                          style={profileUi.input}
                          value={profileData.highSchoolStatus}
                          onChange={(e) => handleFieldChange("highSchoolStatus", e.target.value)}
                          placeholder="Currently enrolled / Completed"
                        />
                      </label>
                      <label style={profileUi.fieldWrap}>
                        Expected Matric Year
                        <input
                          style={profileUi.input}
                          value={profileData.matricYear}
                          onChange={(e) => handleFieldChange("matricYear", e.target.value)}
                          placeholder="2026"
                        />
                      </label>
                    </>
                  )}
                </div>

                <label style={{ ...profileUi.fieldWrap, marginTop: 14 }}>
                  Career Goal
                  <input
                    style={profileUi.input}
                    value={profileData.careerGoal}
                    onChange={(e) => handleFieldChange("careerGoal", e.target.value)}
                    placeholder="Graduate internship in software engineering"
                  />
                </label>

                {profileData.academicStage === "highSchool" && (
                  <label style={{ ...profileUi.fieldWrap, marginTop: 14 }}>
                    High School Subjects (comma separated)
                    <input
                      style={profileUi.input}
                      value={profileData.highSchoolSubjects}
                      onChange={(e) => handleFieldChange("highSchoolSubjects", e.target.value)}
                      placeholder="Mathematics, Physical Sciences, English"
                    />
                  </label>
                )}

                <label style={{ ...profileUi.fieldWrap, marginTop: 14 }}>
                  Bio
                  <textarea
                    style={profileUi.textArea}
                    value={profileData.bio}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    placeholder="Write a short introduction about yourself"
                  />
                </label>

                <div style={profileUi.avatarPickerWrap}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <button className="uni-card__btn" onClick={() => setShowAvatarPicker((s) => !s)} type="button">
                      Choose Avatar Style
                    </button>
                    <button
                      className="uni-card__btn"
                      onClick={shuffleAvatarSeed}
                      type="button"
                      title="Shuffle to get a different look within the same style"
                    >
                      🔀 Shuffle Look
                    </button>
                  </div>
                  {showAvatarPicker && (
                    <div style={profileUi.avatarGrid}>
                      {avatarOptions.map((a) => (
                        <button key={a.key} onClick={() => selectAvatar(a)} style={profileUi.avatarOptionBtn}>
                          <img
                            src={a.url}
                            alt={a.label}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              objectFit: "contain",
                              background: "#f1f5f9",
                              border: a.key === avatarStyle ? "2px solid #2563eb" : "2px solid transparent",
                            }}
                          />
                          <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>
                            {a.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="uni-card__actions" style={{ marginTop: 16 }}>
                  <button className="uni-card__btn uni-card__btn--primary" onClick={saveProfile}>
                    Save Changes
                  </button>
                  <button
                    className="uni-card__btn uni-card__btn--secondary"
                    onClick={() => {
                      setAvatarKey(savedAvatarKey);
                      setAvatarUrl(savedAvatarUrl);
                      setAvatarSeed(savedAvatarSeed);
                      setAvatarStyle(savedAvatarStyle);
                      setProfileData(savedProfileData);
                      setShowAvatarPicker(false);
                      setError(null);
                      setSuccess("");
                      setActiveTab("overview");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </article>
          </div>
        )}

        {activeTab === "community" && (
          <div className="uni-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">
                  <FaComments /> My Posts
                </h3>
                <div style={profileUi.communityList}>
                  {communityPosts.length ? (
                    communityPosts.map((post) => (
                      <div key={post.id} style={profileUi.communityItem}>
                        <strong style={profileUi.communityItemTitle}>{post.category || "general"}</strong>
                        <p style={profileUi.communityItemText}>{post.content}</p>
                        <span style={profileUi.communityItemMeta}>{formatCommunityDate(post.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="uni-card__desc" style={{ margin: 0 }}>
                      No community posts yet.
                    </p>
                  )}
                </div>
                <button
                  className="uni-card__btn uni-card__btn--primary"
                  onClick={() => navigate(routes.community)}
                  style={{ marginTop: 14, width: "fit-content" }}
                >
                  Open Community
                </button>
              </div>
            </article>

            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">
                  <FaBookmark /> Saved Posts
                </h3>
                <div style={profileUi.communityList}>
                  {savedCommunityPosts.length ? (
                    savedCommunityPosts.map((post) => (
                      <button
                        key={post.id}
                        style={{ ...profileUi.communityItem, textAlign: "left", cursor: "pointer" }}
                        onClick={() => navigate(createCommunityPostPath(post.postId || post.id))}
                        type="button"
                      >
                        <strong style={profileUi.communityItemTitle}>{post.authorName || "Student"}</strong>
                        <p style={profileUi.communityItemText}>{post.contentPreview || "Saved community post"}</p>
                        <span style={profileUi.communityItemMeta}>Saved {formatCommunityDate(post.savedAt)}</span>
                      </button>
                    ))
                  ) : (
                    <p className="uni-card__desc" style={{ margin: 0 }}>
                      Saved community posts will appear here.
                    </p>
                  )}
                </div>
              </div>
            </article>

            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">
                  <FaBell /> Notifications
                </h3>
                <div style={profileUi.communityList}>
                  {communityNotifications.length ? (
                    communityNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        style={{
                          ...profileUi.communityNotification,
                          ...(notification.read ? {} : profileUi.communityNotificationUnread),
                        }}
                        onClick={async () => {
                          await markCommunityNotificationRead(notification.id);
                          if (notification.postId) {
                            navigate(createCommunityPostPath(notification.postId));
                          }
                        }}
                        type="button"
                      >
                        <strong style={profileUi.communityItemTitle}>{notification.actorName || "A student"}</strong>
                        <span style={profileUi.communityItemText}>
                          {notification.type === "comment" ? "commented on" : "liked"} your post
                        </span>
                        <span style={profileUi.communityItemMeta}>{formatCommunityDate(notification.createdAt)}</span>
                      </button>
                    ))
                  ) : (
                    <p className="uni-card__desc" style={{ margin: 0 }}>
                      No community notifications yet.
                    </p>
                  )}
                </div>
              </div>
            </article>
          </div>
        )}

        {activeTab === "security" && (
          <div className="uni-grid" style={{ gridTemplateColumns: "1fr" }}>
            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Security Center</h3>

                <section style={profileUi.securitySectionCard}>
                  <h4 style={profileUi.securitySectionTitle}>Account Activity</h4>
                  <p className="uni-card__desc">Account created: {formatSecurityDate(user?.metadata?.creationTime)}</p>
                  <p className="uni-card__desc">Last sign-in: {formatSecurityDate(user?.metadata?.lastSignInTime)}</p>

                  <div style={profileUi.activityFeed}>
                    {activityLog.length > 0 ? (
                      activityLog.map((event) => (
                        <div key={event.id} style={profileUi.activityRow}>
                          <span style={profileUi.activityAction}>{event.action}</span>
                          <span style={profileUi.activityTime}>{formatSecurityDate(event.at)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="uni-card__desc" style={{ margin: 0 }}>
                        No recent security actions yet.
                      </p>
                    )}
                  </div>
                </section>

                <section style={profileUi.securitySectionCard}>
                  <h4 style={profileUi.securitySectionTitle}>Sessions</h4>
                  <p className="uni-card__desc">
                    Current session: {deviceDescriptor.browser} on {deviceDescriptor.platform}
                  </p>
                  <div className="uni-card__actions" style={{ marginTop: 4 }}>
                    <button className="uni-card__btn uni-card__btn--secondary" onClick={handleLogout}>
                      Sign Out This Device
                    </button>
                    <button
                      className="uni-card__btn uni-card__btn--secondary"
                      onClick={handleSignOutAllSessions}
                      disabled={securityLoading}
                      style={securityLoading ? profileUi.disabledButton : undefined}
                    >
                      Sign Out All Sessions
                    </button>
                  </div>
                </section>

                <section style={profileUi.securitySectionCard}>
                  <h4 style={profileUi.securitySectionTitle}>Password and Verification</h4>
                  <p className="uni-card__desc">
                    Email status: {" "}
                    <span style={emailVerified ? profileUi.verifiedText : profileUi.pendingText}>
                      {emailVerified ? "Verified" : "Not verified"}
                    </span>
                  </p>

                  <div className="uni-card__actions" style={{ marginBottom: 12 }}>
                    {!emailVerified && (
                      <button
                        className="uni-card__btn uni-card__btn--secondary"
                        onClick={sendVerificationLink}
                        disabled={securityLoading}
                        style={securityLoading ? profileUi.disabledButton : undefined}
                      >
                        Send Verification Email
                      </button>
                    )}
                    <button
                      className="uni-card__btn uni-card__btn--secondary"
                      onClick={refreshVerificationStatus}
                      disabled={securityLoading}
                      style={securityLoading ? profileUi.disabledButton : undefined}
                    >
                      Refresh Status
                    </button>
                  </div>

                  <label style={profileUi.fieldWrap}>
                    New Password
                    <input
                      style={profileUi.input}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </label>

                  {newPassword && (
                    <div style={profileUi.passwordStrengthWrap}>
                      <div style={profileUi.passwordStrengthHeader}>
                        <span style={profileUi.passwordStrengthLabel}>Strength</span>
                        <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                      </div>
                      <div style={profileUi.passwordStrengthTrack}>
                        <div
                          style={{
                            ...profileUi.passwordStrengthFill,
                            width: `${Math.round(passwordStrength.ratio * 100)}%`,
                            background: passwordStrength.color,
                          }}
                        />
                      </div>
                      <div style={profileUi.passwordRulesGrid}>
                        {passwordStrength.checks.map((check) => (
                          <span key={check.key} style={check.passed ? profileUi.rulePass : profileUi.rulePending}>
                            {check.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <label style={{ ...profileUi.fieldWrap, marginTop: 10 }}>
                    Confirm Password
                    <input
                      style={profileUi.input}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </label>

                  <button
                    className="uni-card__btn uni-card__btn--primary"
                    onClick={handleChangePassword}
                    disabled={securityLoading}
                    style={{ marginTop: 12, width: "fit-content", ...(securityLoading ? profileUi.disabledButton : {}) }}
                  >
                    {securityLoading ? "Please wait..." : "Update Password"}
                  </button>
                </section>

                <section style={profileUi.dangerZoneCard}>
                  <h4 style={profileUi.dangerZoneTitle}>Delete Account</h4>
                  <p className="uni-card__desc" style={{ marginBottom: 10 }}>
                    This permanently deletes your account and profile data. Type DELETE to confirm.
                  </p>
                  <label style={profileUi.fieldWrap}>
                    Confirmation
                    <input
                      style={profileUi.input}
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                    />
                  </label>
                  <button
                    className="uni-card__btn"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    style={{
                      marginTop: 10,
                      background: "#b91c1c",
                      color: "#fff",
                      border: "1px solid #991b1b",
                      ...(deleteLoading ? profileUi.disabledButton : {}),
                    }}
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </button>
                </section>

                {securitySuccess && <p style={profileUi.securitySuccess}>{securitySuccess}</p>}
                {securityError && <p style={profileUi.securityError}>{securityError}</p>}
              </div>
            </article>
          </div>
        )}

        {success && <div style={profileUi.success}>{success}</div>}
        {error && <div style={profileUi.error}>{error}</div>}
      </div>
    </>
  );
};

const profileUi = {
  heroHeader: {
    justifyContent: "space-between",
    minHeight: "unset",
    padding: "1rem 1.2rem 0.9rem",
  },
  heroIdentityWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #dbeafe",
  },
  metaLine: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.78rem",
  },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: 600,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
    borderRadius: 999,
    transition: "width 220ms ease",
  },
  verifiedPill: {
    background: "#dcfce7",
    color: "#166534",
  },
  pendingPill: {
    background: "#ffedd5",
    color: "#9a3412",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
  },
  textArea: {
    minHeight: 96,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    resize: "vertical",
  },
  avatarPickerWrap: {
    marginTop: 14,
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(74px, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  avatarOptionBtn: {
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  securitySectionCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 12px 10px",
    marginTop: 12,
    background: "#f8fbff",
  },
  securitySectionTitle: {
    margin: "0 0 8px",
    fontSize: 15,
    color: "#1e293b",
    fontWeight: 700,
  },
  activityFeed: {
    marginTop: 8,
    display: "grid",
    gap: 8,
  },
  activityRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 10,
    padding: "8px 10px",
  },
  activityAction: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 600,
  },
  activityTime: {
    color: "#64748b",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  communityList: {
    display: "grid",
    gap: 10,
  },
  communityItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#fff",
    padding: "10px 11px",
  },
  communityItemTitle: {
    display: "block",
    color: "#1e293b",
    fontSize: 13,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  communityItemText: {
    display: "block",
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.45,
    margin: "4px 0",
    overflowWrap: "anywhere",
  },
  communityItemMeta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 600,
  },
  communityNotification: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    padding: "10px 11px",
    textAlign: "left",
  },
  communityNotificationUnread: {
    borderColor: "#93c5fd",
    background: "#eff6ff",
  },
  passwordStrengthWrap: {
    marginTop: 10,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#fff",
  },
  passwordStrengthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  passwordStrengthLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  passwordStrengthTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  passwordStrengthFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 220ms ease",
  },
  passwordRulesGrid: {
    marginTop: 8,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 6,
  },
  rulePass: {
    color: "#166534",
    fontSize: 12,
    fontWeight: 600,
  },
  rulePending: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 500,
  },
  dangerZoneCard: {
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "12px 12px 10px",
    marginTop: 12,
    background: "#fef2f2",
  },
  dangerZoneTitle: {
    margin: "0 0 8px",
    fontSize: 15,
    color: "#7f1d1d",
    fontWeight: 700,
  },
  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  verifiedText: {
    color: "#166534",
    fontWeight: 700,
  },
  pendingText: {
    color: "#9a3412",
    fontWeight: 700,
  },
  securitySuccess: {
    marginTop: 12,
    color: "#166534",
    fontWeight: 600,
    fontSize: 14,
  },
  securityError: {
    marginTop: 12,
    color: "#b91c1c",
    fontWeight: 600,
    fontSize: 14,
  },
  success: {
    maxWidth: 1200,
    margin: "14px auto 0",
    background: "#ecfdf3",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: 12,
    padding: 12,
    fontWeight: 600,
  },
  error: {
    maxWidth: 1200,
    margin: "14px auto 0",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: 12,
    fontWeight: 600,
  },
};

export default Profile;
