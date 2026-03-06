import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import avDefault from "../images/default-avatar.jpg";
import av1 from "../images/team1.jpg";
import av2 from "../images/team2.jpg";
import av3 from "../images/team3.jpg";
import image from "../images/dashboard-hero.jpg";
import { getAuth, updateProfile, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const Profile = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const db = getFirestore();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          setAvatarUrl(currentUser.photoURL || "");

          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatarUrl(data.photoURL || currentUser.photoURL || "");
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Allow selecting from a set of bundled avatars instead of uploading to Storage
  const avatarOptions = [avDefault, av1, av2, av3];

  const selectAvatar = async (url) => {
    if (!user) return;
    setLoading(true);
    try {
      // update immediately in Firestore so avatar is persistent without using Storage
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
      setAvatarUrl(url);
      setShowAvatarPicker(false);
    } catch (err) {
      console.error("Failed to set avatar from options", err);
      // If Firestore write is blocked by rules, fall back to saving photoURL in the Auth profile
      const code = err && (err.code || "").toLowerCase();
      if (
        code.includes("permission") ||
        code.includes("denied") ||
        code.includes("missing") ||
        code.includes("insufficient")
      ) {
        try {
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: url });
            setAvatarUrl(url);
            setShowAvatarPicker(false);

            return;
          }
        } catch (authErr) {
          console.error("Failed to update Auth profile as fallback", authErr);
        }
      }
      setError("Failed to set avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // navigate to login or home after logout
      navigate("/");
    } catch (err) {
      console.error('Logout failed', err);
      setError('Failed to logout.');
    }
  };
  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // persist avatar selection in Firestore (only photoURL)
      await updateDoc(doc(db, "users", user.uid), { photoURL: avatarUrl });
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
            setEditing(false);

            return;
          }
        } catch (authErr) {
          console.error("Failed to update Auth profile as fallback", authErr);
        }
      }
      setError("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

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
              <a onClick={() => navigate("/Aplication")}>Application</a>
              <a onClick={() => navigate("/Practise")}>Practise</a>

              <a
                onClick={() =>
                  alert("Sorry! this feature is not yet available")
                }
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
          // show the full image without cropping and let it scroll with the page
          backgroundImage: `linear-gradient(rgba(240,246,255,0.75), rgba(240,246,255,0.75)), url(${image})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: 'contain',
          backgroundAttachment: 'scroll',
          minHeight: '100vh',
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
              <div style={newStyles.avatarWrap}>
                <img
                  src={avatarUrl || avDefault}
                  alt="Avatar"
                  style={newStyles.avatar}
                />
                {/* edit pen icon near avatar */}
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
              <div>
                <h2 style={{ margin: 0 }}>{user.displayName || "User"}</h2>
                <p style={{ color: "#555", marginTop: 6 }}>{user.email}</p>
                
              </div>

              <div style={{ marginLeft: "auto" }}>
                {!editing ? (
                  // empty placeholder — edit button is on avatar
                  <div style={{ width: 48 }} />
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 8,
                        }}
                      >
                        <button
                          style={newStyles.fileLabel}
                          onClick={() => setShowAvatarPicker((s) => !s)}
                          type="button"
                        >
                          Choose Avatar
                        </button>
                        {showAvatarPicker && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4,48px)",
                              gap: 8,
                              marginTop: 8,
                            }}
                          >
                            {avatarOptions.map((a, idx) => (
                              <button
                                key={idx}
                                onClick={() => selectAvatar(a)}
                                style={{
                                  padding: 0,
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                }}
                              >
                                <img
                                  src={a}
                                  alt={`avatar-${idx}`}
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border:
                                      a === avatarUrl
                                        ? "2px solid #2563eb"
                                        : "2px solid transparent",
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={newStyles.primaryBtn}
                          onClick={saveProfile}
                        >
                          Save
                        </button>
                        <button
                          style={newStyles.ghostBtn}
                          onClick={() => {
                            setEditing(false);
                            setError(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

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
  coverWrapper: { position: "relative", height: 180, background: "#ddd" },
  cover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  avatarWrap: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: -48,
    borderRadius: 999,
    padding: 6,
    background: "#fff",
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
  statsRow: {
    display: "flex",
    gap: 12,
    padding: "12px 28px 24px",
    borderTop: "1px solid #f1f1f1",
  },
  stat: { flex: 1, textAlign: "center", padding: 12 },
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
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  textArea: {
    minHeight: 80,
    width: 260,
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
  },
  error: { color: "#b91c1c", padding: 12, textAlign: "center" },
};

export default Profile;
