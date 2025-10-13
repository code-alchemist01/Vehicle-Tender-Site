import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Auction, AuctionStatus, AuctionFilters } from '@/types/auction';
import { Bid } from '@/types/bid';

interface AuctionState {
  auctions: Auction[];
  featuredAuctions: Auction[];
  currentAuction: Auction | null;
  userAuctions: Auction[];
  userBids: Bid[];
  watchlist: string[];
  filters: AuctionFilters;
  searchQuery: string;
  sortBy: 'endTime' | 'price' | 'created' | 'bids';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
  error: string | null;
}

interface AuctionActions {
  setAuctions: (auctions: Auction[]) => void;
  setFeaturedAuctions: (auctions: Auction[]) => void;
  setCurrentAuction: (auction: Auction | null) => void;
  setUserAuctions: (auctions: Auction[]) => void;
  setUserBids: (bids: Bid[]) => void;
  addToWatchlist: (auctionId: string) => void;
  removeFromWatchlist: (auctionId: string) => void;
  setWatchlist: (watchlist: string[]) => void;
  updateFilters: (filters: Partial<AuctionFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: AuctionState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setPagination: (currentPage: number, totalPages: number, totalItems: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateAuction: (auctionId: string, updates: Partial<Auction>) => void;
  addBid: (auctionId: string, bid: Bid) => void;
  updateAuctionStatus: (auctionId: string, status: AuctionStatus) => void;
  clearError: () => void;
  reset: () => void;
}

export type AuctionStore = AuctionState & AuctionActions;

const initialFilters: AuctionFilters = {
  brand: '',
  model: '',
  yearFrom: undefined,
  yearTo: undefined,
  priceFrom: undefined,
  priceTo: undefined,
  mileageFrom: undefined,
  mileageTo: undefined,
  fuelType: '',
  transmission: '',
  condition: '',
  location: '',
  status: 'active',
};

const initialState: AuctionState = {
  auctions: [],
  featuredAuctions: [],
  currentAuction: null,
  userAuctions: [],
  userBids: [],
  watchlist: [],
  filters: initialFilters,
  searchQuery: '',
  sortBy: 'endTime',
  sortOrder: 'asc',
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 12,
  isLoading: false,
  error: null,
};

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuctions: (auctions) =>
        set({ auctions }),

      setFeaturedAuctions: (featuredAuctions) =>
        set({ featuredAuctions }),

      setCurrentAuction: (currentAuction) =>
        set({ currentAuction }),

      setUserAuctions: (userAuctions) =>
        set({ userAuctions }),

      setUserBids: (userBids) =>
        set({ userBids }),

      addToWatchlist: (auctionId) => {
        const { watchlist } = get();
        if (!watchlist.includes(auctionId)) {
          set({ watchlist: [...watchlist, auctionId] });
        }
      },

      removeFromWatchlist: (auctionId) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(id => id !== auctionId) });
      },

      setWatchlist: (watchlist) =>
        set({ watchlist }),

      updateFilters: (newFilters) => {
        const { filters } = get();
        set({
          filters: { ...filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        });
      },

      clearFilters: () =>
        set({
          filters: initialFilters,
          currentPage: 1,
        }),

      setSearchQuery: (searchQuery) =>
        set({
          searchQuery,
          currentPage: 1, // Reset to first page when search changes
        }),

      setSortBy: (sortBy) =>
        set({ sortBy }),

      setSortOrder: (sortOrder) =>
        set({ sortOrder }),

      setCurrentPage: (currentPage) =>
        set({ currentPage }),

      setItemsPerPage: (itemsPerPage) =>
        set({
          itemsPerPage,
          currentPage: 1, // Reset to first page when items per page changes
        }),

      setPagination: (currentPage, totalPages, totalItems) =>
        set({ currentPage, totalPages, totalItems }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),

      updateAuction: (auctionId, updates) => {
        const { auctions, featuredAuctions, userAuctions, currentAuction } = get();
        
        // Update in auctions list
        const updatedAuctions = auctions.map(auction =>
          auction.id === auctionId ? { ...auction, ...updates } : auction
        );
        
        // Update in featured auctions
        const updatedFeaturedAuctions = featuredAuctions.map(auction =>
          auction.id === auctionId ? { ...auction, ...updates } : auction
        );
        
        // Update in user auctions
        const updatedUserAuctions = userAuctions.map(auction =>
          auction.id === auctionId ? { ...auction, ...updates } : auction
        );
        
        // Update current auction if it matches
        const updatedCurrentAuction = currentAuction?.id === auctionId
          ? { ...currentAuction, ...updates }
          : currentAuction;

        set({
          auctions: updatedAuctions,
          featuredAuctions: updatedFeaturedAuctions,
          userAuctions: updatedUserAuctions,
          currentAuction: updatedCurrentAuction,
        });
      },

      addBid: (auctionId, bid) => {
        const { auctions, currentAuction } = get();
        
        // Update auction with new bid
        const updatedAuctions = auctions.map(auction => {
          if (auction.id === auctionId) {
            return {
              ...auction,
              currentBid: bid.amount,
              bidCount: auction.bidCount + 1,
              bids: [...(auction.bids || []), bid],
            };
          }
          return auction;
        });
        
        // Update current auction if it matches
        const updatedCurrentAuction = currentAuction?.id === auctionId
          ? {
              ...currentAuction,
              currentBid: bid.amount,
              bidCount: currentAuction.bidCount + 1,
              bids: [...(currentAuction.bids || []), bid],
            }
          : currentAuction;

        set({
          auctions: updatedAuctions,
          currentAuction: updatedCurrentAuction,
        });
      },

      updateAuctionStatus: (auctionId, status) => {
        get().updateAuction(auctionId, { status });
      },

      clearError: () =>
        set({ error: null }),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'auction-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlist: state.watchlist,
        filters: state.filters,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);

// Selectors
export const useAuctions = () => useAuctionStore((state) => ({
  auctions: state.auctions,
  featuredAuctions: state.featuredAuctions,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useCurrentAuction = () => useAuctionStore((state) => state.currentAuction);

export const useAuctionFilters = () => useAuctionStore((state) => ({
  filters: state.filters,
  searchQuery: state.searchQuery,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
}));

export const useAuctionPagination = () => useAuctionStore((state) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  totalItems: state.totalItems,
  itemsPerPage: state.itemsPerPage,
}));

export const useWatchlist = () => useAuctionStore((state) => state.watchlist);

export const useUserAuctions = () => useAuctionStore((state) => state.userAuctions);

export const useUserBids = () => useAuctionStore((state) => state.userBids);

export const useAuctionActions = () => useAuctionStore((state) => ({
  setAuctions: state.setAuctions,
  setFeaturedAuctions: state.setFeaturedAuctions,
  setCurrentAuction: state.setCurrentAuction,
  setUserAuctions: state.setUserAuctions,
  setUserBids: state.setUserBids,
  addToWatchlist: state.addToWatchlist,
  removeFromWatchlist: state.removeFromWatchlist,
  updateFilters: state.updateFilters,
  clearFilters: state.clearFilters,
  setSearchQuery: state.setSearchQuery,
  setSortBy: state.setSortBy,
  setSortOrder: state.setSortOrder,
  setCurrentPage: state.setCurrentPage,
  setItemsPerPage: state.setItemsPerPage,
  setPagination: state.setPagination,
  setLoading: state.setLoading,
  setError: state.setError,
  updateAuction: state.updateAuction,
  addBid: state.addBid,
  updateAuctionStatus: state.updateAuctionStatus,
  clearError: state.clearError,
  reset: state.reset,
}));