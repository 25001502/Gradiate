import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase/firestore";
import { trackEvent } from "../lib/analytics";
import ApplicationTrackingPanel from "../components/ApplicationTrackingPanel";
import {
  APPLICATION_TRACKING_TYPES,
  getApplicationTrackingProgress,
  getDefaultApplicationTracking,
  normalizeApplicationTracking,
} from "../lib/applicationTracking";
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
    logo: "/universities/univen.png",
    description:
      "Known for diverse programs and a strong commitment to rural development across science, education, law, and more.",
    applyUrl:
      "https://www.univen.ac.za/students/student-support-services/how-to-apply/",
  },
  {
    id: "ul",
    name: "University of Limpopo",
    shortName: "UL",
    location: "Mankweng, Limpopo",
    logo: "/universities/ul.png",
    description:
      "Offers focused programs in health sciences, agriculture, education, commerce, and humanities.",
    applyUrl: "https://www.ul.ac.za/tgsl/tgsl-programmes/",
  },
  {
    id: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    location: "Johannesburg, Gauteng",
    logo: "/universities/uj.svg",
    description:
      "A large urban university known for innovation, inclusivity, and a broad range of academic programs.",
    applyUrl: "https://www.uj.ac.za/admission-aid/undergraduate/",
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    location: "Johannesburg, Gauteng",
    logo: "/universities/wits.jpg",
    description:
      "A leading research university in Africa with strong academic depth across science, health, business, and the humanities.",
    applyUrl: "https://www.wits.ac.za/undergraduate/apply-to-wits/",
  },
  {
    id: "tut",
    name: "Tshwane University of Technology",
    shortName: "TUT",
    location: "Pretoria, Gauteng",
    logo: "/universities/tut.svg",
    description:
      "A major technology-focused university offering practical and career-oriented programs across several campuses.",
    applyUrl: "https://www.tut.ac.za/",
  },
  {
    id: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    location: "Cape Town, Western Cape",
    logo: "/universities/uct.png",
    description:
      "A highly ranked university with strong academic leadership in science, business, health sciences, and the humanities.",
    applyUrl:
      "https://uct.ac.za/students/applications-apply-undergraduate-qualifications/application-procedure",
  },
  {
    id: "uwc",
    name: "University of the Western Cape",
    shortName: "UWC",
    location: "Bellville, Western Cape",
    logo: "/universities/uwc.png",
    description:
      "A public university with strong teaching and research across health, law, education, natural sciences, and social sciences.",
    applyUrl: "https://www.uwc.ac.za/study/apply",
  },
  {
    id: "su",
    name: "Stellenbosch University",
    shortName: "SU",
    location: "Stellenbosch, Western Cape",
    logo: "/universities/su.jpg",
    description:
      "A research-intensive university offering a wide range of undergraduate and postgraduate study options.",
    applyUrl: "https://www.sun.ac.za/english/maties/apply",
  },
  {
    id: "up",
    name: "University of Pretoria",
    shortName: "UP",
    location: "Pretoria, Gauteng",
    logo: "/universities/up.png",
    description:
      "A large research university with broad academic pathways in science, law, commerce, engineering, health, and humanities.",
    applyUrl: "https://www.up.ac.za/online-application",
  },
  {
    id: "ukzn",
    name: "University of KwaZulu-Natal",
    shortName: "UKZN",
    location: "Durban and Pietermaritzburg, KwaZulu-Natal",
    logo: "/universities/ukzn.png",
    description:
      "A multi-campus university serving KwaZulu-Natal with programs across health sciences, engineering, agriculture, law, and humanities.",
    applyUrl: "https://ukzn.ac.za/apply-to-ukzn/",
  },
  {
    id: "rhodes",
    name: "Rhodes University",
    shortName: "Rhodes",
    location: "Makhanda, Eastern Cape",
    logo: "/universities/rhodes.png",
    description:
      "A residential university known for close academic communities, humanities, science, journalism, commerce, and law.",
    applyUrl: "https://www.ru.ac.za/admissiongateway/application/",
  },
  {
    id: "unisa",
    name: "University of South Africa",
    shortName: "UNISA",
    location: "Pretoria, Gauteng",
    logo: "/universities/unisa.jpg",
    description:
      "South Africa's largest open distance learning university, serving students nationwide through flexible study options.",
    applyUrl:
      "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission",
  },
  {
    id: "nwu",
    name: "North-West University",
    shortName: "NWU",
    location: "Potchefstroom, North West",
    logo: "/universities/nwu.svg",
    description:
      "A multi-campus university offering programs across education, commerce, health sciences, law, engineering, and humanities.",
    applyUrl: "https://studies.nwu.ac.za/studies/apply",
  },
  {
    id: "ufs",
    name: "University of the Free State",
    shortName: "UFS",
    location: "Bloemfontein, Free State",
    logo: "/universities/ufs.svg",
    description:
      "A comprehensive university with strong academic offerings across health sciences, law, natural sciences, education, and the humanities.",
    applyUrl: "https://www.ufs.ac.za/prospective",
  },
  {
    id: "nmu",
    name: "Nelson Mandela University",
    shortName: "NMU",
    location: "Gqeberha, Eastern Cape",
    logo: "/universities/nmu.svg",
    description:
      "A coastal university offering career-focused and research-led programs across multiple faculties.",
    applyUrl: "https://www.mandela.ac.za/Study-at-Mandela/Apply",
  },
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    shortName: "CPUT",
    location: "Cape Town, Western Cape",
    logo: "/universities/cput.svg",
    description:
      "A technology university offering applied programs in engineering, business, informatics, design, health, and education.",
    applyUrl: "https://www.cput.ac.za/study/apply",
  },
  {
    id: "unizulu",
    name: "University of Zululand",
    shortName: "UNIZULU",
    location: "KwaDlangezwa, KwaZulu-Natal",
    logo: "/universities/unizulu.png",
    description:
      "A comprehensive university with programs in commerce, law, humanities, education, science, and agriculture.",
    applyUrl: "https://www.unizulu.ac.za/apply/",
  },
  {
    id: "vut",
    name: "Vaal University of Technology",
    shortName: "VUT",
    location: "Vanderbijlpark, Gauteng",
    logo: "/universities/vut.png",
    description:
      "A technology university focused on career-ready qualifications in engineering, applied sciences, management, and human sciences.",
    applyUrl: "https://www.vut.ac.za/apply-to-vut/",
  },
  {
    id: "cut",
    name: "Central University of Technology",
    shortName: "CUT",
    location: "Bloemfontein, Free State",
    logo: "/universities/cut.png",
    description:
      "A university of technology offering applied programs in engineering, health, management sciences, and humanities.",
    applyUrl: "https://www.cut.ac.za/application-process",
  },
  {
    id: "wsu",
    name: "Walter Sisulu University",
    shortName: "WSU",
    location: "Mthatha, Eastern Cape",
    logo: "/universities/wsu.png",
    description:
      "A multi-campus university serving the Eastern Cape with academic programs across health, business, education, science, and technology.",
    applyUrl: "https://www.wsu.ac.za/index.php/apply-now",
  },
  {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    location: "Mbombela, Mpumalanga",
    logo: "/universities/ump.svg",
    description:
      "A growing university offering programs linked to agriculture, education, hospitality, development studies, and science.",
    applyUrl: "https://www.ump.ac.za/Study-with-us/Application-Process",
  },
  {
    id: "spu",
    name: "Sol Plaatje University",
    shortName: "SPU",
    location: "Kimberley, Northern Cape",
    logo: "/universities/spu.svg",
    description:
      "A young university in the Northern Cape with programs in education, humanities, natural sciences, data science, and management.",
    applyUrl: "https://www.spu.ac.za/index.php/how-to-apply/",
  },
  {
    id: "dut",
    name: "Durban University of Technology",
    shortName: "DUT",
    location: "Durban, KwaZulu-Natal",
    logo: "/universities/dut.jpg",
    description:
      "A technology university offering applied programs across engineering, health sciences, management, arts, and accounting.",
    applyUrl:
      "https://www.dut.ac.za/student_portal/student_registration/how_to_apply/",
  },
  {
    id: "smu",
    name: "Sefako Makgatho Health Sciences University",
    shortName: "SMU",
    location: "Ga-Rankuwa, Gauteng",
    logo: "/universities/smu.png",
    description:
      "A health sciences university focused on medicine, dentistry, pharmacy, nursing, public health, and related sciences.",
    applyUrl: "https://www.smu.ac.za/students/apply/",
  },
  {
    id: "ufh",
    name: "University of Fort Hare",
    shortName: "UFH",
    location: "Alice, Eastern Cape",
    logo: "/universities/ufh.png",
    description:
      "A historic university offering programs across education, law, management, social sciences, agriculture, and health sciences.",
    applyUrl: "https://www.ufh.ac.za/apply",
  },
  {
    id: "mut",
    name: "Mangosuthu University of Technology",
    shortName: "MUT",
    location: "Umlazi, KwaZulu-Natal",
    logo: "/universities/mut.png",
    description:
      "A technology university offering career-focused programs in engineering, management sciences, and natural sciences.",
    applyUrl: "https://www.mut.ac.za/study-at-mut/apply-to-mut/",
  },
];

