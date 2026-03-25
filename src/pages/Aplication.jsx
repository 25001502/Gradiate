import React, { useEffect, useState, useMemo } from "react";
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
  const navigate = useNavigate();
  const { user } = useAuth();

  const buildBookmarkPayload = (universityId) => {
    const uni = UNIVERSITIES.find((item) => item.id === universityId);
    if (!uni) {
      return null;
    }

    return {
      name: uni.name,
      category: uni.location.split(", ").pop() || "General",
      createdAt: serverTimestamp(),
    };
  };

  const saveBookmarkToFirestore = async (universityId) => {
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
  };

  const removeBookmarkFromFirestore = async (universityId) => {
    if (!user?.uid) {
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "bookmarks", universityId));
  };

  const loadBookmarksFromFirestore = async () => {
    if (!user?.uid) {
      return;
    }

    const snapshot = await getDocs(collection(db, "users", user.uid, "bookmarks"));
    return snapshot.docs.map((bookmarkDoc) => bookmarkDoc.id);
  };

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

        const cloudBookmarks = (await loadBookmarksFromFirestore()) || [];

        const missingInCloud = localBookmarks.filter(
          (bookmarkId) => !cloudBookmarks.includes(bookmarkId)
        );

        await Promise.all(
          missingInCloud.map(async (bookmarkId) => {
            await saveBookmarkToFirestore(bookmarkId);
          })
        );

        const mergedBookmarks = [...new Set([...cloudBookmarks, ...localBookmarks])];

        if (!isCancelled) {
          setBookmarks(mergedBookmarks);
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
  }, [user?.uid]);

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

      localStorage.setItem("gradiate_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const filteredUnis = useMemo(() => {
    let list = UNIVERSITIES;

    if (activeTab === "saved") {
      list = list.filter((u) => bookmarks.includes(u.id));
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
  }, [search, bookmarks, activeTab]);

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

        {/* University Cards Grid */}
        {filteredUnis.length > 0 ? (
          <div className="uni-grid" key={activeTab}>
            {filteredUnis.map((uni) => (
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
                  <p className="uni-card__desc">{uni.description}</p>
                  <div className="uni-card__actions">
                    <button
                      className="uni-card__btn uni-card__btn--primary"
                      onClick={() => window.open(uni.applyUrl)}
                    >
                      Apply Now <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
