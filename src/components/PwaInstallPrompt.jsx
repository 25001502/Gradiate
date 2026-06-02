import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'gradiate_pwa_install_dismissed_at';
const IOS_DISMISS_KEY = 'gradiate_pwa_ios_install_dismissed_at';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneDisplayMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  const userAgent = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  const isModernIpad =
    platform === 'MacIntel' && Number(window.navigator.maxTouchPoints) > 1;

  return /iPhone|iPad|iPod/i.test(userAgent) || isModernIpad;
}

function wasRecentlyDismissed(key = DISMISS_KEY) {
  try {
    const dismissedAt = Number(localStorage.getItem(key));
    return Boolean(dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS);
  } catch {
    return false;
  }
}

function rememberDismissal(key = DISMISS_KEY) {
  try {
    localStorage.setItem(key, Date.now().toString());
  } catch {
    // Storage can be unavailable in private browsing.
  }
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [isHidden, setIsHidden] = useState(() => wasRecentlyDismissed());
  const [isIosInstructionHidden, setIsIosInstructionHidden] = useState(() =>
    wasRecentlyDismissed(IOS_DISMISS_KEY)
  );
  const [isIosInstallCandidate, setIsIosInstallCandidate] = useState(false);

  const canShowInstall = Boolean(installPrompt) && !isHidden;
  const canShowUpdate = Boolean(updateRegistration);
  const canShowIosInstall =
    isIosInstallCandidate && !isIosInstructionHidden && !canShowInstall && !canShowUpdate;
  const isVisible = canShowInstall || canShowUpdate || canShowIosInstall;

  const title = useMemo(
    () => {
      if (canShowUpdate) return 'Update Gradiate';
      if (canShowIosInstall) return 'Install Gradiate on iPhone';
      return 'Install Gradiate';
    },
    [canShowIosInstall, canShowUpdate]
  );
  const body = useMemo(
    () => {
      if (canShowUpdate) return 'A fresh version is ready.';
      if (canShowIosInstall) return 'Tap Share in Safari, then Add to Home Screen.';
      return 'Add Gradiate to your home screen for a faster app-like experience.';
    },
    [canShowIosInstall, canShowUpdate]
  );

  useEffect(() => {
    setIsIosInstallCandidate(isIosDevice() && !isStandaloneDisplayMode());
  }, []);

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
    if (canShowIosInstall) {
      rememberDismissal(IOS_DISMISS_KEY);
      setIsIosInstructionHidden(true);
      return;
    }

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
    if (canShowIosInstall) {
      rememberDismissal(IOS_DISMISS_KEY);
      setIsIosInstructionHidden(true);
      return;
    }

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
          {canShowUpdate ? 'Refresh' : canShowIosInstall ? 'Got it' : 'Install'}
        </button>
        <button className="pwa-install-prompt__secondary" type="button" onClick={handleDismiss}>
          Later
        </button>
      </div>
    </aside>
  );
}