const BOOKMARK_FOLDERS = ["General", "Dream", "Safe", "Applied"];

const UNIVERSITY_DEADLINES = {
  univen: "2026-09-26",
  ul: "2026-09-30",
  uj: "2026-10-31",
  wits: "2026-09-30",
  tut: "2026-09-30",
  uct: "2026-07-31",
  uwc: "2026-09-30",
  su: "2026-07-31",
  up: "2026-08-31",
  ukzn: "2026-09-30",
  rhodes: "2026-09-30",
  unisa: "2026-11-30",
  nwu: "2026-08-31",
  ufs: "2026-09-30",
  nmu: "2026-09-30",
  cput: "2026-09-30",
  unizulu: "2026-09-30",
  vut: "2026-09-30",
  cut: "2026-09-30",
  wsu: "2026-10-31",
  ump: "2026-11-30",
  spu: "2026-10-31",
  dut: "2026-09-30",
  smu: "2026-07-31",
  ufh: "2026-10-31",
  mut: "2026-09-30",
};

const UNIVERSITY_OPENING_DATES = {
  univen: "05-02",
  wits: "03-01",
  unisa: "09-01",
  cput: "05-01",
  unizulu: "05-01",
  vut: "05-01",
  spu: "04-20",
  smu: "04-02",
  ufh: "06-01",
  mut: "01-01",
};

