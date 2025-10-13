import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Modals
  modals: {
    loginModal: boolean;
    registerModal: boolean;
    bidModal: boolean;
    createAuctionModal: boolean;
    profileModal: boolean;
    confirmModal: boolean;
    imageModal: boolean;
  };
  
  // Loading states
  loading: {
    global: boolean;
    auctions: boolean;
    bids: boolean;
    profile: boolean;
    upload: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  
  // View preferences
  viewMode: 'grid' | 'list';
  itemsPerPage: number;
  
  // Search and filters
  searchHistory: string[];
  recentlyViewed: string[];
  
  // Breadcrumbs
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
  
  // Error states
  errors: {
    global: string | null;
    form: Record<string, string>;
  };
}

interface UIActions {
  // Theme actions
  setTheme: (theme: UIState['theme']) => void;
  toggleTheme: () => void;
  
  // Layout actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  // Modal actions
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // View preference actions
  setViewMode: (mode: UIState['viewMode']) => void;
  setItemsPerPage: (items: number) => void;
  
  // Search and filter actions
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addToRecentlyViewed: (itemId: string) => void;
  clearRecentlyViewed: () => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;
  addBreadcrumb: (breadcrumb: UIState['breadcrumbs'][0]) => void;
  clearBreadcrumbs: () => void;
  
  // Error actions
  setGlobalError: (error: string | null) => void;
  setFormError: (field: string, error: string) => void;
  clearFormErrors: () => void;
  clearAllErrors: () => void;
}

export type UIStore = UIState & UIActions;

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: false,
  mobileMenuOpen: false,
  modals: {
    loginModal: false,
    registerModal: false,
    bidModal: false,
    createAuctionModal: false,
    profileModal: false,
    confirmModal: false,
    imageModal: false,
  },
  loading: {
    global: false,
    auctions: false,
    bids: false,
    profile: false,
    upload: false,
  },
  notifications: [],
  viewMode: 'grid',
  itemsPerPage: 12,
  searchHistory: [],
  recentlyViewed: [],
  breadcrumbs: [],
  errors: {
    global: null,
    form: {},
  },
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme actions
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },

      // Layout actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => {
        const { sidebarOpen } = get();
        set({ sidebarOpen: !sidebarOpen });
      },
      
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      
      toggleMobileMenu: () => {
        const { mobileMenuOpen } = get();
        set({ mobileMenuOpen: !mobileMenuOpen });
      },

      // Modal actions
      openModal: (modal) => {
        const { modals } = get();
        set({
          modals: { ...modals, [modal]: true },
        });
      },
      
      closeModal: (modal) => {
        const { modals } = get();
        set({
          modals: { ...modals, [modal]: false },
        });
      },
      
      closeAllModals: () => {
        set({
          modals: {
            loginModal: false,
            registerModal: false,
            bidModal: false,
            createAuctionModal: false,
            profileModal: false,
            confirmModal: false,
            imageModal: false,
          },
        });
      },

      // Loading actions
      setLoading: (key, loading) => {
        const { loading: currentLoading } = get();
        set({
          loading: { ...currentLoading, [key]: loading },
        });
      },
      
      setGlobalLoading: (loading) => {
        get().setLoading('global', loading);
      },

      // Notification actions
      addNotification: (notification) => {
        const { notifications } = get();
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        };
        set({
          notifications: [newNotification, ...notifications].slice(0, 50), // Keep only last 50
        });
      },
      
      removeNotification: (id) => {
        const { notifications } = get();
        set({
          notifications: notifications.filter(n => n.id !== id),
        });
      },
      
      markNotificationAsRead: (id) => {
        const { notifications } = get();
        set({
          notifications: notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },

      // View preference actions
      setViewMode: (viewMode) => set({ viewMode }),
      
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),

      // Search and filter actions
      addToSearchHistory: (query) => {
        const { searchHistory } = get();
        const trimmedQuery = query.trim();
        if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
          set({
            searchHistory: [trimmedQuery, ...searchHistory].slice(0, 10), // Keep only last 10
          });
        }
      },
      
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
      
      addToRecentlyViewed: (itemId) => {
        const { recentlyViewed } = get();
        if (!recentlyViewed.includes(itemId)) {
          set({
            recentlyViewed: [itemId, ...recentlyViewed].slice(0, 20), // Keep only last 20
          });
        }
      },
      
      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },

      // Breadcrumb actions
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      
      addBreadcrumb: (breadcrumb) => {
        const { breadcrumbs } = get();
        set({
          breadcrumbs: [...breadcrumbs, breadcrumb],
        });
      },
      
      clearBreadcrumbs: () => {
        set({ breadcrumbs: [] });
      },

      // Error actions
      setGlobalError: (error) => {
        const { errors } = get();
        set({
          errors: { ...errors, global: error },
        });
      },
      
      setFormError: (field, error) => {
        const { errors } = get();
        set({
          errors: {
            ...errors,
            form: { ...errors.form, [field]: error },
          },
        });
      },
      
      clearFormErrors: () => {
        const { errors } = get();
        set({
          errors: { ...errors, form: {} },
        });
      },
      
      clearAllErrors: () => {
        set({
          errors: { global: null, form: {} },
        });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        searchHistory: state.searchHistory,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

// Selectors
export const useTheme = () => useUIStore((state) => state.theme);

export const useLayout = () => useUIStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  mobileMenuOpen: state.mobileMenuOpen,
}));

export const useModals = () => useUIStore((state) => state.modals);

export const useLoading = () => useUIStore((state) => state.loading);

export const useNotifications = () => useUIStore((state) => state.notifications);

export const useViewPreferences = () => useUIStore((state) => ({
  viewMode: state.viewMode,
  itemsPerPage: state.itemsPerPage,
}));

export const useSearchHistory = () => useUIStore((state) => state.searchHistory);

export const useRecentlyViewed = () => useUIStore((state) => state.recentlyViewed);

export const useBreadcrumbs = () => useUIStore((state) => state.breadcrumbs);

export const useErrors = () => useUIStore((state) => state.errors);

export const useUIActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setMobileMenuOpen: state.setMobileMenuOpen,
  toggleMobileMenu: state.toggleMobileMenu,
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  setLoading: state.setLoading,
  setGlobalLoading: state.setGlobalLoading,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markNotificationAsRead: state.markNotificationAsRead,
  clearNotifications: state.clearNotifications,
  setViewMode: state.setViewMode,
  setItemsPerPage: state.setItemsPerPage,
  addToSearchHistory: state.addToSearchHistory,
  clearSearchHistory: state.clearSearchHistory,
  addToRecentlyViewed: state.addToRecentlyViewed,
  clearRecentlyViewed: state.clearRecentlyViewed,
  setBreadcrumbs: state.setBreadcrumbs,
  addBreadcrumb: state.addBreadcrumb,
  clearBreadcrumbs: state.clearBreadcrumbs,
  setGlobalError: state.setGlobalError,
  setFormError: state.setFormError,
  clearFormErrors: state.clearFormErrors,
  clearAllErrors: state.clearAllErrors,
}));