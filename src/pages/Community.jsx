import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
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
  FaBookmark,
  FaBullhorn,
  FaCheck,
  FaCommentDots,
  FaEdit,
  FaExternalLinkAlt,
  FaFlag,
  FaHeart,
  FaPaperPlane,
  FaRegBookmark,
  FaRegHeart,
  FaSave,
  FaSearch,
  FaSignInAlt,
  FaTimes,
  FaThumbtack,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import CommunityAvatar from "../components/CommunityAvatar";
import CommunityComments from "../components/CommunityComments";
import CommunityReportModal from "../components/CommunityReportModal";
import AdminBadge from "../components/AdminBadge";
import { useAuth } from "../context/useAuth";
import { db } from "../lib/firebase/firestore";
import { routes } from "../lib/routes";
import {
  COMMUNITY_SORT_OPTIONS,
  COMMENTS_LIMIT,
  MAX_COMMENT_LENGTH,
  MAX_POST_LENGTH,
  POSTS_LIMIT,
  POST_CATEGORIES,
  POST_TEMPLATES,
  REPORT_PREVIEW_LENGTH,
  categoryByKey,
  createCommunityPostPath,
  formatCommunityDate,
  getAuthorAcademicLine,
  getAuthorSnapshot,
  getDisplayName,
  getNotificationActionText,
  getNotificationPreview,
  getPostCommentCount,
  getPostLikeCount,
  isAdminAnnouncementNotification,
  normalizeModuleCode,
  sortCommunityPosts,
} from "../lib/communityHelpers";
import SEO from '../components/SEO';

const SAVED_POSTS_LIMIT = 100;

