import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import db from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaPencilAlt,
  FaGraduationCap,
  FaBell,
  FaBalanceScale,
  FaClock,
} from "react-icons/fa";

// ── University data ──────────────────────────────────────────────────────────
const UNIVERSITIES = [
  {
    id: "univen",
    name: "University of Venda",
    shortName: "Univen",
    location: "Thohoyandou, Limpopo",
    logo: "https://www.univen.ac.za/docs/univen-logo.png",
    description:
      "Known for its diverse programs and commitment to rural development. Find your path in science, education, law, and more.",
    applyUrl:
      "https://www.univen.ac.za/students/student-support-services/how-to-apply/",
  },
  {
    id: "ul",
    name: "University of Limpopo",
    shortName: "UL",
    location: "Mankweng, Limpopo",
    logo: "https://edurank.org/assets/img/uni-logos/university-of-limpopo-logo.png",
    description:
      "Strong programs in health sciences, agriculture, and education. Dedicated to empowering students from all backgrounds.",
    applyUrl: "https://www.ul.ac.za/tgsl/tgsl-programmes/",
  },
  {
    id: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    location: "Johannesburg, Gauteng",
    logo: "https://public.flourish.studio/uploads/70accd09-8527-4e3a-8c5c-af8fed4825d2.png",
    description:
      "A vibrant urban university with a reputation for innovation and inclusivity. Explore a wide range of undergraduate and postgraduate programs.",
    applyUrl: "https://www.uj.ac.za/admission-aid/undergraduate/",
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    location: "Johannesburg, Gauteng",
    logo: "https://th.bing.com/th/id/OIP.QF-zHDVgl2X_DmzSc_nc5wAAAA?r=0&rs=1&pid=ImgDetMain&cb=idpwebpc2",
    description:
      "A leading research university in Africa, renowned for academic excellence and social impact. Ideal for world-class education.",
    applyUrl: "https://www.wits.ac.za/undergraduate/apply-to-wits/",
  },
  {
    id: "tut",
    name: "Tshwane University of Technology",
    shortName: "TUT",
    location: "Pretoria, Gauteng",
    logo: "https://wikisouthafrica.co.za/wp-content/uploads/2020/08/Tshwane-University-of-Technology-1024x986.png",
    description:
      "One of South Africa's largest residential universities, offering practical and career-focused programs in engineering, science, and the arts.",
    applyUrl: "https://www.tut.ac.za/",
  },
  {
    id: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    location: "Cape Town, Western Cape",
    logo: "https://www.freelogovectors.net/wp-content/uploads/2021/04/university-of-cape-town-logo-freelogovectors.net_.png",
    description:
      "Africa's top-ranked university, celebrated for its beautiful campus and academic leadership in science, business, and the humanities.",
    applyUrl:
      "https://uct.ac.za/students/applications-apply-undergraduate-qualifications/application-procedure",
  },
];

const BOOKMARK_FOLDERS = ["General", "Dream", "Safe", "Applied"];

const UNIVERSITY_DEADLINES = {
  univen: "2026-09-30",
  ul: "2026-08-31",
  uj: "2026-09-15",
  wits: "2026-07-31",
  tut: "2026-10-15",
  uct: "2026-07-31",
};

function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(dateString);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getAvailabilityStatus(dateString) {
  const days = daysUntil(dateString);
  if (days < 0) {
    return { label: "Closed", color: "#991b1b", background: "#fee2e2", days };
  }
  if (days <= 14) {
    return { label: "Closing Soon", color: "#9a3412", background: "#ffedd5", days };
  }
  return { label: "Application Open", color: "#166534", background: "#dcfce7", days };
}

