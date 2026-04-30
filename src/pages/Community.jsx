import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  FaBell,
  FaBookOpen,
  FaBookmark,
  FaCheck,
  FaCommentDots,
  FaEdit,
  FaFlag,
  FaGraduationCap,
  FaHeart,
  FaHome,
  FaPaperPlane,
  FaRegBookmark,
  FaRegHeart,
  FaSave,
  FaSearch,
  FaSignInAlt,
  FaTimes,
  FaTrash,
  FaUniversity,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import { db } from "../lib/firebase/firestore";
import { routes } from "../lib/routes";

const POST_CATEGORIES = [
  { key: "general", label: "General", tone: "slate" },
  { key: "questions", label: "Questions", tone: "blue" },
  { key: "bursaries", label: "Bursaries", tone: "green" },
  { key: "applications", label: "Applications", tone: "orange" },
  { key: "study", label: "Study Tips", tone: "teal" },
  { key: "wins", label: "Wins", tone: "gold" },
];

const MAX_POST_LENGTH = 800;
const MAX_COMMENT_LENGTH = 420;
const POSTS_LIMIT = 40;
const COMMENTS_LIMIT = 8;
const REPORT_PREVIEW_LENGTH = 240;

const categoryByKey = POST_CATEGORIES.reduce((map, category) => {
  map[category.key] = category;
  return map;
}, {});

function getDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "Gradiate Student";
}

function getInitials(name = "GS") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GS";
}

