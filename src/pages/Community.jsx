import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  writeBatch,
} from "firebase/firestore";
import {
  FaBookOpen,
  FaCommentDots,
  FaGraduationCap,
  FaHeart,
  FaHome,
  FaPaperPlane,
  FaRegHeart,
  FaSearch,
  FaSignInAlt,
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
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
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

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, posts, search]);

  const totalComments = useMemo(
    () =>
      Object.values(engagementByPost).reduce(
        (total, engagement) => total + (engagement.comments?.length || 0),
        0
      ),
    [engagementByPost]
  );

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (isGuest) {
      navigate(routes.auth);
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
      setSelectedCategory("general");
    } catch (createError) {
      console.error("Failed to create community post", createError);
      setError("Your post could not be published. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleLike = useCallback(
    async (postId) => {
      if (isGuest) {
        navigate(routes.auth);
        return;
      }

      const engagement = engagementByPost[postId] || {};
      const likeRef = doc(db, "communityPosts", postId, "likes", user.uid);

      try {
        if (engagement.likedByMe) {
          await deleteDoc(likeRef);
        } else {
          await setDoc(likeRef, {
            uid: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      } catch (likeError) {
        console.error("Failed to update like", likeError);
        setError("Your reaction could not be saved.");
      }
    },
    [engagementByPost, isGuest, navigate, user?.uid]
  );

  const handleCreateComment = async (postId) => {
    if (isGuest) {
      navigate(routes.auth);
      return;
    }

    const content = (commentDrafts[postId] || "").trim();

    if (!content || content.length > MAX_COMMENT_LENGTH || busyPostId) {
      return;
    }

    setBusyPostId(postId);
    setError("");

    try {
      await addDoc(collection(db, "communityPosts", postId, "comments"), {
        authorId: user.uid,
        authorName: getDisplayName(user),
        authorPhotoURL: user.photoURL || "",
        content,
        createdAt: serverTimestamp(),
      });
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (commentError) {
      console.error("Failed to create comment", commentError);
      setError("Your comment could not be posted.");
    } finally {
      setBusyPostId("");
    }
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
    if (!user?.uid || post.authorId !== user.uid || busyPostId) {
      return;
    }

    const shouldDelete = window.confirm("Delete this community post?");
    if (!shouldDelete) {
      return;
    }

    setBusyPostId(post.id);
    setError("");

    try {
      const postRef = doc(db, "communityPosts", post.id);
      const [likesSnapshot, commentsSnapshot] = await Promise.all([
        getDocs(collection(db, "communityPosts", post.id, "likes")),
        getDocs(collection(db, "communityPosts", post.id, "comments")),
      ]);
      const cleanupBatch = writeBatch(db);

      likesSnapshot.docs.forEach((likeDoc) => cleanupBatch.delete(likeDoc.ref));
      commentsSnapshot.docs.forEach((commentDoc) => cleanupBatch.delete(commentDoc.ref));

      await cleanupBatch.commit();
      await deleteDoc(postRef);
    } catch (deleteError) {
      console.error("Failed to delete community post", deleteError);
      setError("That post could not be removed.");
    } finally {
      setBusyPostId("");
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

            <div className="community-filter-list" aria-label="Community categories">
              <button
                className={`community-filter ${activeCategory === "all" ? "community-filter--active" : ""}`}
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                All Topics
              </button>
              {POST_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  className={`community-filter community-filter--${category.tone} ${
                    activeCategory === category.key ? "community-filter--active" : ""
                  }`}
                  onClick={() => setActiveCategory(category.key)}
                  type="button"
                >
                  {category.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="community-feed">
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

              <div className="community-category-picker">
                {POST_CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    className={`community-category-pill community-category-pill--${category.tone} ${
                      selectedCategory === category.key ? "community-category-pill--active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.key)}
                    type="button"
                    disabled={isGuest || publishing}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="community-composer__footer">
                <span className={postCharactersLeft < 80 ? "community-limit community-limit--low" : "community-limit"}>
                  {postCharactersLeft}
                </span>
                <button
                  className="community-submit"
                  type="submit"
                  disabled={isGuest || publishing || !trimmedPostDraft}
                >
                  <FaPaperPlane /> {publishing ? "Posting..." : "Post"}
                </button>
              </div>
            </form>

            {error && <p className="community-alert">{error}</p>}

            {loading ? (
              <div className="community-empty">Loading community posts...</div>
            ) : filteredPosts.length ? (
              <div className="community-post-list">
                {filteredPosts.map((post) => {
                  const category = categoryByKey[post.category] || categoryByKey.general;
                  const engagement = engagementByPost[post.id] || {};
                  const comments = engagement.comments || [];
                  const canDeletePost = user?.uid === post.authorId;

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
                          {canDeletePost && (
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

                      <p className="community-post__content">{post.content}</p>

                      <div className="community-post__actions">
                        <button
                          className={`community-action ${engagement.likedByMe ? "community-action--liked" : ""}`}
                          onClick={() => handleToggleLike(post.id)}
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
                            user?.uid === comment.authorId || user?.uid === post.authorId;

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
                            onClick={() => handleCreateComment(post.id)}
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
              <div className="community-empty">No posts match this view yet.</div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