function getDaysLeftLabel(days) {
  if (days < 0) return "Closed";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Aplication() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gradiate_bookmarks")) || [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState("all"); // "all" | "saved"
  const [savedFolderFilter, setSavedFolderFilter] = useState("all");
  const [bookmarkMeta, setBookmarkMeta] = useState({});
  const [compareIds, setCompareIds] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const buildBookmarkPayload = useCallback((universityId, overrides = {}) => {
    const uni = UNIVERSITIES.find((item) => item.id === universityId);
    if (!uni) {
      return null;
    }

    return {
      name: uni.name,
      category: uni.location.split(", ").pop() || "General",
      folder: "General",
      notes: "",
      reminderEnabled: true,
      deadline: UNIVERSITY_DEADLINES[universityId] || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...overrides,
    };
  }, []);

  const saveBookmarkToFirestore = useCallback(async (universityId) => {
    if (!user?.uid) {
      return;
    }

    const payload = buildBookmarkPayload(universityId);
    if (!payload) {
      return;
    }

    await setDoc(doc(db, "users", user.uid, "bookmarks", universityId), payload, {
      merge: true,
    });
  }, [buildBookmarkPayload, user?.uid]);

  const updateBookmarkMetaInFirestore = async (universityId, partialMeta) => {
    if (!user?.uid) {
      return;
    }

    await setDoc(
      doc(db, "users", user.uid, "bookmarks", universityId),
      {
        ...partialMeta,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const removeBookmarkFromFirestore = async (universityId) => {
    if (!user?.uid) {
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "bookmarks", universityId));
  };

  const loadBookmarksFromFirestore = useCallback(async () => {
    if (!user?.uid) {
      return { ids: [], metaById: {} };
    }

    const snapshot = await getDocs(collection(db, "users", user.uid, "bookmarks"));
    const ids = snapshot.docs.map((bookmarkDoc) => bookmarkDoc.id);
    const metaById = {};

    snapshot.docs.forEach((bookmarkDoc) => {
      metaById[bookmarkDoc.id] = bookmarkDoc.data() || {};
    });

    return { ids, metaById };
  }, [user?.uid]);

  useEffect(() => {
    let isCancelled = false;

    const syncBookmarks = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const localBookmarks = (() => {
          try {
            return JSON.parse(localStorage.getItem("gradiate_bookmarks")) || [];
          } catch {
            return [];
          }
        })();

        const cloud = await loadBookmarksFromFirestore();
        const cloudBookmarks = cloud.ids || [];

        const missingInCloud = localBookmarks.filter(
          (bookmarkId) => !cloudBookmarks.includes(bookmarkId)
        );

        await Promise.all(
          missingInCloud.map(async (bookmarkId) => {
            await saveBookmarkToFirestore(bookmarkId);
          })
        );

        const refreshedCloud = await loadBookmarksFromFirestore();
        const mergedBookmarks = [...new Set([...(refreshedCloud.ids || []), ...localBookmarks])];

        if (!isCancelled) {
          setBookmarks(mergedBookmarks);
          setBookmarkMeta(refreshedCloud.metaById || {});
          localStorage.setItem("gradiate_bookmarks", JSON.stringify(mergedBookmarks));
        }
      } catch (error) {
        console.error("Failed to sync bookmarks from Firestore:", error);
      }
    };

    syncBookmarks();

    return () => {
      isCancelled = true;
    };
  }, [loadBookmarksFromFirestore, saveBookmarkToFirestore, user?.uid]);

  // Derived data
  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const isRemoving = prev.includes(id);
      const next = isRemoving
        ? prev.filter((b) => b !== id)
        : [...prev, id];

      if (user?.uid) {
        const persistPromise = isRemoving
          ? removeBookmarkFromFirestore(id)
          : saveBookmarkToFirestore(id);
        persistPromise.catch((error) => {
          console.error("Failed to update bookmark in Firestore:", error);
        });
      }

      setBookmarkMeta((prevMeta) => {
        const nextMeta = { ...prevMeta };
        if (isRemoving) {
          delete nextMeta[id];
        } else if (!nextMeta[id]) {
          nextMeta[id] = {
            folder: "General",
            notes: "",
            reminderEnabled: true,
            deadline: UNIVERSITY_DEADLINES[id] || null,
          };
        }
        return nextMeta;
      });

      localStorage.setItem("gradiate_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const updateBookmarkMeta = (id, partialMeta) => {
    setBookmarkMeta((prevMeta) => ({
      ...prevMeta,
      [id]: {
        ...(prevMeta[id] || {}),
        ...partialMeta,
      },
    }));

    updateBookmarkMetaInFirestore(id, partialMeta).catch((error) => {
      console.error("Failed to update bookmark details:", error);
    });
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const sendDeadlineReminders = async () => {
    if (!("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return;
    }

    const upcoming = bookmarks
      .map((id) => {
        const deadline = bookmarkMeta[id]?.deadline || UNIVERSITY_DEADLINES[id];
        const days = deadline ? daysUntil(deadline) : null;
        return { id, days, deadline, reminderEnabled: bookmarkMeta[id]?.reminderEnabled !== false };
      })
      .filter((item) => item.deadline && item.days !== null && item.days >= 0 && item.days <= 14 && item.reminderEnabled);

    upcoming.forEach((item) => {
      const uni = UNIVERSITIES.find((u) => u.id === item.id);
      if (!uni) {
        return;
      }

      new Notification("Application Deadline Reminder", {
        body: `${uni.name} closes in ${item.days} day${item.days === 1 ? "" : "s"}.`,
      });
    });
  };

  const filteredUnis = useMemo(() => {
    let list = UNIVERSITIES;

    if (activeTab === "saved") {
      list = list.filter((u) => bookmarks.includes(u.id));

      if (savedFolderFilter !== "all") {
        list = list.filter(
          (u) => (bookmarkMeta[u.id]?.folder || "General") === savedFolderFilter
        );
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, bookmarks, activeTab, savedFolderFilter, bookmarkMeta]);

  const compareUnis = useMemo(
    () => UNIVERSITIES.filter((u) => compareIds.includes(u.id)),
    [compareIds]
  );

  const savedFolders = useMemo(() => {
    const folders = bookmarks.map((id) => bookmarkMeta[id]?.folder || "General");
    return [...new Set(folders)];
  }, [bookmarks, bookmarkMeta]);

  const recommendations = useMemo(() => {
    if (!bookmarks.length) {
      return UNIVERSITIES.slice(0, 3);
    }

    const favoriteProvinces = bookmarks
      .map((id) => {
        const uni = UNIVERSITIES.find((u) => u.id === id);
        return uni?.location?.split(", ").pop();
      })
      .filter(Boolean);

    const provinceScores = favoriteProvinces.reduce((acc, province) => {
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {});

    return UNIVERSITIES
      .filter((u) => !bookmarks.includes(u.id))
      .map((u) => {
        const province = u.location.split(", ").pop();
        return {
          ...u,
          score: provinceScores[province] || 0,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [bookmarks]);

  const provinces = [...new Set(UNIVERSITIES.map((u) => u.location.split(", ").pop()))];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Navbar */}
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
            <div className="burger-menu">
              <a onClick={() => navigate("/Profile")}>
                {user?.displayName || user?.email || "Guest"}
              </a>
              <a onClick={() => navigate("/Practise")}>Practise</a>
              <a
                onClick={() => navigate("/Bursary")}
                className="active"
              >
                Bursaries
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-page">
        {/* Welcome */}
        <header className="dashboard-welcome">
          <h1 className="dashboard-welcome__greeting">
            Welcome back, <span>{user?.displayName || "Student"}</span> 👋
          </h1>
          <p className="dashboard-welcome__sub">
            Explore universities and find your perfect academic match.
          </p>
        </header>

        {/* Search */}
        <div className="dashboard-search">
          <div className="dashboard-search__wrapper">
            <FaSearch className="dashboard-search__icon" />
            <input
              className="dashboard-search__input"
              type="text"
              placeholder="Search universities by name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Nav Shortcuts */}
        <div className="dashboard-shortcuts">
          <button
            className="dashboard-shortcut"
            onClick={() => navigate("/Profile")}
          >
            <FaUserCircle /> My Profile
          </button>
          <button
            className="dashboard-shortcut"
            onClick={() => navigate("/Practise")}
          >
            <FaPencilAlt /> Past Papers
          </button>
          <button
            className="dashboard-shortcut"
            onClick={() => navigate("/Bursary")}
          >
            <FaGraduationCap /> Bursaries
          </button>
          <button
            className="dashboard-shortcut"
            onClick={() => {
              setAlertsEnabled((prev) => !prev);
              sendDeadlineReminders();
            }}
          >
            <FaBell /> {alertsEnabled ? "Reminders On" : "Enable Reminders"}
          </button>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--blue">
              {UNIVERSITIES.length}
            </p>
            <p className="dashboard-stat__label">Universities</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">
              {provinces.length}
            </p>
            <p className="dashboard-stat__label">Provinces</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--purple">
              {bookmarks.length}
            </p>
            <p className="dashboard-stat__label">Saved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "all" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Universities
          </button>
          <button
            className={`dashboard-tab ${activeTab === "saved" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            Saved ({bookmarks.length})
          </button>
        </div>

        {activeTab === "saved" && savedFolders.length > 0 && (
          <div className="dashboard-tabs" style={{ marginTop: 8 }}>
            <button
              className={`dashboard-tab ${savedFolderFilter === "all" ? "dashboard-tab--active" : ""}`}
              onClick={() => setSavedFolderFilter("all")}
            >
              All Folders
            </button>
            {savedFolders.map((folder) => (
              <button
                key={folder}
                className={`dashboard-tab ${savedFolderFilter === folder ? "dashboard-tab--active" : ""}`}
                onClick={() => setSavedFolderFilter(folder)}
              >
                {folder}
              </button>
            ))}
          </div>
        )}

        {compareUnis.length > 0 && (
          <section className="dashboard-compare" aria-label="Compare Universities">
            <div className="dashboard-compare__header">
              <p className="dashboard-stat__label" style={{ margin: 0 }}>
                <FaBalanceScale /> Compare Universities ({compareUnis.length}/4)
              </p>
              <button className="dashboard-tab dashboard-compare__clear" onClick={() => setCompareIds([])}>
                Clear Compare
              </button>
            </div>
            <div className="dashboard-compare__table-wrap">
              <table className="dashboard-compare__table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Province</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compareUnis.map((uni) => {
                    const deadline = bookmarkMeta[uni.id]?.deadline || UNIVERSITY_DEADLINES[uni.id];
                    const status = deadline ? getAvailabilityStatus(deadline) : null;
                    const statusClass =
                      status?.label === "Application Open"
                        ? "dashboard-compare__status--open"
                        : status?.label === "Closing Soon"
                          ? "dashboard-compare__status--soon"
                          : status?.label === "Closed"
                            ? "dashboard-compare__status--closed"
                            : "dashboard-compare__status--neutral";

                    return (
                      <tr key={`compare-${uni.id}`}>
                        <td data-label="University">{uni.name}</td>
                        <td data-label="Province">{uni.location.split(", ").pop()}</td>
                        <td data-label="Deadline">{deadline || "N/A"}</td>
                        <td data-label="Status">
                          <span className={`dashboard-compare__status ${statusClass}`}>
                            {status?.label || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="dashboard-recommendations" aria-label="Smart Recommendations">
            <div className="dashboard-recommendations__header">
              <p className="dashboard-stat__label" style={{ margin: 0 }}>
                Smart Recommendations
              </p>
              <span className="dashboard-recommendations__hint">
                Based on your saved universities and preferred provinces.
              </span>
            </div>
            <div className="dashboard-recommendations__grid">
              {recommendations.map((uni) => {
                const isSaved = bookmarks.includes(uni.id);
                const province = uni.location.split(", ").pop();

                return (
                  <button
                    key={`rec-${uni.id}`}
                    className={`dashboard-recommendation ${isSaved ? "dashboard-recommendation--saved" : ""}`}
                    onClick={() => toggleBookmark(uni.id)}
                  >
                    <span className="dashboard-recommendation__title">{uni.name}</span>
                    <span className="dashboard-recommendation__meta">
                      <FaMapMarkerAlt /> {province}
                    </span>
                    <span className="dashboard-recommendation__cta">
                      {isSaved ? "Saved" : "Save Recommendation"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* University Cards Grid */}
        {filteredUnis.length > 0 ? (
          <div className="uni-grid" key={activeTab}>
            {filteredUnis.map((uni) => {
              const deadline = bookmarkMeta[uni.id]?.deadline || UNIVERSITY_DEADLINES[uni.id];
              const status = deadline ? getAvailabilityStatus(deadline) : null;
              const noteValue = bookmarkMeta[uni.id]?.notes || "";
              const folderValue = bookmarkMeta[uni.id]?.folder || "General";
              const compareSelected = compareIds.includes(uni.id);

              return (
                <article className="uni-card" key={uni.id}>
                  <div className="uni-card__header">
                    <img
                      className="uni-card__logo"
                      src={uni.logo}
                      alt={`${uni.name} logo`}
                    />
                    <button
                      className={`uni-card__bookmark ${bookmarks.includes(uni.id) ? "uni-card__bookmark--active" : ""}`}
                      onClick={() => toggleBookmark(uni.id)}
                      aria-label={
                        bookmarks.includes(uni.id)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                      title={
                        bookmarks.includes(uni.id)
                          ? "Remove from saved"
                          : "Save for later"
                      }
                    >
                      {bookmarks.includes(uni.id) ? (
                        <FaBookmark />
                      ) : (
                        <FaRegBookmark />
                      )}
                    </button>
                  </div>

                  <div className="uni-card__body">
                    <h3 className="uni-card__name">{uni.name}</h3>
                    <p className="uni-card__location">
                      <FaMapMarkerAlt /> {uni.location}
                    </p>
                    {status && (
                      <div className="uni-card__status-row">
                        <span
                          className="uni-card__status-pill"
                          style={{
                            background: status.background,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                        <span className="uni-card__status-pill uni-card__status-pill--days">
                          <FaClock className="uni-card__status-icon" />
                          {getDaysLeftLabel(status.days)}
                        </span>
                      </div>
                    )}
                    <p className="uni-card__desc">{uni.description}</p>
                    <div className="uni-card__actions" style={{ gap: 8, display: "flex", flexWrap: "wrap" }}>
                      <button
                        className="uni-card__btn uni-card__btn--primary"
                        onClick={() => window.open(uni.applyUrl)}
                      >
                        Apply Now <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                      </button>
                      <button
                        className="uni-card__btn"
                        onClick={() => toggleCompare(uni.id)}
                        style={{
                          borderColor: compareSelected ? "#4338ca" : undefined,
                          color: compareSelected ? "#4338ca" : undefined,
                        }}
                      >
                        <FaBalanceScale /> {compareSelected ? "Added to Compare" : "Compare"}
                      </button>
                    </div>

                    {bookmarks.includes(uni.id) && activeTab === "saved" && (
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        <label style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                          Folder
                        </label>
                        <select
                          value={folderValue}
                          onChange={(e) => updateBookmarkMeta(uni.id, { folder: e.target.value })}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 8 }}
                        >
                          {BOOKMARK_FOLDERS.map((folder) => (
                            <option key={`${uni.id}-${folder}`} value={folder}>
                              {folder}
                            </option>
                          ))}
                        </select>

                        <label style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600 }}>
                          Notes
                        </label>
                        <textarea
                          value={noteValue}
                          placeholder="Write private notes for this university..."
                          onChange={(e) => updateBookmarkMeta(uni.id, { notes: e.target.value })}
                          rows={3}
                          style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 8, resize: "vertical" }}
                        />

                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.83rem" }}>
                          <input
                            type="checkbox"
                            checked={bookmarkMeta[uni.id]?.reminderEnabled !== false}
                            onChange={(e) => updateBookmarkMeta(uni.id, { reminderEnabled: e.target.checked })}
                          />
                          Enable reminder notifications
                        </label>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty__icon">🔍</div>
            <p className="dashboard-empty__text">
              {activeTab === "saved"
                ? "You haven't saved any universities yet. Tap the bookmark icon to save."
                : "No universities match your search."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a className="logo">
                Grad<span>iate</span>
              </a>
              <p>Smart education matching for everyone.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#">How It Works</a>
                <a href="#">Features</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="#" title="Facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" title="LinkedIn" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
            <p className="copyright">
              &copy; 2026 THANDULULO TECHNOLOGIES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
