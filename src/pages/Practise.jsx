import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardSection from "../components/DashboardSection";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaBookmark,
  FaRegBookmark,
  FaExternalLinkAlt,
  FaUserCircle,
  FaPencilAlt,
  FaGraduationCap,
} from "react-icons/fa";

const subjects = [
  {
    name: "Mathematics",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=M_7mZq2zE5o%3d&tabid=4682&portalid=0&mid=12681&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Zoios-rCurI%3d&tabid=4682&portalid=0&mid=12681&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Juy5nA5N3fM%3d&tabid=3294&portalid=0&mid=10986&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DqfP-i10rEE%3d&tabid=3294&portalid=0&mid=10986&forcedownload=true" },
      { year: 2021, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sGgq9FNv0lQ%3d&tabid=2922&portalid=0&mid=10135&forcedownload=true" },
      { year: 2021, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=jgMJbW3Aa0o%3d&tabid=2922&portalid=0&mid=10135&forcedownload=true" },
    ],
  },
  {
    name: "Physical Sciences",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=oTJzzXEU6Ng%3d&tabid=4682&portalid=0&mid=12685&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Gs2cDJBpRR0%3d&tabid=4682&portalid=0&mid=12685&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=5l5vQTQBaU4%3d&tabid=3294&portalid=0&mid=10990&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=_7CRVUkWGMA%3d&tabid=3294&portalid=0&mid=10990&forcedownload=true" },
    ],
  },
  {
    name: "Life Sciences",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=5Xc2L4uffmA%3d&tabid=4682&portalid=0&mid=12679&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=4yWO4CegNNE%3d&tabid=4682&portalid=0&mid=12679&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Fg44KuXQ8Es%3d&tabid=3294&portalid=0&mid=10984&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=FPGyIKhYDUw%3d&tabid=3294&portalid=0&mid=10984&forcedownload=true" },
    ],
  },
  {
    name: "Geography",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sOLlvteQCeM%3d&tabid=4682&portalid=0&mid=12674&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=qCvbCunZPCY%3d&tabid=4682&portalid=0&mid=12674&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=T4gsWEf6_A0%3d&tabid=3294&portalid=0&mid=10979&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=yFfqSPQtFNw%3d&tabid=3294&portalid=0&mid=10979&forcedownload=true" },
    ],
  },
  {
    name: "History",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DrznBkYP4P0%3d&tabid=4682&portalid=0&mid=12675&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=YIVtG2z_yWE%3d&tabid=4682&portalid=0&mid=12675&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=y2jZuQHPLLs%3d&tabid=3294&portalid=0&mid=10980&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=zuyAs-Eq55E%3d&tabid=3294&portalid=0&mid=10980&forcedownload=true" },
    ],
  },
  {
    name: "Accounting",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=I3ZOntNTjjo%3d&tabid=4682&portalid=0&mid=12660&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=89AYULMK6WY%3d&tabid=4682&portalid=0&mid=12660&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=l3HgEye_Xg8%3d&tabid=3294&portalid=0&mid=10965&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=rEzVzZbaHTs%3d&tabid=3294&portalid=0&mid=10965&forcedownload=true" },
    ],
  },
  {
    name: "English FAL",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=rzKvzSdEjAU%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=8l6DnwdLPXY%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=ehLuStOw2jA%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=6u3vvGSi-40%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=7MabwVLlFcQ%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
      { year: 2022, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=gFBCYV3CPk0%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
    ],
  },
  {
    name: "Economics",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Dlshc30RtYk%3d&tabid=4682&portalid=0&mid=12671&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sct4D9kRRhY%3d&tabid=4682&portalid=0&mid=12671&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=ZbwLwi4Nbbk%3d&tabid=3294&portalid=0&mid=10976&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=mz3AECevBTo%3d&tabid=3294&portalid=0&mid=10976&forcedownload=true" },
    ],
  },
  {
    name: "Tshivenda",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=wCCGQHOQMJw%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=JG3CRnCamJU%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Zc--UDPGU-k%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DDfl_Fd0ruE%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=g5wCgeulASo%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=-2P9opC9-Jw%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
    ],
  },
  {
    name: "Business Studies",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=j-o_oRFFS7A%3d&tabid=4682&portalid=0&mid=12664&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=d0WgLcInBU8%3d&tabid=4682&portalid=0&mid=12664&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=XKSOkexd5ho%3d&tabid=3294&portalid=0&mid=10969&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=j4GWWzHMKt4%3d&tabid=3294&portalid=0&mid=10969&forcedownload=true" },
    ],
  },
];

