import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'gradiate_pwa_install_dismissed_at';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneDisplayMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function wasRecentlyDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS);
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [isHidden, setIsHidden] = useState(() => wasRecentlyDismissed());

  const canShowInstall = Boolean(installPrompt) && !isHidden;
  const canShowUpdate = Boolean(updateRegistration);
  const isVisible = canShowInstall || canShowUpdate;

  const title = useMemo(
    () => (canShowUpdate ? 'Update Gradiate' : 'Install Gradiate'),
    [canShowUpdate]
  );
  const body = useMemo(
    () =>
      canShowUpdate
        ? 'A fresh version is ready.'
        : 'Add Gradiate to your home screen for a faster app-like experience.',
    [canShowUpdate]
  );

  useEffect(() => {
    if (isStandaloneDisplayMode()) {
      return undefined;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsHidden(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    const handleUpdateReady = (event) => {
      setUpdateRegistration(event.detail?.registration || null);
    };

    window.addEventListener('gradiate:pwa-update-ready', handleUpdateReady);
    return () => window.removeEventListener('gradiate:pwa-update-ready', handleUpdateReady);
  }, []);

  const handleInstall = async () => {
    if (canShowUpdate) {
      const waitingWorker = updateRegistration.waiting;

      if (waitingWorker && 'serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => window.location.reload(),
          { once: true }
        );
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }

      return;
    }

    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice.catch(() => null);

    if (choice?.outcome !== 'dismissed') {
      setInstallPrompt(null);
      setIsHidden(true);
    }
  };

  const handleDismiss = () => {
    if (!canShowUpdate) {
      rememberDismissal();
      setIsHidden(true);
    }

    setUpdateRegistration(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="pwa-install-prompt" aria-live="polite">
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <div className="pwa-install-prompt__actions">
        <button className="pwa-install-prompt__primary" type="button" onClick={handleInstall}>
          {canShowUpdate ? 'Refresh' : 'Install'}
        </button>
        <button className="pwa-install-prompt__secondary" type="button" onClick={handleDismiss}>
          Later
        </button>
      </div>
    </aside>
  );
}
