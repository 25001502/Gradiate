import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avDefault from "../images/default-avatar.jpg";
import av1 from "../images/team1.jpg";
import av2 from "../images/team2.jpg";
import av3 from "../images/team3.jpg";
import {
  getAuth,
  updateProfile,
  signOut,
  updatePassword,
  reload,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  FaPencilAlt,
  FaGraduationCap,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserCircle,
  FaBook,
  FaHome,
} from "react-icons/fa";

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
  team1: av1,
  team2: av2,
  team3: av3,
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

  const auth = getAuth();
  const navigate = useNavigate();
  const db = getFirestore();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarKey, setAvatarKey] = useState("");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState("");
  const [savedAvatarKey, setSavedAvatarKey] = useState("");
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
  const menuRef = useRef(null);

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
            const resolvedAvatar =
              resolveAvatarFromKey(resolvedAvatarKey) || data.photoURL || currentUser.photoURL || "";
            const resolvedProfile = normalizeProfileData(data);
            setAvatarKey(resolvedAvatarKey);
            setAvatarUrl(resolvedAvatar);
            setSavedAvatarKey(resolvedAvatarKey);
            setSavedAvatarUrl(resolvedAvatar);
            setProfileData(resolvedProfile);
            setSavedProfileData(resolvedProfile);
          } else {
            setAvatarKey(inferredFallbackKey);
            setSavedAvatarKey(inferredFallbackKey);
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
  }, [auth, db]);

  // Allow selecting from a set of bundled avatars instead of uploading to Storage
  const avatarOptions = [
    { key: "default", url: avDefault },
    { key: "team1", url: av1 },
    { key: "team2", url: av2 },
    { key: "team3", url: av3 },
  ];

  const selectAvatar = (option) => {
    setAvatarKey(option.key);
    setAvatarUrl(option.url);
    setShowAvatarPicker(false);
    setError(null);
    setSuccess("");
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
      await signOut(auth);
      // navigate to login or home after logout
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      setError("Failed to logout.");
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
    } catch (err) {
      console.error(err);
      setSecurityError("Failed to refresh verification status.");
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
    } catch (err) {
      console.error(err);
      setSecurityError(err.message || "Could not send verification email.");
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

    if (newPassword.length < 6) {
      setSecurityError("Password must be at least 6 characters.");
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
    } catch (err) {
      console.error(err);
      const code = (err && err.code) || "";
      if (code.includes("requires-recent-login")) {
        setSecurityError("Please log out and log in again, then retry changing your password.");
      } else {
        setSecurityError("Failed to change password.");
      }
    } finally {
      setSecurityLoading(false);
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

  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

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

  return (
    <>
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
                  navigate("/application");
                }}
              >
                Application
              </a>
              <a
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/practice");
                }}
              >
                Practise
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
          <button className="dashboard-shortcut" onClick={() => setActiveTab("overview")}>
            <FaUserCircle /> Overview
          </button>
          <button className="dashboard-shortcut" onClick={() => setActiveTab("edit")}>
            <FaPencilAlt /> Edit Profile
          </button>
          <button className="dashboard-shortcut" onClick={() => setActiveTab("security")}>
            <FaShieldAlt /> Security
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate("/application") }>
            <FaHome /> Home
          </button>
          <button className="dashboard-shortcut" onClick={() => alert("Sorry! this feature is not yet available")}>
            <FaGraduationCap /> Bursaries
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
            <p className="dashboard-stat__value" style={{ color: emailVerified ? "#10b981" : "#f59e0b" }}>
              {emailVerified ? "Verified" : "Pending"}
            </p>
            <p className="dashboard-stat__label">Email Status</p>
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
                <button className="uni-card__btn uni-card__btn--secondary" onClick={() => setActiveTab("edit")}>
                  Edit
                </button>
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
                  <button className="uni-card__btn" onClick={() => setShowAvatarPicker((s) => !s)} type="button">
                    Choose Avatar
                  </button>
                  {showAvatarPicker && (
                    <div style={profileUi.avatarGrid}>
                      {avatarOptions.map((a, idx) => (
                        <button key={a.key} onClick={() => selectAvatar(a)} style={profileUi.avatarOptionBtn}>
                          <img
                            src={a.url}
                            alt={`avatar-${idx}`}
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: a.key === avatarKey ? "2px solid #2563eb" : "2px solid transparent",
                            }}
                          />
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

        {activeTab === "security" && (
          <div className="uni-grid" style={{ gridTemplateColumns: "1fr" }}>
            <article className="uni-card">
              <div className="uni-card__body">
                <h3 className="uni-card__name">Security Settings</h3>
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
    gridTemplateColumns: "repeat(4, 54px)",
    gap: 8,
    marginTop: 10,
  },
  avatarOptionBtn: {
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
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
