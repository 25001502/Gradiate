import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avDefault from "../images/default-avatar.jpg";
import av1 from "../images/team1.jpg";
import av2 from "../images/team2.jpg";
import av3 from "../images/team3.jpg";
import image from "../images/dashboard-hero.jpg";
import {
  getAuth,
  updateProfile,
  signOut,
  updatePassword,
  reload,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
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
      setEditing(false);
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
            setEditing(false);

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

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
                  alert("Sorry! this feature is not yet available")
                }}
                className="active"
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

      <div
        className="core"
        style={{
          // Keep text readable while letting the background image stay prominent.
          backgroundImage: `linear-gradient(160deg, rgba(10, 25, 47, 0.42), rgba(240, 246, 255, 0.78)), url(${image})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: isMobile ? "center top" : "center center",
          backgroundSize: "cover",
          backgroundAttachment: isMobile ? "scroll" : "fixed",
          minHeight: "100vh",
        }}
      >
        <div style={newStyles.page}>
          <div style={newStyles.profileCard}>
            <div
              style={{
                ...newStyles.coverWrapper,
                ...(isMobile ? newStyles.coverWrapperMobile : {}),
              }}
            >
              <div style={newStyles.headerBadge}>Available for opportunities</div>
              <div style={newStyles.avatarWrap}>
                <img
                  src={avatarUrl || avDefault}
                  alt="Avatar"
                  style={newStyles.avatar}
                />
                <button
                  onClick={() => setEditing(true)}
                  aria-label="Edit profile"
                  title="Edit profile"
                  style={newStyles.editIconBtn}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                      fill="#111827"
                    />
                    <path
                      d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                      fill="#111827"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              style={{
                ...newStyles.infoRow,
                ...(isMobile ? newStyles.infoRowMobile : {}),
              }}
            >
              <div style={newStyles.identityBlock}>
                <h2 style={{ margin: 0 }}>{user.displayName || "User"}</h2>
                {/* <p style={{ color: "#555", marginTop: 6 }}>{user.email}</p> */}
                <p style={{ color: "#666", marginTop: 4 }}>
                  {profileData.location || "Add your location"}
                </p>
                <p style={{ color: "#475569", marginTop: 4, fontSize: 13 }}>
                  Stage: {profileData.academicStage === "highSchool" ? "High School" : "Tertiary"}
                </p>
              </div>

              <div style={newStyles.infoActions}>
                {!editing && (
                  <button style={newStyles.primaryBtn} onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div style={newStyles.progressWrap}>
              <div style={newStyles.progressTitleRow}>
                <strong>Profile Completion</strong>
                <span>{profileCompletion}%</span>
              </div>
              <div style={newStyles.progressTrack}>
                <div
                  style={{
                    ...newStyles.progressFill,
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>
            </div>

            <div style={newStyles.statsRow}>
              <div style={newStyles.stat}>
                <p style={newStyles.statValue}>{profileCompletion}%</p>
                <p style={newStyles.statLabel}>Strength</p>
              </div>
              <div style={newStyles.stat}>
                <p style={newStyles.statValue}>{profileData.skills ? profileData.skills.split(",").filter((s) => s.trim()).length : 0}</p>
                <p style={newStyles.statLabel}>Skills Tagged</p>
              </div>
              <div style={newStyles.stat}>
                <p style={newStyles.statValue}>{profileData.careerGoal ? "Ready" : "Draft"}</p>
                <p style={newStyles.statLabel}>Career Status</p>
              </div>
            </div>

            {editing && (
              <div style={newStyles.editorSection}>
                <h3 style={newStyles.sectionTitle}>Edit Profile</h3>
                <div style={newStyles.editorGrid}>
                  <label style={newStyles.fieldWrap}>
                    Academic Stage
                    <select
                      style={newStyles.input}
                      value={profileData.academicStage}
                      onChange={(e) => handleFieldChange("academicStage", e.target.value)}
                    >
                      <option value="tertiary">Tertiary / University</option>
                      <option value="highSchool">High School</option>
                    </select>
                  </label>
                  <label style={newStyles.fieldWrap}>
                    Phone Number
                    <input
                      style={newStyles.input}
                      value={profileData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+27 71 234 5678"
                    />
                  </label>
                  <label style={newStyles.fieldWrap}>
                    Location
                    <input
                      style={newStyles.input}
                      value={profileData.location}
                      onChange={(e) => handleFieldChange("location", e.target.value)}
                      placeholder="Johannesburg, South Africa"
                    />
                  </label>
                  {profileData.academicStage !== "highSchool" && (
                    <>
                      <label style={newStyles.fieldWrap}>
                        Institution
                        <input
                          style={newStyles.input}
                          value={profileData.institution}
                          onChange={(e) => handleFieldChange("institution", e.target.value)}
                          placeholder="University / College"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        Qualification / Major
                        <input
                          style={newStyles.input}
                          value={profileData.qualification}
                          onChange={(e) => handleFieldChange("qualification", e.target.value)}
                          placeholder="BSc Computer Science"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        Graduation Year
                        <input
                          style={newStyles.input}
                          value={profileData.gradYear}
                          onChange={(e) => handleFieldChange("gradYear", e.target.value)}
                          placeholder="2027"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        Skills (comma separated)
                        <input
                          style={newStyles.input}
                          value={profileData.skills}
                          onChange={(e) => handleFieldChange("skills", e.target.value)}
                          placeholder="React, Communication, Java"
                        />
                      </label>
                    </>
                  )}
                  {profileData.academicStage === "highSchool" && (
                    <>
                      <label style={newStyles.fieldWrap}>
                        High School Name
                        <input
                          style={newStyles.input}
                          value={profileData.highSchoolName}
                          onChange={(e) => handleFieldChange("highSchoolName", e.target.value)}
                          placeholder="Name of your high school"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        Current Grade / Level
                        <input
                          style={newStyles.input}
                          value={profileData.highSchoolGrade}
                          onChange={(e) => handleFieldChange("highSchoolGrade", e.target.value)}
                          placeholder="Grade 11 / Grade 12"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        High School Status
                        <input
                          style={newStyles.input}
                          value={profileData.highSchoolStatus}
                          onChange={(e) => handleFieldChange("highSchoolStatus", e.target.value)}
                          placeholder="Currently enrolled / Completed"
                        />
                      </label>
                      <label style={newStyles.fieldWrap}>
                        Expected Matric Year
                        <input
                          style={newStyles.input}
                          value={profileData.matricYear}
                          onChange={(e) => handleFieldChange("matricYear", e.target.value)}
                          placeholder="2026"
                        />
                      </label>
                    </>
                  )}
                </div>

                <label style={{ ...newStyles.fieldWrap, marginTop: 14 }}>
                  Career Goal
                  <input
                    style={newStyles.input}
                    value={profileData.careerGoal}
                    onChange={(e) => handleFieldChange("careerGoal", e.target.value)}
                    placeholder="Graduate internship in software engineering"
                  />
                </label>

                {profileData.academicStage === "highSchool" && (
                  <label style={{ ...newStyles.fieldWrap, marginTop: 14 }}>
                    High School Subjects (comma separated)
                    <input
                      style={newStyles.input}
                      value={profileData.highSchoolSubjects}
                      onChange={(e) => handleFieldChange("highSchoolSubjects", e.target.value)}
                      placeholder="Mathematics, Physical Sciences, English"
                    />
                  </label>
                )}

                <label style={{ ...newStyles.fieldWrap, marginTop: 14 }}>
                  Bio
                  <textarea
                    style={newStyles.textArea}
                    value={profileData.bio}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    placeholder="Write a short introduction about yourself"
                  />
                </label>

                <div style={newStyles.avatarPickerWrap}>
                  <button
                    style={newStyles.fileLabel}
                    onClick={() => setShowAvatarPicker((s) => !s)}
                    type="button"
                  >
                    Choose Avatar
                  </button>
                  {showAvatarPicker && (
                    <div style={newStyles.avatarGrid}>
                      {avatarOptions.map((a, idx) => (
                        <button
                          key={a.key}
                          onClick={() => selectAvatar(a)}
                          style={newStyles.avatarOptionBtn}
                        >
                          <img
                            src={a.url}
                            alt={`avatar-${idx}`}
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                a.key === avatarKey
                                  ? "2px solid #2563eb"
                                  : "2px solid transparent",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={newStyles.actionRow}>
                  <button style={newStyles.primaryBtn} onClick={saveProfile}>
                    Save Changes
                  </button>
                  <button
                    style={newStyles.ghostBtn}
                    onClick={() => {
                      setAvatarKey(savedAvatarKey);
                      setAvatarUrl(savedAvatarUrl);
                      setProfileData(savedProfileData);
                      setEditing(false);
                      setShowAvatarPicker(false);
                      setError(null);
                      setSuccess("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={newStyles.contentGrid}>
              <div style={newStyles.contentCard}>
                <h3 style={newStyles.sectionTitle}>About Me</h3>
                <p style={newStyles.valueText}>{profileData.bio || "Add your short bio to help sponsors know you."}</p>
              </div>
              <div style={newStyles.contentCard}>
                <h3 style={newStyles.sectionTitle}>Contact</h3>
                <p style={newStyles.valueText}>Phone: {profileData.phone || "Not added"}</p>
                <p style={newStyles.valueText}>Location: {profileData.location || "Not added"}</p>
              </div>
              <div style={newStyles.contentCard}>
                <h3 style={newStyles.sectionTitle}>Academic Profile</h3>
                {profileData.academicStage === "highSchool" ? (
                  <>
                    <p style={newStyles.valueText}>School: {profileData.highSchoolName || "Not added"}</p>
                    <p style={newStyles.valueText}>Current Grade: {profileData.highSchoolGrade || "Not added"}</p>
                    <p style={newStyles.valueText}>Status: {profileData.highSchoolStatus || "Not added"}</p>
                    <p style={newStyles.valueText}>Expected Matric Year: {profileData.matricYear || "Not added"}</p>
                    <p style={newStyles.valueText}>Subjects: {profileData.highSchoolSubjects || "Not added"}</p>
                  </>
                ) : (
                  <>
                    <p style={newStyles.valueText}>Institution: {profileData.institution || "Not added"}</p>
                    <p style={newStyles.valueText}>Qualification: {profileData.qualification || "Not added"}</p>
                    <p style={newStyles.valueText}>Graduation Year: {profileData.gradYear || "Not added"}</p>
                  </>
                )}
              </div>
              <div style={newStyles.contentCard}>
                <h3 style={newStyles.sectionTitle}>Career Goals</h3>
                <p style={newStyles.valueText}>{profileData.careerGoal || "Add your preferred roles and opportunities."}</p>
                <p style={newStyles.valueText}>
                  Skills: {profileData.skills || "No skills added"}
                </p>
              </div>
              <div style={newStyles.contentCard}>
                <h3 style={newStyles.sectionTitle}>Security Settings</h3>
                <div style={newStyles.securityRow}>
                  <p style={newStyles.valueText}>
                    Email status:{" "}
                    <span
                      style={{
                        ...newStyles.verificationBadge,
                        ...(emailVerified
                          ? newStyles.verificationBadgeOk
                          : newStyles.verificationBadgeWarn),
                      }}
                    >
                      {emailVerified ? "Verified" : "Not verified"}
                    </span>
                  </p>

                  <div style={newStyles.securityActions}>
                    {!emailVerified && (
                      <button
                        style={newStyles.ghostBtn}
                        onClick={sendVerificationLink}
                        disabled={securityLoading}
                      >
                        Send Verification Email
                      </button>
                    )}
                    <button
                      style={newStyles.ghostBtn}
                      onClick={refreshVerificationStatus}
                      disabled={securityLoading}
                    >
                      Refresh Status
                    </button>
                  </div>
                </div>

                <div style={newStyles.passwordBox}>
                  <p style={{ ...newStyles.valueText, marginBottom: 8 }}>Change Password</p>
                  <label style={newStyles.fieldWrap}>
                    New Password
                    <input
                      style={newStyles.input}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </label>

                  <label style={{ ...newStyles.fieldWrap, marginTop: 10 }}>
                    Confirm Password
                    <input
                      style={newStyles.input}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </label>

                  <button
                    style={{ ...newStyles.primaryBtn, marginTop: 12, width: "fit-content" }}
                    onClick={handleChangePassword}
                    disabled={securityLoading}
                  >
                    {securityLoading ? "Please wait..." : "Update Password"}
                  </button>
                </div>

                {securitySuccess && <p style={newStyles.securitySuccess}>{securitySuccess}</p>}
                {securityError && <p style={newStyles.securityError}>{securityError}</p>}
              </div>
            </div>

            {success && <div style={newStyles.success}>{success}</div>}
            {error && <div style={newStyles.error}>{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

const newStyles = {
  page: { display: "flex", justifyContent: "center", padding: "24px" },
  profileCard: {
    width: "100%",
    maxWidth: 920,
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
  coverWrapper: {
    position: "relative",
    height: 180,
    background: "linear-gradient(120deg, #d9ecff 0%, #eff5ff 45%, #e2f0ff 100%)",
    borderBottom: "1px solid #e5e7eb",
  },
  headerBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 600,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #bfdbfe",
  },
  avatarWrap: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: -48,
    borderRadius: 999,
    padding: 5,
    background: "#fff",
    border: "3px solid #dbeafe",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
  },
  infoRow: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    padding: "72px 28px 18px",
  },
  identityBlock: {
    maxWidth: "80%",
  },
  infoActions: {
    marginLeft: "auto",
    minWidth: 130,
    display: "flex",
    justifyContent: "flex-end",
  },
  coverWrapperMobile: { height: 120 },
  infoRowMobile: {
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 18px 18px",
  },
  editIconBtn: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#fff",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  progressWrap: {
    padding: "8px 28px 4px",
  },
  progressTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    marginBottom: 8,
    color: "#374151",
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)",
    borderRadius: 999,
    transition: "width 220ms ease",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    padding: "12px 28px 20px",
    borderTop: "1px solid #f1f1f1",
    borderBottom: "1px solid #f1f1f1",
  },
  stat: {
    flex: 1,
    textAlign: "center",
    padding: "10px 12px",
    borderRadius: 10,
    background: "#f8fafc",
  },
  statValue: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  statLabel: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  editorSection: {
    padding: "20px 28px",
    borderBottom: "1px solid #f1f1f1",
    background: "#fcfdff",
  },
  editorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    color: "#1f2937",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  },
  avatarPickerWrap: {
    marginTop: 14,
  },
  avatarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 54px)",
    gap: 8,
    marginTop: 8,
  },
  avatarOptionBtn: {
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  actionRow: {
    display: "flex",
    gap: 10,
    marginTop: 16,
  },
  contentGrid: {
    padding: "20px 28px 28px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  contentCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 14px 12px",
    background: "#ffffff",
  },
  securityRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  securityActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  verificationBadge: {
    display: "inline-block",
    marginLeft: 6,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  verificationBadgeOk: {
    color: "#166534",
    background: "#dcfce7",
  },
  verificationBadgeWarn: {
    color: "#92400e",
    background: "#fef3c7",
  },
  passwordBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  securitySuccess: {
    margin: "12px 0 0",
    color: "#166534",
    fontWeight: 600,
    fontSize: 14,
  },
  securityError: {
    margin: "12px 0 0",
    color: "#b91c1c",
    fontWeight: 600,
    fontSize: 14,
  },
  sectionTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: 16,
  },
  valueText: {
    margin: "0 0 6px",
    color: "#4b5563",
    lineHeight: 1.45,
    fontSize: 14,
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "#fff",
    border: "1px solid #ccc",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  fileLabel: {
    background: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  textArea: {
    minHeight: 88,
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    resize: "vertical",
  },
  success: {
    color: "#166534",
    background: "#ecfdf3",
    borderTop: "1px solid #bbf7d0",
    padding: 12,
    textAlign: "center",
    fontWeight: 600,
  },
  error: { color: "#b91c1c", padding: 12, textAlign: "center" },
};

export default Profile;
