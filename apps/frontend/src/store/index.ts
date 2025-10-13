// Export all stores
export * from './authStore';
export * from './auctionStore';
export * from './uiStore';

// Store types
export type { AuthStore } from './authStore';
export type { AuctionStore } from './auctionStore';
export type { UIStore } from './uiStore';

// Combined store actions for easier access
import { useAuthActions } from './authStore';
import { useAuctionActions } from './auctionStore';
import { useUIActions } from './uiStore';

export const useStoreActions = () => ({
  auth: useAuthActions(),
  auction: useAuctionActions(),
  ui: useUIActions(),
});

// Store reset function for logout or app reset
export const useResetStores = () => {
  const authActions = useAuthActions();
  const auctionActions = useAuctionActions();
  const uiActions = useUIActions();

  return () => {
    authActions.logout();
    auctionActions.reset();
    uiActions.closeAllModals();
    uiActions.clearNotifications();
    uiActions.clearAllErrors();
  };
};