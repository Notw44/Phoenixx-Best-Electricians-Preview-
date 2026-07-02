export interface Review {
  id: string;
  author: string;
  rating: number;
  timeAgo: string;
  text: string;
  avatarUrl?: string;
  category: 'panel' | 'solar' | 'breaker' | 'ceiling_fan' | 'general';
  tags: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  basePriceRange: string;
  popularFor: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceNeeded: string;
  scopeSize: string;
  details: string;
  status: 'pending' | 'dispatched' | 'completed';
  submittedAt: string;
  estimatedPrice: string;
  preferredTime: string;
}

export interface QuoteStep {
  id: number;
  title: string;
  subtitle: string;
}
