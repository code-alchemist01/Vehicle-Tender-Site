import { User } from './user';
import { Auction } from './auction';

export interface Bid {
  id: string;
  auctionId: string;
  auction?: Auction;
  bidderId: string;
  bidder: User;
  amount: number;
  maxBid?: number; // For proxy bidding
  isAutoBid: boolean;
  isWinning: boolean;
  timestamp: string;
  status: BidStatus;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateBidRequest {
  auctionId: string;
  amount: number;
  maxBid?: number; // For proxy bidding
}

export interface BidResponse {
  bid: Bid;
  isWinning: boolean;
  nextMinimumBid: number;
  timeRemaining: number;
  message: string;
}

export interface BidHistory {
  bids: Bid[];
  total: number;
  highestBid: Bid | null;
  userHighestBid: Bid | null;
  bidCount: number;
}

export interface BidValidation {
  isValid: boolean;
  errors: string[];
  minimumBid: number;
  maximumBid?: number;
  suggestedBid?: number;
}

export interface AutoBidSettings {
  enabled: boolean;
  maxAmount: number;
  incrementStrategy: 'minimum' | 'aggressive' | 'conservative';
  stopIfOutbid: boolean;
  notifications: {
    outbid: boolean;
    winning: boolean;
    auctionEnding: boolean;
  };
}

export interface BidStatistics {
  totalBids: number;
  wonAuctions: number;
  lostAuctions: number;
  activeAuctions: number;
  totalSpent: number;
  averageBid: number;
  successRate: number;
  favoriteCategories: Array<{
    category: string;
    count: number;
    winRate: number;
  }>;
  biddingPattern: {
    earlyBidder: number; // percentage
    lastMinuteBidder: number; // percentage
    averageTimeBeforeEnd: number; // minutes
  };
}

export interface BidAlert {
  id: string;
  userId: string;
  auctionId: string;
  type: BidAlertType;
  criteria: BidAlertCriteria;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface BidAlertCriteria {
  maxPrice?: number;
  timeBeforeEnd?: number; // minutes
  outbidNotification?: boolean;
  auctionEndingNotification?: boolean;
}

export interface ProxyBid {
  id: string;
  auctionId: string;
  bidderId: string;
  maxAmount: number;
  currentAmount: number;
  isActive: boolean;
  createdAt: string;
  lastBidAt?: string;
}

export interface BidIncrement {
  minPrice: number;
  maxPrice: number;
  increment: number;
}

export interface BidConflict {
  type: 'simultaneous' | 'proxy_overlap' | 'invalid_amount';
  message: string;
  suggestedAction: string;
  alternativeBid?: number;
}

export interface BidAnalytics {
  auctionId: string;
  totalBids: number;
  uniqueBidders: number;
  averageBid: number;
  bidProgression: Array<{
    timestamp: string;
    amount: number;
    bidderId: string;
  }>;
  biddingIntensity: {
    early: number; // first 25% of auction
    middle: number; // middle 50% of auction
    late: number; // last 25% of auction
  };
  topBidders: Array<{
    bidderId: string;
    bidCount: number;
    highestBid: number;
    isWinner: boolean;
  }>;
}

export type BidStatus = 
  | 'active'
  | 'outbid'
  | 'winning'
  | 'won'
  | 'lost'
  | 'cancelled'
  | 'invalid';

export type BidAlertType = 
  | 'outbid'
  | 'auction_ending'
  | 'price_threshold'
  | 'new_bid'
  | 'auction_won'
  | 'auction_lost';

export interface BidNotification {
  id: string;
  userId: string;
  auctionId: string;
  bidId?: string;
  type: BidAlertType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface BidSummary {
  totalBids: number;
  activeBids: number;
  winningBids: number;
  totalValue: number;
  recentBids: Bid[];
  upcomingEndings: Array<{
    auctionId: string;
    title: string;
    currentBid: number;
    endTime: string;
    isWinning: boolean;
  }>;
}