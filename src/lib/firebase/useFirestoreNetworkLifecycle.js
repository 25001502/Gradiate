import { useEffect } from 'react';
import { startFirestoreNetworkLifecycle } from './networkLifecycle';

export function useFirestoreNetworkLifecycle() {
  useEffect(() => startFirestoreNetworkLifecycle(), []);
}
