import { useEffect } from 'react';
import { startFirestoreNetworkLifecycle } from './networkLifecycle';

export function useFirestoreNetworkLifecycle() {
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_FIRESTORE_NETWORK_LIFECYCLE !== 'true') {
      return undefined;
    }

    return startFirestoreNetworkLifecycle();
  }, []);
}