export default function Community() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [engagementByPost, setEngagementByPost] = useState({});
  const [postDraft, setPostDraft] = useState("");
  const [moduleDraft, setModuleDraft] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeView, setActiveView] = useState("feed");
  const [activeSort, setActiveSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [expandedCommentsByPost, setExpandedCommentsByPost] = useState({});
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [savedPostItems, setSavedPostItems] = useState([]);
  const [savedFullPosts, setSavedFullPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
  const [editingPostId, setEditingPostId] = useState("");
  const [editDraft, setEditDraft] = useState({ content: "", category: "", moduleCode: "" });
  const [reportDraft, setReportDraft] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [busyPostId, setBusyPostId] = useState("");
  const [error, setError] = useState("");
  const isGuest = !user?.uid;

  const expandedCommentsKey = useMemo(
    () =>
      Object.entries(expandedCommentsByPost)
        .filter(([, isExpanded]) => isExpanded)
        .map(([postId]) => postId)
        .sort()
        .join("|"),
    [expandedCommentsByPost]
  );
  const savedPostIdsKey = useMemo(
    () => savedPostItems.map((post) => post.postId || post.id).filter(Boolean).join("|"),
    [savedPostItems]
  );
  const trackedPostIdsKey = useMemo(
    () =>
      [...new Set([...posts, ...savedFullPosts].map((post) => post.id).filter(Boolean))]
        .sort()
        .join("|"),
    [posts, savedFullPosts]
  );
  const trimmedPostDraft = postDraft.trim();
  const postCharactersLeft = MAX_POST_LENGTH - postDraft.length;
  const mobileViewSortValue = activeView === "feed" ? `sort:${activeSort}` : `view:${activeView}`;
  const getPostAvatarProps = (post) => {
    if (user?.uid && post.authorId === user.uid) {
      return {
        photoURL: userProfile?.photoURL || user?.photoURL || "",
        avatarSeed: userProfile?.avatarSeed || user.uid,
        avatarStyle: userProfile?.avatarStyle,
      };
    }

    return {
      photoURL: post.authorPhotoURL,
      avatarSeed: post.authorAvatarSeed,
      avatarStyle: post.authorAvatarStyle,
    };
  };

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
      setSavedFullPosts([]);
      setNotifications([]);
      setIsCommunityAdmin(false);
      setUserProfile(null);
      return undefined;
    }

    let cancelled = false;

    const profileUnsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setUserProfile(snapshot.exists() ? snapshot.data() : null);
    });

    async function loadSavedPosts() {
      try {
        const snapshot = await getDocs(
          query(collection(db, "users", user.uid, "savedCommunityPosts"), limit(SAVED_POSTS_LIMIT))
        );

        if (cancelled) {
          return;
        }

        const ids = new Set();
        const items = snapshot.docs.map((savedDoc) => {
          ids.add(savedDoc.id);
          return { id: savedDoc.id, ...savedDoc.data() };
        });

        setSavedPostIds(ids);
        setSavedPostItems(items);
      } catch (savedError) {
        if (!cancelled) {
          console.error("Failed to load saved community posts", savedError);
        }
      }
    }

    loadSavedPosts();

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
      setIsCommunityAdmin(snapshot.exists() || isAdmin);
    });

    return () => {
      cancelled = true;
      profileUnsubscribe();
      notificationsUnsubscribe();
      adminUnsubscribe();
    };
  }, [user?.uid, isAdmin]);

  useEffect(() => {
    if (!isCommunityAdmin && activeView === "reports") {
      setActiveView("feed");
    }

    if (isGuest && activeView !== "feed") {
      setActiveView("feed");
    }
  }, [activeView, isCommunityAdmin, isGuest]);

  useEffect(() => {
    if (isGuest) {
      setNotificationsOpen(false);
    }
  }, [isGuest]);

  useEffect(() => {
    if (!isCommunityAdmin || activeView !== "reports") {
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
  }, [activeView, isCommunityAdmin]);

  useEffect(() => {
    const trackedPostIds = trackedPostIdsKey ? trackedPostIdsKey.split("|") : [];
    const expandedPostIds = expandedCommentsKey ? expandedCommentsKey.split("|") : [];

    if (!trackedPostIds.length && !expandedPostIds.length) {
      setEngagementByPost({});
      return undefined;
    }

    const unsubscribeFns = [];
    let cancelled = false;

    if (user?.uid) {
      Promise.all(
        trackedPostIds.map(async (postId) => {
          const snapshot = await getDoc(doc(db, "communityPosts", postId, "likes", user.uid));
          return [postId, snapshot.exists()];
        })
      )
        .then((likedEntries) => {
          if (cancelled) {
            return;
          }

          setEngagementByPost((current) => {
            const next = { ...current };
            likedEntries.forEach(([postId, likedByMe]) => {
              next[postId] = {
                ...next[postId],
                likedByMe,
              };
            });
            return next;
          });
        })
        .catch((likeError) => {
          if (!cancelled) {
            console.error("Failed to load post like status", likeError);
          }
        });
    } else if (trackedPostIds.length) {
      setEngagementByPost((current) => {
        const next = { ...current };
        trackedPostIds.forEach((postId) => {
          next[postId] = {
            ...next[postId],
            likedByMe: false,
          };
        });
        return next;
      });
    }

    expandedPostIds.forEach((postId) => {
      const commentsQuery = query(
        collection(db, "communityPosts", postId, "comments"),
        orderBy("createdAt", "asc"),
        limit(COMMENTS_LIMIT)
      );

      unsubscribeFns.push(
        onSnapshot(commentsQuery, (snapshot) => {
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
        })
      );
    });

    return () => {
      cancelled = true;
      unsubscribeFns.forEach((unsubscribe) => unsubscribe());
    };
  }, [expandedCommentsKey, trackedPostIdsKey, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !savedPostIdsKey) {
      setSavedFullPosts([]);
      return undefined;
    }

    let cancelled = false;

    async function loadSavedPosts() {
      const savedItemsById = new Map(savedPostItems.map((item) => [item.postId || item.id, item]));
      const savedIds = [...savedItemsById.keys()].filter(Boolean);

      try {
        const loadedPosts = await Promise.all(
          savedIds.map(async (postId) => {
            const snapshot = await getDoc(doc(db, "communityPosts", postId));
            const savedItem = savedItemsById.get(postId) || {};

            if (snapshot.exists()) {
              return { id: snapshot.id, ...snapshot.data() };
            }

            return {
              id: postId,
              authorId: savedItem.authorId || "",
              authorName: savedItem.authorName || "Student",
              category: savedItem.category || "general",
              content: savedItem.contentPreview || "Saved post unavailable.",
              contentPreview: savedItem.contentPreview || "",
              createdAt: savedItem.createdAt || savedItem.savedAt,
              moduleCode: savedItem.moduleCode || "",
              isAnswered: Boolean(savedItem.isAnswered),
              missing: true,
            };
          })
        );

        if (!cancelled) {
          setSavedFullPosts(loadedPosts);
        }
      } catch (savedError) {
        console.error("Failed to load saved community posts", savedError);
        if (!cancelled) {
          setSavedFullPosts([]);
        }
      }
    }

    loadSavedPosts();

    return () => {
      cancelled = true;
    };
  }, [savedPostIdsKey, savedPostItems, user?.uid]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const sourcePosts = activeView === "saved" ? savedFullPosts : posts;

    const matchingPosts = sourcePosts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      const matchesAnswerFilter =
        activeSort === "answered"
          ? post.category === "questions" && post.isAnswered
          : activeSort === "unanswered"
            ? post.category === "questions" && !post.isAnswered
            : true;
      const haystack = `${post.content || ""} ${post.authorName || ""} ${post.category || ""} ${post.moduleCode || ""}`.toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesView =
        activeView === "feed" ||
        (activeView === "mine" && post.authorId === user?.uid) ||
        (activeView === "saved" && savedPostIds.has(post.id));

      return matchesCategory && matchesAnswerFilter && matchesSearch && matchesView;
    });

    return sortCommunityPosts(matchingPosts, activeSort, engagementByPost);
  }, [activeCategory, activeSort, activeView, engagementByPost, posts, savedFullPosts, savedPostIds, search, user?.uid]);

  const totalComments = useMemo(
    () =>
      posts.reduce(
        (total, post) => total + getPostCommentCount(post, engagementByPost[post.id]),
        0
      ),
    [engagementByPost, posts]
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
      const authorSnapshot = getAuthorSnapshot(user, userProfile || {}, isAdmin);

      await addDoc(collection(db, "communityPosts"), {
        ...authorSnapshot,
        category: selectedCategory,
        content: trimmedPostDraft,
        moduleCode: normalizeModuleCode(moduleDraft),
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        lastActivityAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setPostDraft("");
      setModuleDraft("");
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

    if (post.missing) {
      setError("That saved post is no longer available.");
      return;
    }

    const engagement = engagementByPost[post.id] || {};
    const likeRef = doc(db, "communityPosts", post.id, "likes", user.uid);
    const postRef = doc(db, "communityPosts", post.id);
    const batch = writeBatch(db);

    try {
      if (engagement.likedByMe) {
        batch.delete(likeRef);
        if (getPostLikeCount(post, engagement) > 0) {
          batch.update(postRef, {
            likeCount: increment(-1),
            lastActivityAt: serverTimestamp(),
          });
        }
      } else {
        batch.set(likeRef, {
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        batch.update(postRef, {
          likeCount: increment(1),
          lastActivityAt: serverTimestamp(),
        });
        addNotificationToBatch(batch, post, "like");
      }

      await batch.commit();
      setEngagementByPost((current) => ({
        ...current,
        [post.id]: {
          ...current[post.id],
          likedByMe: !engagement.likedByMe,
        },
      }));
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

    if (post.missing) {
      setError("That saved post is no longer available.");
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
      const postRef = doc(db, "communityPosts", postId);
      const authorSnapshot = getAuthorSnapshot(user, userProfile || {}, isAdmin);

      batch.set(commentRef, {
        ...authorSnapshot,
        content,
        createdAt: serverTimestamp(),
      });
      batch.update(postRef, {
        commentCount: increment(1),
        lastActivityAt: serverTimestamp(),
      });
      addNotificationToBatch(batch, post, "comment", {
        commentId: commentRef.id,
        commentPreview: content.slice(0, 160),
      });

      await batch.commit();
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      setExpandedCommentsByPost((current) => ({ ...current, [postId]: true }));
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
    const postRef = doc(db, "communityPosts", post.id);
    setError("");

    try {
      if (post.missing) {
        await deleteDoc(savedRef);
        setSavedPostIds((current) => {
          const next = new Set(current);
          next.delete(post.id);
          return next;
        });
        setSavedPostItems((current) => current.filter((savedPost) => (savedPost.postId || savedPost.id) !== post.id));
        setSavedFullPosts((current) => current.filter((savedPost) => savedPost.id !== post.id));
        return;
      }

      const batch = writeBatch(db);

      if (savedPostIds.has(post.id)) {
        batch.delete(savedRef);
        if ((post.saveCount || 0) > 0) {
          batch.update(postRef, {
            saveCount: increment(-1),
            lastActivityAt: serverTimestamp(),
          });
        }
      } else {
        const savedPayload = {
          postId: post.id,
          authorId: post.authorId || "",
          authorName: post.authorName || "Gradiate Student",
          category: post.category || "general",
          contentPreview: String(post.content || "").slice(0, 180),
          isAnswered: Boolean(post.isAnswered),
          savedAt: serverTimestamp(),
        };

        if (post.createdAt) {
          savedPayload.createdAt = post.createdAt;
        }

        if (post.moduleCode) {
          savedPayload.moduleCode = post.moduleCode;
        }

        batch.set(savedRef, savedPayload);
        batch.update(postRef, {
          saveCount: increment(1),
          lastActivityAt: serverTimestamp(),
        });
      }

      await batch.commit();
      if (savedPostIds.has(post.id)) {
        setSavedPostIds((current) => {
          const next = new Set(current);
          next.delete(post.id);
          return next;
        });
        setSavedPostItems((current) => current.filter((savedPost) => (savedPost.postId || savedPost.id) !== post.id));
        setSavedFullPosts((current) => current.filter((savedPost) => savedPost.id !== post.id));
      } else {
        const savedItem = {
          id: post.id,
          postId: post.id,
          authorId: post.authorId || "",
          authorName: post.authorName || "Gradiate Student",
          category: post.category || "general",
          contentPreview: String(post.content || "").slice(0, 180),
          createdAt: post.createdAt,
          isAnswered: Boolean(post.isAnswered),
          moduleCode: post.moduleCode || "",
          savedAt: new Date(),
        };

        setSavedPostIds((current) => new Set(current).add(post.id));
        setSavedPostItems((current) => [savedItem, ...current]);
        setSavedFullPosts((current) => [{ ...post }, ...current.filter((savedPost) => savedPost.id !== post.id)]);
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
      moduleCode: post.moduleCode || "",
    });
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingPostId("");
    setEditDraft({ content: "", category: "", moduleCode: "" });
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
        moduleCode: normalizeModuleCode(editDraft.moduleCode),
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

  const handleToggleComments = (postId) => {
    setExpandedCommentsByPost((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  };

  const handleMobileViewSortChange = (event) => {
    const value = event.target.value;

    if (value.startsWith("sort:")) {
      setActiveView("feed");
      setActiveSort(value.replace("sort:", ""));
      return;
    }

    setActiveView(value.replace("view:", ""));
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((current) => ({
      ...current,
      [postId]: value.slice(0, MAX_COMMENT_LENGTH),
    }));
  };

  const handleUseTemplate = () => {
    const template = POST_TEMPLATES[selectedCategory];

    if (!template) {
      return;
    }

    if (postDraft.trim() && !window.confirm("Replace your current draft with the template?")) {
      return;
    }

    setPostDraft(template.slice(0, MAX_POST_LENGTH));
  };

  const handleMarkAnswer = async (post, comment) => {
    if (!user?.uid || (user.uid !== post.authorId && !isCommunityAdmin) || post.category !== "questions") {
      return;
    }

    setBusyPostId(post.id);
    setError("");

    try {
      await updateDoc(doc(db, "communityPosts", post.id), {
        isAnswered: true,
        acceptedCommentId: comment.id,
        acceptedAnswerPreview: String(comment.content || "").slice(0, 180),
        acceptedAnswerAuthorId: comment.authorId || "",
        acceptedAnswerAuthorName: comment.authorName || "Student",
        answeredAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      });
    } catch (answerError) {
      console.error("Failed to mark answer", answerError);
      setError("That answer could not be marked right now.");
    } finally {
      setBusyPostId("");
    }
  };

  const handleToggleOfficial = async (post) => {
    if (!isCommunityAdmin) {
      return;
    }

    try {
      await updateDoc(doc(db, "communityPosts", post.id), {
        isOfficial: !post.isOfficial,
        updatedAt: serverTimestamp(),
      });
    } catch (officialError) {
      console.error("Failed to update official status", officialError);
      setError("Official status could not be updated.");
    }
  };

  const handleTogglePinned = async (post) => {
    if (!isCommunityAdmin) {
      return;
    }

    try {
      await updateDoc(doc(db, "communityPosts", post.id), {
        pinned: !post.pinned,
        pinnedAt: post.pinned ? null : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (pinError) {
      console.error("Failed to update pinned status", pinError);
      setError("Pinned status could not be updated.");
    }
  };

  const openReportModal = ({ targetType, post, comment = null }) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    setReportDraft({ targetType, post, comment });
  };

  const submitReport = async (reason) => {
    if (!reportDraft) {
      return;
    }

    const { targetType, post, comment = null } = reportDraft;
    const cleanReason = String(reason || "").trim();

    if (!cleanReason) {
      return;
    }

    const targetId = comment?.id || post.id;
    const reportRef = doc(db, "communityReports", `${targetType}_${post.id}_${targetId}_${user.uid}`);

    setReportSubmitting(true);
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
      setReportDraft(null);
      setError("Report sent. Thanks for helping keep the community useful.");
    } catch (reportError) {
      console.error("Failed to report community content", reportError);
      setError("That report could not be sent, or you may have already reported it.");
    } finally {
      setReportSubmitting(false);
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

  const handleDeleteComment = async (post, commentId) => {
    if (!user?.uid || busyPostId) {
      return;
    }

    const postId = post.id;
    setBusyPostId(postId);
    setError("");

    try {
      const batch = writeBatch(db);

      batch.delete(doc(db, "communityPosts", postId, "comments", commentId));
      if (getPostCommentCount(post, engagementByPost[postId]) > 0) {
        batch.update(doc(db, "communityPosts", postId), {
          commentCount: increment(-1),
          lastActivityAt: serverTimestamp(),
        });
      }

      await batch.commit();
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
        const postRef = doc(db, "communityPosts", report.postId);
        const postSnapshot = await getDoc(postRef);
        const batch = writeBatch(db);

        batch.delete(doc(db, "communityPosts", report.postId, "comments", report.commentId));
        if ((postSnapshot.data()?.commentCount || 0) > 0) {
          batch.update(postRef, {
            commentCount: increment(-1),
            lastActivityAt: serverTimestamp(),
          });
        }
        await batch.commit();
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
      <SEO
        title="Student Community"
        canonical="/community"
        description="Join the Gradiate student community. Ask questions, share advice and connect with fellow South African students applying for bursaries and scholarships."
      />
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
            <div className="community-nav-notifications">
              <button
                className={`community-notification-trigger ${
                  unreadNotifications ? "community-notification-trigger--unread" : ""
                }`}
                onClick={() => {
                  if (isGuest) {
                    navigate(routes.auth);
                    return;
                  }

                  setNotificationsOpen((open) => !open);
                  setMenuOpen(false);
                }}
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
                title="Notifications"
              >
                <FaBell />
                {unreadNotifications > 0 && (
                  <span>{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                )}
              </button>

              {notificationsOpen && !isGuest && (
                <div className="community-notification-popover" role="dialog" aria-label="Notifications">
                  <div className="community-notification-popover__header">
                    <strong>Notifications</strong>
                    <button
                      className="community-icon-button community-icon-button--quiet"
                      onClick={markAllNotificationsRead}
                      type="button"
                      aria-label="Mark notifications read"
                      title="Mark notifications read"
                      disabled={!unreadNotifications}
                    >
                      <FaCheck />
                    </button>
                  </div>

                  {notifications.length ? (
                    <div className="community-notification-list community-notification-list--popover">
                      {notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          className={`community-notification ${
                            notification.read ? "" : "community-notification--unread"
                          }`}
                          onClick={async () => {
                            await markNotificationRead(notification);
                            setNotificationsOpen(false);
                            if (notification.postId && !isAdminAnnouncementNotification(notification)) {
                              navigate(createCommunityPostPath(notification.postId));
                            }
                          }}
                          type="button"
                        >
                          <FaBell />
                          <span>
                            <strong>{notification.actorName || "A student"}</strong>{" "}
                            {getNotificationActionText(notification)}
                            <small>{getNotificationPreview(notification)}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="community-notification-popover__empty">No notifications yet.</p>
                  )}
                </div>
              )}
            </div>
            
          </div>
          
        </div>
      </nav>

      <main className="dashboard-page">
        <header className="dashboard-welcome community-hero">
          <div>
            <p className="community-kicker">
              <FaUsers /> Community
            </p>
            <h1 className="dashboard-welcome__greeting">
              Learn together, <span>move smarter</span>
            </h1>
            <p className="dashboard-welcome__sub">
              Ask questions, share bursary leads, trade study tips, and celebrate progress with other students.
            </p>
          </div>
          
        </header>

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

            <label className="community-topic-control community-mobile-view-sort">
              <span>View / Sort</span>
              <select
                className="community-select"
                value={mobileViewSortValue}
                onChange={handleMobileViewSortChange}
              >
                <optgroup label="View">
                  <option value="view:feed">Feed</option>
                  <option value="view:mine" disabled={isGuest}>My Posts</option>
                  <option value="view:saved" disabled={isGuest}>Saved Posts</option>
                  {isCommunityAdmin && <option value="view:reports">Reports</option>}
                </optgroup>
                <optgroup label="Sort feed">
                  {COMMUNITY_SORT_OPTIONS.map((sortOption) => (
                    <option key={sortOption.key} value={`sort:${sortOption.key}`}>
                      {sortOption.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            <label className="community-topic-control community-desktop-view-control">
              <span>View</span>
              <select
                className="community-select"
                value={activeView}
                onChange={(event) => setActiveView(event.target.value)}
              >
                <option value="feed">Feed</option>
                <option value="mine" disabled={isGuest}>My Posts</option>
                <option value="saved" disabled={isGuest}>Saved Posts</option>
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

            <label className="community-topic-control community-desktop-sort-control">
              <span>Sort</span>
              <select
                className="community-select"
                value={activeSort}
                onChange={(event) => setActiveSort(event.target.value)}
              >
                {COMMUNITY_SORT_OPTIONS.map((sortOption) => (
                  <option key={sortOption.key} value={sortOption.key}>
                    {sortOption.label}
                  </option>
                ))}
              </select>
            </label>

            <section className="community-guidelines-card">
              <h2>Community Rules</h2>
              <ul>
                <li>Be respectful.</li>
                <li>Do not share fake bursaries.</li>
                <li>Prioritize Respectful Language</li>
                <li>Give clear answers when helping others.</li>
                <li>Report harmful or misleading content.</li>
              </ul>
            </section>
          </aside>

          <div className="community-feed">
            {activeView !== "reports" && (
              <form className="community-composer" onSubmit={handleCreatePost}>
                <div className="community-composer__top">
                  <CommunityAvatar
                    name={getDisplayName(user)}
                    photoURL={userProfile?.photoURL || user?.photoURL || ""}
                    avatarSeed={userProfile?.avatarSeed || user?.uid}
                    avatarStyle={userProfile?.avatarStyle}
                  />
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
                  <div className="community-composer__fields">
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
                    <label className="community-topic-control community-topic-control--module">
                      <span>Subject / tag</span>
                      <input
                        className="community-input"
                        value={moduleDraft}
                        onChange={(event) => setModuleDraft(event.target.value.slice(0, 40))}
                        placeholder="e.g. Math"
                        disabled={isGuest || publishing}
                      />
                    </label>
                    {POST_TEMPLATES[selectedCategory] && (
                      <button
                        className="community-template-button"
                        onClick={handleUseTemplate}
                        type="button"
                        disabled={isGuest || publishing}
                      >
                        Use template
                      </button>
                    )}
                  </div>
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

            {activeView === "reports" && isCommunityAdmin ? (
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
                  const avatarProps = getPostAvatarProps(post);
                  const isEditing = editingPostId === post.id;
                  const isSaved = savedPostIds.has(post.id);
                  const canManagePost = user?.uid === post.authorId || isCommunityAdmin;
                  const academicLine = getAuthorAcademicLine(post);
                  const likeCount = getPostLikeCount(post, engagement);
                  const commentCount = getPostCommentCount(post, engagement);
                  const questionStatus =
                    post.category === "questions" ? (post.isAnswered ? "Answered" : "Unanswered") : "";

                  return (
                    <article className="community-post" key={post.id}>
                      <div className="community-post__header">
                        <div className="community-author">
                          <CommunityAvatar
                            name={post.authorName}
                            photoURL={avatarProps.photoURL}
                            avatarSeed={avatarProps.avatarSeed}
                            avatarStyle={avatarProps.avatarStyle}
                          />
                          <div>
                            <h3>
                              {post.authorName || "Gradiate Student"}
                              {post.authorIsAdmin && <AdminBadge />}
                            </h3>
                            <p>{formatCommunityDate(post.createdAt)}</p>
                            {academicLine && <small className="community-author__academic">{academicLine}</small>}
                          </div>
                        </div>
                        <div className="community-post__meta">
                          {post.pinned && (
                            <span className="community-status-badge community-status-badge--pinned">
                              <FaThumbtack /> Pinned
                            </span>
                          )}
                          {post.isOfficial && (
                            <span className="community-status-badge community-status-badge--official">
                              <FaBullhorn /> Official Gradiate
                            </span>
                          )}
                          <span className={`community-category-pill community-category-pill--${category.tone}`}>
                            {category.label}
                          </span>
                          {post.moduleCode && (
                            <span className="community-module-badge">{post.moduleCode}</span>
                          )}
                          {questionStatus && (
                            <span
                              className={`community-answer-badge ${
                                post.isAnswered ? "community-answer-badge--answered" : "community-answer-badge--unanswered"
                              }`}
                            >
                              {questionStatus}
                            </span>
                          )}
                          <button
                            className="community-icon-button"
                            onClick={() => navigate(createCommunityPostPath(post.id))}
                            type="button"
                            aria-label="Open post"
                            title="Open post"
                          >
                            <FaExternalLinkAlt />
                          </button>
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
                              onClick={() => openReportModal({ targetType: "post", post })}
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
                              <label className="community-topic-control community-topic-control--module">
                                <span>Module / tag</span>
                                <input
                                  className="community-input"
                                  value={editDraft.moduleCode}
                                  onChange={(event) =>
                                    setEditDraft((current) => ({
                                      ...current,
                                      moduleCode: event.target.value.slice(0, 40),
                                    }))
                                  }
                                  placeholder="e.g. COM2129"
                                />
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
                          {likeCount}
                        </button>
                        <span className="community-action community-action--static">
                          <FaCommentDots /> {commentCount}
                        </span>
                        <span className="community-action community-action--static">
                          <FaBookmark /> {post.saveCount || 0}
                        </span>
                        {isCommunityAdmin && (
                          <button
                            className="community-action"
                            onClick={() => handleToggleOfficial(post)}
                            type="button"
                            disabled={busyPostId === post.id}
                          >
                            <FaBullhorn /> {post.isOfficial ? "Unofficial" : "Official"}
                          </button>
                        )}
                        {isCommunityAdmin && (
                          <button
                            className="community-action"
                            onClick={() => handleTogglePinned(post)}
                            type="button"
                            disabled={busyPostId === post.id}
                          >
                            <FaThumbtack /> {post.pinned ? "Unpin" : "Pin"}
                          </button>
                        )}
                      </div>

                      <CommunityComments
                        post={post}
                        engagement={engagement}
                        isExpanded={Boolean(expandedCommentsByPost[post.id])}
                        isGuest={isGuest}
                        user={user}
                        isCommunityAdmin={isCommunityAdmin}
                        busyPostId={busyPostId}
                        draft={commentDrafts[post.id] || ""}
                        onToggleComments={handleToggleComments}
                        onDraftChange={handleCommentDraftChange}
                        onCreateComment={handleCreateComment}
                        onDeleteComment={handleDeleteComment}
                        onReport={openReportModal}
                        onMarkAnswer={handleMarkAnswer}
                      />
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="community-empty">
                {activeView === "saved" && savedPostItems.length
                  ? "Those saved posts could not load right now. Try again in a moment."
                  : "No posts match this view yet."}
              </div>
            )}
          </div>
        </section>
      </main>
      <CommunityReportModal
        reportDraft={reportDraft}
        submitting={reportSubmitting}
        onClose={() => setReportDraft(null)}
        onSubmit={submitReport}
      />
    </>
  );
}
