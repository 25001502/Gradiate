import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from './firestore';

let targetNetworkEnabled = true;
let networkUpdate = Promise.resolve();

const setFirestoreNetworkEnabled = (enabled) => {
  targetNetworkEnabled = enabled;

  networkUpdate = networkUpdate
    .catch(() => {})
    .then(async () => {
      if (targetNetworkEnabled) {
        await enableNetwork(db);
        return;
      }

      await disableNetwork(db);
    })
    .catch((error) => {
      console.warn(
        `Failed to ${targetNetworkEnabled ? 'enable' : 'disable'} Firestore network`,
        error
      );
    });

  return networkUpdate;
};

export const startFirestoreNetworkLifecycle = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {};
  }

  const syncWithVisibility = () => {
    setFirestoreNetworkEnabled(document.visibilityState !== 'hidden');
  };

  const enableIfVisible = () => {
    if (document.visibilityState !== 'hidden') {
      setFirestoreNetworkEnabled(true);
    }
  };

  const disableForPageExit = () => {
    setFirestoreNetworkEnabled(false);
  };

  document.addEventListener('visibilitychange', syncWithVisibility);
  window.addEventListener('pagehide', disableForPageExit);
  window.addEventListener('pageshow', enableIfVisible);
  window.addEventListener('online', enableIfVisible);

  syncWithVisibility();

  return () => {
    document.removeEventListener('visibilitychange', syncWithVisibility);
    window.removeEventListener('pagehide', disableForPageExit);
    window.removeEventListener('pageshow', enableIfVisible);
    window.removeEventListener('online', enableIfVisible);
    setFirestoreNetworkEnabled(true);
  };
};