function formatCommunityDate(value) {
  const date = typeof value?.toDate === "function" ? value.toDate() : null;

  if (!date) {
    return "Just now";
  }

  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ name, photoURL, size = "md" }) {
  return (
    <div className={`community-avatar community-avatar--${size}`}>
      {photoURL ? (
        <img src={photoURL} alt="" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [engagementByPost, setEngagementByPost] = useState({});
  const [postDraft, setPostDraft] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeView, setActiveView] = useState("feed");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [savedPostItems, setSavedPostItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
  const [editingPostId, setEditingPostId] = useState("");
  const [editDraft, setEditDraft] = useState({ content: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [error, setError] = useState("");
  const isGuest = !user?.uid;

  const postIdsKey = useMemo(() => posts.map((post) => post.id).join("|"), [posts]);
  const trimmedPostDraft = postDraft.trim();
  const postCharactersLeft = MAX_POST_LENGTH - postDraft.length;

  useEffect(() => {
    const postsQuery = query(
      collection(db, "communityPosts"),
      orderBy("createdAt", "desc"),
      limit(POSTS_LIMIT)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() })));
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error("Failed to load community posts", snapshotError);
        setError("Community feed could not load right now.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setSavedPostIds(new Set());
      setSavedPostItems([]);
      setNotifications([]);
      setIsCommunityAdmin(false);
      return undefined;
    }

    const savedUnsubscribe = onSnapshot(
      collection(db, "users", user.uid, "savedCommunityPosts"),
      (snapshot) => {
        const ids = new Set();
        const items = snapshot.docs.map((savedDoc) => {
          ids.add(savedDoc.id);
          return { id: savedDoc.id, ...savedDoc.data() };
        });

        setSavedPostIds(ids);
        setSavedPostItems(items);
      }
    );

    const notificationsUnsubscribe = onSnapshot(
      query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("createdAt", "desc"),
        limit(25)
      ),
      (snapshot) => {
        setNotifications(snapshot.docs.map((notificationDoc) => ({
          id: notificationDoc.id,
          ...notificationDoc.data(),
        })));
      }
    );

    const adminUnsubscribe = onSnapshot(doc(db, "communityAdmins", user.uid), (snapshot) => {
      setIsCommunityAdmin(snapshot.exists());
    });

    return () => {
      savedUnsubscribe();
      notificationsUnsubscribe();
      adminUnsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!isCommunityAdmin && activeView === "reports") {
      setActiveView("feed");
    }

    if (isGuest && activeView !== "feed") {
      setActiveView("feed");
    }
  }, [activeView, isCommunityAdmin, isGuest]);

  useEffect(() => {
    if (!isCommunityAdmin) {
      setReports([]);
      return undefined;
    }

    const reportsQuery = query(
      collection(db, "communityReports"),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    return onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      })));
    });
  }, [isCommunityAdmin]);

  useEffect(() => {
    const postIds = postIdsKey ? postIdsKey.split("|") : [];

    if (!postIds.length) {
      setEngagementByPost({});
      return undefined;
    }

    const unsubscribeFns = postIds.flatMap((postId) => {
      const likesRef = collection(db, "communityPosts", postId, "likes");
      const commentsQuery = query(
        collection(db, "communityPosts", postId, "comments"),
        orderBy("createdAt", "asc"),
        limit(COMMENTS_LIMIT)
      );

      const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
        setEngagementByPost((current) => ({
          ...current,
          [postId]: {
            ...current[postId],
            likeCount: snapshot.size,
            likedByMe: user?.uid ? snapshot.docs.some((likeDoc) => likeDoc.id === user.uid) : false,
          },
        }));
      });

      const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
        setEngagementByPost((current) => ({
          ...current,
          [postId]: {
            ...current[postId],
            comments: snapshot.docs.map((commentDoc) => ({
              id: commentDoc.id,
              ...commentDoc.data(),
            })),
          },
        }));
      });

      return [unsubscribeLikes, unsubscribeComments];
    });

    return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe());
  }, [postIdsKey, user?.uid]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      const haystack = `${post.content || ""} ${post.authorName || ""} ${post.category || ""}`.toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesView =
        activeView === "feed" ||
        (activeView === "mine" && post.authorId === user?.uid) ||
        (activeView === "saved" && savedPostIds.has(post.id));

      return matchesCategory && matchesSearch && matchesView;
    });
  }, [activeCategory, activeView, posts, savedPostIds, search, user?.uid]);

  const totalComments = useMemo(
    () =>
      Object.values(engagementByPost).reduce(
        (total, engagement) => total + (engagement.comments?.length || 0),
        0
      ),
    [engagementByPost]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const addNotificationToBatch = (batch, post, type, extra = {}) => {
    if (!post.authorId || post.authorId === user?.uid) {
      return;
    }

    const notificationRef = doc(collection(db, "users", post.authorId, "notifications"));

    batch.set(notificationRef, {
      recipientId: post.authorId,
      actorId: user.uid,
      actorName: getDisplayName(user),
      actorPhotoURL: user.photoURL || "",
      type,
      postId: post.id,
      postPreview: String(post.content || "").slice(0, 160),
      commentId: "",
      commentPreview: "",
      read: false,
      createdAt: serverTimestamp(),
      ...extra,
    });
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    if (!selectedCategory) {
      setError("Please choose a topic before posting.");
      return;
    }

    if (!trimmedPostDraft || trimmedPostDraft.length > MAX_POST_LENGTH || publishing) {
      return;
    }

    setPublishing(true);
    setError("");

    try {
      await addDoc(collection(db, "communityPosts"), {
        authorId: user.uid,
        authorName: getDisplayName(user),
        authorPhotoURL: user.photoURL || "",
        category: selectedCategory,
        content: trimmedPostDraft,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setPostDraft("");
      setSelectedCategory("");
    } catch (createError) {
      console.error("Failed to create community post", createError);
      setError("Your post could not be published. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleLike = async (post) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    const engagement = engagementByPost[post.id] || {};
    const likeRef = doc(db, "communityPosts", post.id, "likes", user.uid);
    const batch = writeBatch(db);

    try {
      if (engagement.likedByMe) {
        batch.delete(likeRef);
      } else {
        batch.set(likeRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        addNotificationToBatch(batch, post, "like");
      }

      await batch.commit();
    } catch (likeError) {
      console.error("Failed to update like", likeError);
      setError("Your reaction could not be saved.");
    }
  };

  const handleCreateComment = async (post) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    const postId = post.id;
    const content = (commentDrafts[postId] || "").trim();

    if (!content || content.length > MAX_COMMENT_LENGTH || busyPostId) {
      return;
    }

    setBusyPostId(postId);
    setError("");

    try {
      const batch = writeBatch(db);
      const commentRef = doc(collection(db, "communityPosts", postId, "comments"));

      batch.set(commentRef, {
        authorId: user.uid,
        authorName: getDisplayName(user),
        authorPhotoURL: user.photoURL || "",
        content,
        createdAt: serverTimestamp(),
      });
      addNotificationToBatch(batch, post, "comment", {
        commentId: commentRef.id,
        commentPreview: content.slice(0, 160),
      });

      await batch.commit();
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (commentError) {
      console.error("Failed to create comment", commentError);
      setError("Your comment could not be posted.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleToggleSave = async (post) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    const savedRef = doc(db, "users", user.uid, "savedCommunityPosts", post.id);
    setError("");

    try {
      if (savedPostIds.has(post.id)) {
        await deleteDoc(savedRef);
      } else {
        await setDoc(savedRef, {
          postId: post.id,
          authorId: post.authorId || "",
          authorName: post.authorName || "Gradiate Student",
          category: post.category || "general",
          contentPreview: String(post.content || "").slice(0, 180),
          savedAt: serverTimestamp(),
        });
      }
    } catch (saveError) {
      console.error("Failed to update saved post", saveError);
      setError("That post could not be saved right now.");
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditDraft({
      content: post.content || "",
      category: post.category || "",
    });
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingPostId("");
    setEditDraft({ content: "", category: "" });
  };

  const handleSaveEdit = async (postId) => {
    const content = editDraft.content.trim();

    if (!editDraft.category) {
      setError("Please choose a topic before saving.");
      return;
    }

    if (!content || content.length > MAX_POST_LENGTH || busyPostId) {
      return;
    }

    setBusyPostId(postId);
    setError("");

    try {
      await updateDoc(doc(db, "communityPosts", postId), {
        content,
        category: editDraft.category,
        updatedAt: serverTimestamp(),
      });
      handleCancelEdit();
    } catch (editError) {
      console.error("Failed to edit community post", editError);
      setError("That post could not be updated.");
    } finally {
      setBusyPostId("");
    }
  };

  const submitReport = async ({ targetType, post, comment = null }) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    const reason = window.prompt("Why are you reporting this?", "Needs review");
    const cleanReason = String(reason || "").trim();

    if (!cleanReason) {
      return;
    }

    const targetId = comment?.id || post.id;
    const reportRef = doc(db, "communityReports", `${targetType}_${post.id}_${targetId}_${user.uid}`);

    setError("");

    try {
      await setDoc(reportRef, {
        reporterId: user.uid,
        reporterName: getDisplayName(user),
        targetType,
        targetId,
        postId: post.id,
        commentId: comment?.id || "",
        targetAuthorId: comment?.authorId || post.authorId || "",
        reason: cleanReason.slice(0, 280),
        contentPreview: String(comment?.content || post.content || "").slice(0, REPORT_PREVIEW_LENGTH),
        status: "open",
        createdAt: serverTimestamp(),
      });
      setError("Report sent. Thanks for helping keep the community useful.");
    } catch (reportError) {
      console.error("Failed to report community content", reportError);
      setError("That report could not be sent, or you may have already reported it.");
    }
  };

  const deletePostWithChildren = async (postId) => {
    const postRef = doc(db, "communityPosts", postId);
    const [likesSnapshot, commentsSnapshot] = await Promise.all([
      getDocs(collection(db, "communityPosts", postId, "likes")),
      getDocs(collection(db, "communityPosts", postId, "comments")),
    ]);
    const cleanupBatch = writeBatch(db);

    likesSnapshot.docs.forEach((likeDoc) => cleanupBatch.delete(likeDoc.ref));
    commentsSnapshot.docs.forEach((commentDoc) => cleanupBatch.delete(commentDoc.ref));

    await cleanupBatch.commit();
    await deleteDoc(postRef);
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!user?.uid || busyPostId) {
      return;
    }

    setBusyPostId(postId);
    setError("");

    try {
      await deleteDoc(doc(db, "communityPosts", postId, "comments", commentId));
    } catch (deleteError) {
      console.error("Failed to delete comment", deleteError);
      setError("That comment could not be removed.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleDeletePost = async (post) => {
    if (!user?.uid || (post.authorId !== user.uid && !isCommunityAdmin) || busyPostId) {
      return;
    }

    const shouldDelete = window.confirm("Delete this community post?");
    if (!shouldDelete) {
      return;
    }

    setBusyPostId(post.id);
    setError("");

    try {
      await deletePostWithChildren(post.id);
    } catch (deleteError) {
      console.error("Failed to delete community post", deleteError);
      setError("That post could not be removed.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleResolveReport = async (report, status = "reviewed") => {
    if (!isCommunityAdmin) {
      return;
    }

    try {
      await updateDoc(doc(db, "communityReports", report.id), {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid,
      });
    } catch (reportError) {
      console.error("Failed to resolve report", reportError);
      setError("That report could not be updated.");
    }
  };

  const handleDeleteReportedContent = async (report) => {
    if (!isCommunityAdmin) {
      return;
    }

    const shouldDelete = window.confirm("Delete the reported content?");
    if (!shouldDelete) {
      return;
    }

    setBusyPostId(report.postId);
    setError("");

    try {
      if (report.targetType === "comment" && report.commentId) {
        await deleteDoc(doc(db, "communityPosts", report.postId, "comments", report.commentId));
      } else {
        await deletePostWithChildren(report.postId);
      }

      await handleResolveReport(report, "removed");
    } catch (deleteError) {
      console.error("Failed to remove reported content", deleteError);
      setError("The reported content could not be removed.");
    } finally {
      setBusyPostId("");
    }
  };

  const markNotificationRead = async (notification) => {
    if (!user?.uid || notification.read) {
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", notification.id), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (notificationError) {
      console.error("Failed to mark notification read", notificationError);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user?.uid) {
      return;
    }

    const unread = notifications.filter((notification) => !notification.read);
    if (!unread.length) {
      return;
    }

    try {
      const batch = writeBatch(db);
      unread.forEach((notification) => {
        batch.update(doc(db, "users", user.uid, "notifications", notification.id), {
          read: true,
          readAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (notificationError) {
      console.error("Failed to mark notifications read", notificationError);
      setError("Notifications could not be updated.");
    }
  };

  return (
    <>
      <nav className="navbar-responsive">
        <div className="navbar-container">
          <a className="logo" href="#" style={{ fontWeight: 700, fontSize: "1.5rem", color: "#2c3e50", textDecoration: "none" }}>
            Grad<span style={{ color: "#3498db" }}>iate</span>
          </a>
          <div className="nav-actions">
            {isGuest && (
              <button className="btn btn-primary" onClick={() => navigate(routes.auth)} type="button">
                Sign Up
              </button>
            )}
            <button
              className="burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              type="button"
            >
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
            </button>
          </div>
          {menuOpen && (
            <div className="burger-menu">
              <a onClick={() => navigate(routes.home)}>Home</a>
              <a onClick={() => navigate(routes.application)}>Application</a>
              <a onClick={() => navigate(routes.practice)}>Practise</a>
              <a onClick={() => navigate(routes.bursaryDashboard)}>Bursaries</a>
              <a className="active">Community</a>
              <a onClick={() => navigate(isGuest ? routes.auth : routes.profile)}>
                {isGuest ? "Sign In / Create Account" : "My Profile"}
              </a>
            </div>
          )}
        </div>
      </nav>

      <main className="dashboard-page community-page">
        <header className="dashboard-welcome community-hero">
          <div>
            <p className="community-kicker">
              <FaUsers /> Student Community
            </p>
            <h1 className="dashboard-welcome__greeting">
              Learn together, <span>move smarter</span>
            </h1>
            <p className="dashboard-welcome__sub">
              Ask questions, share bursary leads, trade study tips, and celebrate progress with other students.
            </p>
          </div>
          <button
            className="community-primary-action"
            onClick={() => navigate(isGuest ? routes.auth : routes.profile)}
            type="button"
          >
            {isGuest ? <FaSignInAlt /> : <FaUserCircle />}
            {isGuest ? "Join the conversation" : "View profile"}
          </button>
        </header>

        <div className="dashboard-shortcuts">
          <button className="dashboard-shortcut" onClick={() => navigate(routes.application)} type="button">
            <FaUniversity /> Application
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate(routes.practice)} type="button">
            <FaBookOpen /> Past Papers
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate(routes.bursaryDashboard)} type="button">
            <FaGraduationCap /> Bursaries
          </button>
          <button className="dashboard-shortcut" onClick={() => navigate(routes.home)} type="button">
            <FaHome /> Home
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--blue">{posts.length}</p>
            <p className="dashboard-stat__label">Posts</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--green">{totalComments}</p>
            <p className="dashboard-stat__label">Comments</p>
          </div>
          <div className="dashboard-stat">
            <p className="dashboard-stat__value dashboard-stat__value--purple">
              {activeCategory === "all" ? "All" : categoryByKey[activeCategory]?.label}
            </p>
            <p className="dashboard-stat__label">Viewing</p>
          </div>
        </div>

        <section className="community-shell">
          <aside className="community-sidebar">
            <div className="community-search">
              <FaSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search posts or students"
                type="search"
              />
            </div>

            <label className="community-topic-control">
              <span>View</span>
              <select
                className="community-select"
                value={activeView}
                onChange={(event) => setActiveView(event.target.value)}
              >
                <option value="feed">Feed</option>
                <option value="mine" disabled={isGuest}>My Posts</option>
                <option value="saved" disabled={isGuest}>Saved Posts</option>
                <option value="notifications" disabled={isGuest}>
                  Notifications{unreadNotifications ? ` (${unreadNotifications})` : ""}
                </option>
                {isCommunityAdmin && <option value="reports">Reports</option>}
              </select>
            </label>

            <label className="community-topic-control">
              <span>Topic</span>
              <select
                className="community-select"
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
              >
                <option value="all">All Topics</option>
                {POST_CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </aside>

          <div className="community-feed">
            {activeView !== "notifications" && activeView !== "reports" && (
              <form className="community-composer" onSubmit={handleCreatePost}>
                <div className="community-composer__top">
                  <Avatar name={getDisplayName(user)} photoURL={user?.photoURL || ""} />
                  <div>
                    <h2>{isGuest ? "Browse the student feed" : `Post as ${getDisplayName(user)}`}</h2>
                    <p>{isGuest ? "Sign in to publish, comment, or react." : "Share a question, lead, or win."}</p>
                  </div>
                </div>

                <textarea
                  value={postDraft}
                  onChange={(event) => setPostDraft(event.target.value.slice(0, MAX_POST_LENGTH))}
                  placeholder="What should other students know today?"
                  disabled={isGuest || publishing}
                  maxLength={MAX_POST_LENGTH}
                />

                <div className="community-composer__footer">
                  <label className="community-topic-control community-topic-control--composer">
                    <span>Topic</span>
                    <select
                      className="community-select"
                      value={selectedCategory}
                      onChange={(event) => setSelectedCategory(event.target.value)}
                      disabled={isGuest || publishing}
                      required
                    >
                      <option value="">Choose topic</option>
                      {POST_CATEGORIES.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="community-composer__actions">
                    <span className={postCharactersLeft < 80 ? "community-limit community-limit--low" : "community-limit"}>
                      {postCharactersLeft}
                    </span>
                    <button
                      className="community-submit"
                      type="submit"
                      disabled={isGuest || publishing || !trimmedPostDraft || !selectedCategory}
                    >
                      <FaPaperPlane /> {publishing ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {error && <p className="community-alert">{error}</p>}

            {activeView === "notifications" ? (
              <section className="community-panel">
                <div className="community-panel__header">
                  <div>
                    <h2>Notifications</h2>
                    <p>{unreadNotifications ? `${unreadNotifications} unread` : "All caught up"}</p>
                  </div>
                  <button
                    className="community-soft-button"
                    onClick={markAllNotificationsRead}
                    type="button"
                    disabled={!unreadNotifications}
                  >
                    <FaCheck /> Mark read
                  </button>
                </div>

                {notifications.length ? (
                  <div className="community-notification-list">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        className={`community-notification ${notification.read ? "" : "community-notification--unread"}`}
                        onClick={() => markNotificationRead(notification)}
                        type="button"
                      >
                        <FaBell />
                        <span>
                          <strong>{notification.actorName || "A student"}</strong>{" "}
                          {notification.type === "comment" ? "commented on" : "liked"} your post
                          <small>{notification.commentPreview || notification.postPreview}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="community-empty">No notifications yet.</div>
                )}
              </section>
            ) : activeView === "reports" && isCommunityAdmin ? (
              <section className="community-panel">
                <div className="community-panel__header">
                  <div>
                    <h2>Reports</h2>
                    <p>{reports.length ? "Review reported posts and comments." : "No reports in the queue."}</p>
                  </div>
                </div>

                {reports.length ? (
                  <div className="community-report-list">
                    {reports.map((report) => (
                      <article className="community-report" key={report.id}>
                        <div>
                          <span className={`community-report__status community-report__status--${report.status || "open"}`}>
                            {report.status || "open"}
                          </span>
                          <h3>{report.targetType === "comment" ? "Reported comment" : "Reported post"}</h3>
                          <p>{report.contentPreview || "No preview available."}</p>
                          <small>Reason: {report.reason || "Not provided"}</small>
                        </div>
                        <div className="community-report__actions">
                          <button className="community-soft-button" onClick={() => handleResolveReport(report)} type="button">
                            <FaCheck /> Reviewed
                          </button>
                          <button className="community-danger-button" onClick={() => handleDeleteReportedContent(report)} type="button">
                            <FaTrash /> Remove
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="community-empty">No reports need review.</div>
                )}
              </section>
            ) : loading ? (
              <div className="community-empty">Loading community posts...</div>
            ) : filteredPosts.length ? (
              <div className="community-post-list">
                {filteredPosts.map((post) => {
                  const category = categoryByKey[post.category] || categoryByKey.general;
                  const engagement = engagementByPost[post.id] || {};
                  const comments = engagement.comments || [];
                  const isEditing = editingPostId === post.id;
                  const isSaved = savedPostIds.has(post.id);
                  const canManagePost = user?.uid === post.authorId || isCommunityAdmin;

                  return (
                    <article className="community-post" key={post.id}>
                      <div className="community-post__header">
                        <div className="community-author">
                          <Avatar name={post.authorName} photoURL={post.authorPhotoURL} />
                          <div>
                            <h3>{post.authorName || "Gradiate Student"}</h3>
                            <p>{formatCommunityDate(post.createdAt)}</p>
                          </div>
                        </div>
                        <div className="community-post__meta">
                          <span className={`community-category-pill community-category-pill--${category.tone}`}>
                            {category.label}
                          </span>
                          {!isGuest && (
                            <button
                              className="community-icon-button"
                              onClick={() => handleToggleSave(post)}
                              type="button"
                              aria-label={isSaved ? "Unsave post" : "Save post"}
                              title={isSaved ? "Unsave post" : "Save post"}
                            >
                              {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                            </button>
                          )}
                          {user?.uid === post.authorId && !isEditing && (
                            <button
                              className="community-icon-button"
                              onClick={() => handleStartEdit(post)}
                              type="button"
                              aria-label="Edit post"
                              title="Edit post"
                            >
                              <FaEdit />
                            </button>
                          )}
                          {!isGuest && user?.uid !== post.authorId && (
                            <button
                              className="community-icon-button"
                              onClick={() => submitReport({ targetType: "post", post })}
                              type="button"
                              aria-label="Report post"
                              title="Report post"
                            >
                              <FaFlag />
                            </button>
                          )}
                          {canManagePost && (
                            <button
                              className="community-icon-button"
                              onClick={() => handleDeletePost(post)}
                              type="button"
                              aria-label="Delete post"
                              title="Delete post"
                              disabled={busyPostId === post.id}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="community-edit-form">
                          <textarea
                            value={editDraft.content}
                            onChange={(event) =>
                              setEditDraft((current) => ({
                                ...current,
                                content: event.target.value.slice(0, MAX_POST_LENGTH),
                              }))
                            }
                            maxLength={MAX_POST_LENGTH}
                          />
                          <div className="community-edit-form__footer">
                            <label className="community-topic-control community-topic-control--composer">
                              <span>Topic</span>
                              <select
                                className="community-select"
                                value={editDraft.category}
                                onChange={(event) =>
                                  setEditDraft((current) => ({ ...current, category: event.target.value }))
                                }
                              >
                                <option value="">Choose topic</option>
                                {POST_CATEGORIES.map((editCategory) => (
                                  <option key={editCategory.key} value={editCategory.key}>
                                    {editCategory.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="community-composer__actions">
                              <button
                                className="community-soft-button"
                                onClick={handleCancelEdit}
                                type="button"
                              >
                                <FaTimes /> Cancel
                              </button>
                              <button
                                className="community-submit"
                                onClick={() => handleSaveEdit(post.id)}
                                type="button"
                                disabled={busyPostId === post.id || !editDraft.content.trim() || !editDraft.category}
                              >
                                <FaSave /> Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="community-post__content">{post.content}</p>
                      )}

                      <div className="community-post__actions">
                        <button
                          className={`community-action ${engagement.likedByMe ? "community-action--liked" : ""}`}
                          onClick={() => handleToggleLike(post)}
                          type="button"
                        >
                          {engagement.likedByMe ? <FaHeart /> : <FaRegHeart />}
                          {engagement.likeCount || 0}
                        </button>
                        <span className="community-action community-action--static">
                          <FaCommentDots /> {comments.length}
                        </span>
                      </div>

                      <div className="community-comments">
                        {comments.map((comment) => {
                          const canDeleteComment =
                            user?.uid === comment.authorId || user?.uid === post.authorId || isCommunityAdmin;

                          return (
                            <div className="community-comment" key={comment.id}>
                              <Avatar
                                name={comment.authorName}
                                photoURL={comment.authorPhotoURL}
                                size="sm"
                              />
                              <div className="community-comment__body">
                                <div className="community-comment__head">
                                  <strong>{comment.authorName || "Student"}</strong>
                                  <span>{formatCommunityDate(comment.createdAt)}</span>
                                </div>
                                <p>{comment.content}</p>
                              </div>
                              {!isGuest && user?.uid !== comment.authorId && (
                                <button
                                  className="community-icon-button community-icon-button--quiet"
                                  onClick={() => submitReport({ targetType: "comment", post, comment })}
                                  type="button"
                                  aria-label="Report comment"
                                  title="Report comment"
                                >
                                  <FaFlag />
                                </button>
                              )}
                              {canDeleteComment && (
                                <button
                                  className="community-icon-button community-icon-button--quiet"
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  type="button"
                                  aria-label="Delete comment"
                                  title="Delete comment"
                                  disabled={busyPostId === post.id}
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        <div className="community-comment-form">
                          <input
                            value={commentDrafts[post.id] || ""}
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [post.id]: event.target.value.slice(0, MAX_COMMENT_LENGTH),
                              }))
                            }
                            placeholder={isGuest ? "Sign in to comment" : "Write a comment"}
                            disabled={isGuest || busyPostId === post.id}
                          />
                          <button
                            onClick={() => handleCreateComment(post)}
                            type="button"
                            disabled={isGuest || busyPostId === post.id || !(commentDrafts[post.id] || "").trim()}
                            aria-label="Post comment"
                            title="Post comment"
                          >
                            <FaPaperPlane />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="community-empty">
                {activeView === "saved" && savedPostItems.length
                  ? "Saved posts outside the latest feed will still appear in your profile activity."
                  : "No posts match this view yet."}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