function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(dateString);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getOpeningDateString(universityId, deadlineString) {
  const deadline = new Date(deadlineString);
  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  const openingMonthDay = UNIVERSITY_OPENING_DATES[universityId] || "04-01";
  return `${deadline.getFullYear()}-${openingMonthDay}`;
}

function getAvailabilityStatus(deadlineString, universityId) {
  const daysToDeadline = daysUntil(deadlineString);

  if (daysToDeadline < 0) {
    return {
      label: "Closed",
      color: "#991b1b",
      background: "#fee2e2",
      days: daysToDeadline,
      phase: "closed",
    };
  }

  const openingDateString = getOpeningDateString(universityId, deadlineString);
  const openingDate = openingDateString ? new Date(openingDateString) : null;
  const deadlineDate = new Date(deadlineString);
  const hasValidOpeningWindow =
    openingDate && !Number.isNaN(openingDate.getTime()) && openingDate < deadlineDate;

  if (hasValidOpeningWindow) {
    const daysToOpen = daysUntil(openingDateString);
    if (daysToOpen > 0) {
      return {
        label: "Opening Soon",
        color: "#1d4ed8",
        background: "#dbeafe",
        days: daysToOpen,
        phase: "opening",
      };
    }
  }

  if (daysToDeadline <= 14) {
    return {
      label: "Closing Soon",
      color: "#9a3412",
      background: "#ffedd5",
      days: daysToDeadline,
      phase: "deadline",
    };
  }

  return {
    label: "Application Open",
    color: "#166534",
    background: "#dcfce7",
    days: daysToDeadline,
    phase: "deadline",
  };
}

