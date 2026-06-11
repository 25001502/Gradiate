import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaShieldAlt,
  FaBullhorn,
  FaUsers,
  FaFlag,
  FaChartBar,
  FaBook,
  FaSignOutAlt,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaEye,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';
import {
  collection,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  getCountFromServer,
  serverTimestamp,
  getDocs,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { useAuth } from '../context/useAuth';
import { db } from '../lib/firebase/firestore';
import { auth } from '../lib/firebase/auth';
import DashboardSection from '../components/DashboardSection';
import AdminBadge from '../components/AdminBadge';
import { routes } from '../lib/routes';
import SEO from '../components/SEO';

const ADMIN_API = import.meta.env.VITE_ADMIN_API_BASE || '/api/admin';
const ADMIN_REPORTS_LIMIT = 100;

function getReportTarget(report = {}) {
  const isCommentReport = report.targetType === 'comment' || Boolean(report.commentId);
  const commentId = report.commentId || (isCommentReport ? report.targetId : '');
  const postId = report.postId || (!isCommentReport ? report.targetId : '');

  return {
    type: isCommentReport ? 'comment' : 'post',
    label: isCommentReport ? 'comment' : 'post',
    postId,
    commentId,
  };
}

async function getAdminToken() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function callAdminAPI(path, method = 'GET', body = null) {
  const token = await getAdminToken();
  const res = await fetch(`${ADMIN_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : { error: await res.text() };

  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ---------------------------------------------------------------------------
// Tab: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ stats }) {
  return (
    <div className="admin-tab-content">
      <h2 className="admin-section-title">App Overview</h2>
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__icon">{s.icon}</div>
            <div className="admin-stat-card__value">{s.value ?? '—'}</div>
            <div className="admin-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Announcements
// ---------------------------------------------------------------------------

function AnnouncementsTab() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    setSending(true);
    try {
      const result = await callAdminAPI('/announce', 'POST', {
        title: title.trim(),
        message: message.trim(),
      });
      toast.success(`Announcement sent to ${result.recipientCount ?? 'all'} users.`);
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-tab-content">
      <h2 className="admin-section-title">Send Announcement</h2>
      <p className="admin-section-desc">
        This will send an in-app notification to every Gradiate user immediately.
      </p>
      <form className="admin-announce-form" onSubmit={handleSend}>
        <label className="admin-field-label" htmlFor="ann-title">
          Title
        </label>
        <input
          id="ann-title"
          className="admin-input"
          type="text"
          maxLength={80}
          placeholder="e.g. New bursary listings available!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={sending}
        />

        <label className="admin-field-label" htmlFor="ann-message">
          Message
        </label>
        <textarea
          id="ann-message"
          className="admin-textarea"
          maxLength={500}
          rows={5}
          placeholder="Write your announcement here…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
        <div className="admin-char-count">{message.length}/500</div>

        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={sending || !title.trim() || !message.trim()}
        >
          {sending ? (
            <>
              <FaSpinner className="admin-spin" /> Sending…
            </>
          ) : (
            <>
              <FaBullhorn /> Send to All Users
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Users
// ---------------------------------------------------------------------------

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const hasFetched = useRef(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callAdminAPI('/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUsers();
    }
  }, [fetchUsers]);

  const setAction = (uid, value) =>
    setActionLoading((prev) => ({ ...prev, [uid]: value }));

  const handleForceSignOut = async (uid) => {
    setAction(uid, 'signout');
    try {
      await callAdminAPI(`/force-signout/${uid}`, 'POST');
      toast.success('User has been signed out of all sessions.');
    } catch (err) {
      toast.error(err.message || 'Failed to force sign-out.');
    } finally {
      setAction(uid, null);
    }
  };

  const handleDisable = async (uid) => {
    setAction(uid, 'disable');
    try {
      await callAdminAPI(`/disable-user/${uid}`, 'POST');
      toast.success('User account disabled.');
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, disabled: true } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to disable user.');
    } finally {
      setAction(uid, null);
    }
  };

  const handleEnable = async (uid) => {
    setAction(uid, 'enable');
    try {
      await callAdminAPI(`/enable-user/${uid}`, 'POST');
      toast.success('User account enabled.');
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, disabled: false } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to enable user.');
    } finally {
      setAction(uid, null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-tab-content">
      <div className="admin-users-header">
        <h2 className="admin-section-title">User Management</h2>
        <button className="admin-btn admin-btn--sm" onClick={fetchUsers} disabled={loading}>
          {loading ? <FaSpinner className="admin-spin" /> : 'Refresh'}
        </button>
      </div>

      <input
        className="admin-input"
        type="text"
        placeholder="Search by email or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="admin-loading">
          <FaSpinner className="admin-spin" /> Loading users…
        </div>
      ) : (
        <div className="admin-user-list">
          {filtered.length === 0 && (
            <p className="admin-empty">No users found.</p>
          )}
          {filtered.map((u) => (
            <div key={u.uid} className={`admin-user-row ${u.disabled ? 'admin-user-row--disabled' : ''}`}>
              <div className="admin-user-info">
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    alt={u.displayName || u.email}
                    className="admin-user-avatar"
                  />
                ) : (
                  <div className="admin-user-avatar admin-user-avatar--placeholder">
                    {(u.displayName || u.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="admin-user-name">
                    {u.displayName || '(no name)'}{' '}
                    {u.disabled && (
                      <span className="admin-user-tag admin-user-tag--disabled">Disabled</span>
                    )}
                  </div>
                  <div className="admin-user-email">{u.email}</div>
                  <div className="admin-user-meta">
                    UID: <span className="admin-user-uid">{u.uid}</span>
                  </div>
                  {u.createdAt && (
                    <div className="admin-user-meta">
                      Joined: {new Date(u.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                  {u.lastSignIn && (
                    <div className="admin-user-meta">
                      Last seen: {new Date(u.lastSignIn).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-user-actions">
                <button
                  className="admin-btn admin-btn--sm admin-btn--ghost"
                  onClick={() => handleForceSignOut(u.uid)}
                  disabled={!!actionLoading[u.uid]}
                  title="Force sign-out"
                >
                  {actionLoading[u.uid] === 'signout' ? (
                    <FaSpinner className="admin-spin" />
                  ) : (
                    <FaSignOutAlt />
                  )}
                  <span className="admin-btn-label">Sign Out</span>
                </button>
                {u.disabled ? (
                  <button
                    className="admin-btn admin-btn--sm admin-btn--success"
                    onClick={() => handleEnable(u.uid)}
                    disabled={!!actionLoading[u.uid]}
                    title="Enable account"
                  >
                    {actionLoading[u.uid] === 'enable' ? (
                      <FaSpinner className="admin-spin" />
                    ) : (
                      <FaCheckCircle />
                    )}
                    <span className="admin-btn-label">Enable</span>
                  </button>
                ) : (
                  <button
                    className="admin-btn admin-btn--sm admin-btn--danger"
                    onClick={() => handleDisable(u.uid)}
                    disabled={!!actionLoading[u.uid]}
                    title="Disable account"
                  >
                    {actionLoading[u.uid] === 'disable' ? (
                      <FaSpinner className="admin-spin" />
                    ) : (
                      <FaBan />
                    )}
                    <span className="admin-btn-label">Disable</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Community moderation
// ---------------------------------------------------------------------------

function CommunityTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [busy, setBusy] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const q = query(
      collection(db, 'communityReports'),
      orderBy('createdAt', 'desc'),
      limit(ADMIN_REPORTS_LIMIT)
    );

    try {
      const snap = await getDocs(q);
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Failed to load community reports:', err);
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleReview = async (reportId) => {
    setBusy(reportId);
    try {
      await updateDoc(doc(db, 'communityReports', reportId), {
        status: 'reviewed',
        reviewedAt: serverTimestamp(),
        reviewedBy: auth.currentUser.uid,
      });
      setReports((current) =>
        current.map((report) =>
          report.id === reportId ? { ...report, status: 'reviewed' } : report
        )
      );
      toast.success('Report dismissed.');
    } catch (err) {
      console.error('Failed to dismiss report:', err);
      toast.error('Failed to update report.');
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (report) => {
    const target = getReportTarget(report);
    const contentLabel = target.label;
    if (!window.confirm(`Remove this ${contentLabel} and resolve the report? This cannot be undone.`)) {
      return;
    }
    setBusy(report.id);
    try {
      if (target.type === 'comment') {
        if (!target.postId || !target.commentId) {
          throw new Error('Comment report is missing postId or commentId.');
        }
        // Remove just the offending comment
        await deleteDoc(doc(db, 'communityPosts', target.postId, 'comments', target.commentId));
      } else if (target.postId) {
        // Remove the post together with all its subcollections
        const [likesSnap, commentsSnap] = await Promise.all([
          getDocs(collection(db, 'communityPosts', target.postId, 'likes')),
          getDocs(collection(db, 'communityPosts', target.postId, 'comments')),
        ]);
        const cleanupBatch = writeBatch(db);
        likesSnap.docs.forEach((d) => cleanupBatch.delete(d.ref));
        commentsSnap.docs.forEach((d) => cleanupBatch.delete(d.ref));
        await cleanupBatch.commit();
        await deleteDoc(doc(db, 'communityPosts', target.postId));
      } else {
        throw new Error('Post report is missing postId.');
      }
      await updateDoc(doc(db, 'communityReports', report.id), {
        status: 'removed',
        reviewedAt: serverTimestamp(),
        reviewedBy: auth.currentUser.uid,
      });
      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, status: 'removed' } : item
        )
      );
      toast.success(`${contentLabel.charAt(0).toUpperCase() + contentLabel.slice(1)} removed and report resolved.`);
    } catch (err) {
      console.error('Failed to remove reported content:', err);
      toast.error('Failed to remove content. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="admin-tab-content">
      <div className="admin-users-header">
        <h2 className="admin-section-title">Community Reports</h2>
        <button className="admin-btn admin-btn--sm" onClick={loadReports} disabled={loading}>
          {loading ? <FaSpinner className="admin-spin" /> : 'Refresh'}
        </button>
      </div>
      <div className="admin-filter-row">
        {['open', 'reviewed', 'removed', 'all'].map((f) => (
          <button
            key={f}
            className={`admin-filter-btn ${filter === f ? 'admin-filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">
          <FaSpinner className="admin-spin" /> Loading reports…
        </div>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No {filter} reports.</p>
      ) : (
        <div className="admin-report-list">
          {filtered.map((r) => {
            const target = getReportTarget(r);

            return (
              <div key={r.id} className={`admin-report-card admin-report-card--${r.status}`}>
                <div className="admin-report-meta">
                  <span className={`admin-report-status admin-report-status--${r.status}`}>
                    {r.status}
                  </span>
                  <span className="admin-report-type">{target.label}</span>
                  <span className="admin-report-reason">{r.reason}</span>
                </div>
                <p className="admin-report-preview">
                  &ldquo;{r.contentPreview}&rdquo;
                </p>
                <div className="admin-report-reporter">
                  Reported by <strong>{r.reporterName}</strong>
                </div>
                {r.status === 'open' && (
                  <div className="admin-report-actions">
                    <button
                      className="admin-btn admin-btn--sm admin-btn--ghost"
                      onClick={() => handleReview(r.id)}
                      disabled={busy === r.id}
                    >
                      {busy === r.id ? <FaSpinner className="admin-spin" /> : <FaEye />} Dismiss
                    </button>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => handleRemove(r)}
                      disabled={busy === r.id}
                    >
                      {busy === r.id ? <FaSpinner className="admin-spin" /> : <FaTrash />}
                      {' '}Remove {target.label.charAt(0).toUpperCase() + target.label.slice(1)}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Content (placeholder)
// ---------------------------------------------------------------------------

function ContentTab() {
  return (
    <div className="admin-tab-content">
      <h2 className="admin-section-title">Content Management</h2>
      <div className="admin-coming-soon">
        <FaBook className="admin-coming-soon__icon" />
        <p>
          Bursary and program content management is coming in a future update.
          Content will be migrated from static data to Firestore so you can
          add, edit, and remove listings here.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminDashboard
// ---------------------------------------------------------------------------

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'announcements', label: '📣 Announcements' },
  { key: 'users', label: '👥 Users' },
  { key: 'community', label: '🚩 Community' },
  { key: 'content', label: '📚 Content' },
];

export default function AdminDashboard() {
  const { user, adminData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load aggregate stats
  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const [postsSnap, reportsSnap] = await Promise.all([
          getCountFromServer(collection(db, 'communityPosts')),
          getCountFromServer(
            query(collection(db, 'communityReports'), ...[])
          ),
        ]);
        if (cancelled) return;
        setStats([
          {
            icon: <FaChartBar />,
            value: postsSnap.data().count,
            label: 'Community Posts',
          },
          {
            icon: <FaFlag />,
            value: reportsSnap.data().count,
            label: 'Total Reports',
          },
          {
            icon: <FaUsers />,
            value: adminData?.role || 'admin',
            label: 'Your Role',
          },
          {
            icon: <FaShieldAlt />,
            value: 'Active',
            label: 'Admin Status',
          },
        ]);
      } catch {
        // Stats unavailable — fail silently
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, [adminData]);

  const shortcuts = [
    {
      label: 'Send Announcement',
      icon: <FaBullhorn />,
      onClick: () => setActiveTab('announcements'),
    },
    {
      label: 'Manage Users',
      icon: <FaUsers />,
      onClick: () => setActiveTab('users'),
    },
    {
      label: 'View Reports',
      icon: <FaFlag />,
      onClick: () => setActiveTab('community'),
    },
    {
      label: 'Back to Profile',
      icon: <FaSignOutAlt />,
      onClick: () => navigate(routes.profile),
    },
  ];

  return (
    <div className="admin-dashboard-page">
      <SEO
        title="Admin Dashboard | Gradiate"
        description="Gradiate global admin dashboard"
        noindex
      />

      <div className="admin-dashboard-inner">
        {/* Admin identity header */}
        <div className="admin-identity-bar">
          <AdminBadge />
          <span className="admin-identity-name">
            {user?.displayName || user?.email}
          </span>
          <span className="admin-identity-sub">Global Administrator</span>
        </div>

        <DashboardSection
          title="Admin Dashboard"
          subtitle="Manage all aspects of the Gradiate platform."
          searchPlaceholder={`Search ${activeTab === 'users' ? 'users by name or email' : 'across admin'}…`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          shortcuts={shortcuts}
          stats={[]}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'content' && <ContentTab />}
      </div>
    </div>
  );
}