export default function Practise() {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "saved"
  const [savedSubjects, setSavedSubjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gradiate_practice_saved_subjects")) || [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleSubjectSave = (subjectName) => {
    setSavedSubjects((prev) => {
      const next = prev.includes(subjectName)
        ? prev.filter((item) => item !== subjectName)
        : [...prev, subjectName];
      localStorage.setItem("gradiate_practice_saved_subjects", JSON.stringify(next));
      return next;
    });
  };

  const totalPapers = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.papers.length, 0),
    []
  );

  const filteredSubjects = useMemo(() => {
    let list = subjects;

    if (activeTab === "saved") {
      list = list.filter((subject) => savedSubjects.includes(subject.name));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (subject) =>
          subject.name.toLowerCase().includes(q) ||
          subject.papers.some(
            (paper) =>
              String(paper.year).includes(q) ||
              paper.type.toLowerCase().includes(q)
          )
      );
    }

    return list;
  }, [activeTab, savedSubjects, search]);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div>
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
              <a onClick={() => navigate("/profile")}>
                {user?.displayName || user?.email || "Guest"}
              </a>
              <a onClick={() => navigate("/application")}>Application</a>
              <a
                onClick={() =>
                  alert("Sorry! this feature is not yet available")
                }
                className="active"
              >
                Bursaries
              </a>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-page">
        <DashboardSection
          title="Past Paper Hub"
          subtitle="Find Grade 12 NSC papers by subject, year, and paper type."
          searchPlaceholder="Search subjects, year, or paper type..."
          searchValue={search}
          onSearchChange={setSearch}
          shortcuts={[
            {
              label: "My Profile",
              icon: <FaUserCircle />,
              onClick: () => navigate("/profile"),
            },
            {
              label: "Application",
              icon: <FaPencilAlt />,
              onClick: () => navigate("/application"),
            },
            {
              label: "Bursaries",
              icon: <FaGraduationCap />,
              onClick: () => alert("Sorry! this feature is not yet available"),
            },
          ]}
          stats={[
            {
              label: "Subjects",
              value: subjects.length,
              valueClass: "dashboard-stat__value--blue",
            },
            {
              label: "Total Papers",
              value: totalPapers,
              valueClass: "dashboard-stat__value--green",
            },
            {
              label: "Saved Subjects",
              value: savedSubjects.length,
              valueClass: "dashboard-stat__value--purple",
            },
          ]}
          tabs={[
            { key: "all", label: "All Subjects" },
            { key: "saved", label: `Saved (${savedSubjects.length})` },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {filteredSubjects.length > 0 ? (
          <div className="uni-grid" key={activeTab}>
            {filteredSubjects.map((subject, idx) => {
              const isOpen = openIndex === idx;
              const isSaved = savedSubjects.includes(subject.name);

              return (
                <article className="uni-card" key={subject.name}>
                  <div className="uni-card__header">
                    <div className="uni-card__logo" style={{
                      display: "grid",
                      placeItems: "center",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      borderRadius: 12,
                    }}>
                      NSC
                    </div>
                    <button
                      className={`uni-card__bookmark ${isSaved ? "uni-card__bookmark--active" : ""}`}
                      onClick={() => toggleSubjectSave(subject.name)}
                      aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
                      title={isSaved ? "Remove from saved" : "Save for later"}
                    >
                      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>

                  <div className="uni-card__body">
                    <h3 className="uni-card__name">{subject.name}</h3>
                    <p className="uni-card__location">{subject.papers.length} papers available</p>
                    <p className="uni-card__desc">
                      Tap open to view downloadable papers by year and paper type.
                    </p>
                    <div className="uni-card__actions" style={{ marginBottom: isOpen ? 8 : 0 }}>
                      <button
                        className="uni-card__btn uni-card__btn--primary"
                        onClick={() => handleToggle(idx)}
                      >
                        {isOpen ? "Hide Papers" : "View Papers"}
                      </button>
                    </div>

                    {isOpen && (
                      <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                        {subject.papers.map((paper) => (
                          <a
                            key={`${subject.name}-${paper.year}-${paper.type}`}
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="uni-card__btn"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{paper.year} {paper.type}</span>
                            <FaExternalLinkAlt style={{ fontSize: "0.75rem" }} />
                          </a>
                        ))}
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
                ? "You have not saved any subjects yet. Tap the bookmark icon to save."
                : "No subjects match your search."}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .uni-card__btn {
          border: 1px solid #dbe5f5;
          border-radius: 12px;
          padding: 10px 12px;
          color: #1e3a8a;
          text-decoration: none;
          background: #f8fbff;
          transition: background 0.2s ease;
        }
        .uni-card__btn:hover {
          background: #edf4ff;
        }
      `}</style>

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