function getDaysLeftLabel(days, phase = "deadline") {
  if (days < 0) return "Closed";
  if (phase === "opening") {
    if (days === 1) return "Opens in 1 day";
    return `Opens in ${days} days`;
  }
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function formatDateLabel(dateInput) {
  if (!dateInput) {
    return "N/A";
  }

  const parsedDate =
    typeof dateInput?.toDate === "function" ? dateInput.toDate() : new Date(dateInput);

  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return String(dateInput);
  }

  return parsedDate.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Component ────────────────────────────────────────────────────────────────
import SEO from '../components/SEO';
export default function Aplication() {
  
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
 
  const navigate = useNavigate();
  const { user,  } = useAuth();
  const isGuest = !user?.uid;

  const getUniversityAnalyticsParams = (universityId) => {
    const university = UNIVERSITIES.find((item) => item.id === universityId);
    if (!university) {
      return {};
    }

    return {
      university_id: university.id,
      university_name: university.name,
      province: university.location.split(", ").pop() || "Unknown",
    };
  };

  
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
      applicationTracking: {
        ...getDefaultApplicationTracking(APPLICATION_TRACKING_TYPES.university),
        updatedAt: serverTimestamp(),
      },
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
        console.error("Failed to sync bookmarks", error);
      }
    };

    syncBookmarks();

    return () => {
      isCancelled = true;
    };
  }, [loadBookmarksFromFirestore, saveBookmarkToFirestore, user?.uid]);

  useEffect(() => {
    if (!isGuest) {
      return;
    }

    setBookmarks([]);
    setBookmarkMeta({});
    setSavedFolderFilter("all");
    if (activeTab === "saved") {
      setActiveTab("all");
    }
  }, [activeTab, isGuest]);

  // Derived data
  const toggleBookmark = (id) => {
    if (isGuest) {
      navigate("/auth");
      return;
    }

    setBookmarks((prev) => {
      const isRemoving = prev.includes(id);
      const next = isRemoving
        ? prev.filter((b) => b !== id)
        : [...prev, id];

      if (user?.uid) {
        const persistPromise = isRemoving
          ? removeBookmarkFromFirestore(id)
          : saveBookmarkToFirestore(id);
        persistPromise
          .then(() => {
            if (!isRemoving) {
              trackEvent("save_university", {
                ...getUniversityAnalyticsParams(id),
                source: activeTab === "saved" ? "saved_tab" : "university_card",
              });
            }
          })
          .catch((error) => {
            console.error("Failed to update bookmark", error);
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
            applicationTracking: getDefaultApplicationTracking(APPLICATION_TRACKING_TYPES.university),
          };
        }
        return nextMeta;
      });

      localStorage.setItem("gradiate_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const updateBookmarkMeta = (id, partialMeta) => {
    if (isGuest) {
      navigate("/auth");
      return;
    }

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

  const persistApplicationTracking = (id, nextTracking, eventName, eventParams = {}) => {
    if (isGuest) {
      navigate("/auth");
      return;
    }

    const normalizedTracking = normalizeApplicationTracking(
      nextTracking,
      APPLICATION_TRACKING_TYPES.university
    );
    const progress = getApplicationTrackingProgress(
      normalizedTracking,
      APPLICATION_TRACKING_TYPES.university
    );

    setBookmarkMeta((prevMeta) => ({
      ...prevMeta,
      [id]: {
        ...(prevMeta[id] || {}),
        applicationTracking: normalizedTracking,
      },
    }));

    setDoc(
      doc(db, "users", user.uid, "bookmarks", id),
      {
        applicationTracking: {
          ...normalizedTracking,
          updatedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
      .then(() => {
        trackEvent(eventName, {
          application_type: "university",
          status: normalizedTracking.status,
          progress_percent: progress.percent,
          ...getUniversityAnalyticsParams(id),
          ...eventParams,
        });
      })
      .catch((error) => {
        console.error("Failed to update application tracking:", error);
      });
  };

  const updateApplicationStatus = (id, status) => {
    const currentTracking = normalizeApplicationTracking(
      bookmarkMeta[id]?.applicationTracking,
      APPLICATION_TRACKING_TYPES.university
    );

    persistApplicationTracking(
      id,
      {
        ...currentTracking,
        status,
      },
      "application_status_updated"
    );
  };

  const updateApplicationChecklist = (id, checklistItem, checked) => {
    const currentTracking = normalizeApplicationTracking(
      bookmarkMeta[id]?.applicationTracking,
      APPLICATION_TRACKING_TYPES.university
    );

    persistApplicationTracking(
      id,
      {
        ...currentTracking,
        checklist: {
          ...currentTracking.checklist,
          [checklistItem]: checked,
        },
      },
      "application_checklist_updated",
      {
        checklist_item: checklistItem,
        checked,
      }
    );
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

  const handleApplicationClick = (university) => {
    trackEvent("application_click", {
      university_id: university.id,
      university_name: university.name,
      province: university.location.split(", ").pop() || "Unknown",
    });
    window.open(university.applyUrl, "_blank", "noopener,noreferrer");
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

  

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <SEO
        title="Application Tracker"
        canonical="/application"
        description="Track and manage your university and bursary applications with Gradiate. Stay organized, meet deadlines, and improve your chances of success."
      />
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
          
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-page">
        {/* Welcome */}
        <header className="dashboard-welcome">
          <h1 className="dashboard-welcome__greeting">
            Welcome back, <span>{user?.displayName || "Student"}</span>
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

        


        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "all" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Universities
          </button>
          {!isGuest && (
            <button
              className={`dashboard-tab ${activeTab === "saved" ? "dashboard-tab--active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Saved ({bookmarks.length})
            </button>
          )}
        </div>

        {!isGuest && activeTab === "saved" && savedFolders.length > 0 && (
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
                    const openingDate = deadline ? getOpeningDateString(uni.id, deadline) : null;
                    const status = deadline ? getAvailabilityStatus(deadline, uni.id) : null;
                    const statusClass =
                      status?.label === "Application Open"
                        ? "dashboard-compare__status--open"
                        : status?.label === "Closing Soon" || status?.label === "Opening Soon"
                          ? "dashboard-compare__status--soon"
                          : status?.label === "Closed"
                            ? "dashboard-compare__status--closed"
                            : "dashboard-compare__status--neutral";

                    return (
                      <tr key={`compare-${uni.id}`}>
                        <td data-label="University">{uni.name}</td>
                        <td data-label="Province">{uni.location.split(", ").pop()}</td>
                        <td data-label="Deadline">{formatDateLabel(deadline)}</td>
                        <td data-label="Status">
                          <span className={`dashboard-compare__status ${statusClass}`}>
                            {status?.label || "Unknown"}
                          </span>
                          <div style={{ marginTop: 6, fontSize: "0.75rem", color: "#475569" }}>
                            Opens {formatDateLabel(openingDate)}
                          </div>
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
              const openingDate = deadline ? getOpeningDateString(uni.id, deadline) : null;
              const status = deadline ? getAvailabilityStatus(deadline, uni.id) : null;
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
                      className={`uni-card__bookmark ${!isGuest && bookmarks.includes(uni.id) ? "uni-card__bookmark--active" : ""}`}
                      onClick={() => toggleBookmark(uni.id)}
                      aria-label={
                        isGuest
                          ? "Sign in to save university"
                          : bookmarks.includes(uni.id)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                      title={
                        isGuest
                          ? "Sign in to save universities"
                          : bookmarks.includes(uni.id)
                          ? "Remove from saved"
                          : "Save for later"
                      }
                    >
                      {!isGuest && bookmarks.includes(uni.id) ? (
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
                          {getDaysLeftLabel(status.days, status.phase)}
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: "0.8rem", color: "#475569", marginTop: 8 }}>
                      Opens {formatDateLabel(openingDate)} | Closes {formatDateLabel(deadline)}
                    </p>
                    <p className="uni-card__desc">{uni.description}</p>
                    <div className="uni-card__actions" style={{ gap: 8, display: "flex", flexWrap: "wrap" }}>
                      <button
                        className="uni-card__btn uni-card__btn--primary uni-card__btn--apply"
                        onClick={() => handleApplicationClick(uni)}
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

                    {!isGuest && bookmarks.includes(uni.id) && activeTab === "saved" && (
                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        <ApplicationTrackingPanel
                          type={APPLICATION_TRACKING_TYPES.university}
                          tracking={bookmarkMeta[uni.id]?.applicationTracking}
                          onStatusChange={(status) => updateApplicationStatus(uni.id, status)}
                          onChecklistChange={(item, checked) => updateApplicationChecklist(uni.id, item, checked)}
                        />

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
            <div className="dashboard-empty__icon" aria-hidden="true"><FaSearch /></div>
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
                <a href="/privacy-policy">Privacy Policy</a>
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
