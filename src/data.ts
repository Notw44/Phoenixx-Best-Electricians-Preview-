import { Review, Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'panel_upgrade',
    title: 'Elite Panel Upgrades',
    description: 'Replace aging breakers or upgrade your main panel to 200A+ to safely power modern smart homes, EV chargers, and heavy appliances.',
    iconName: 'Cpu',
    basePriceRange: '$1,800 - $3,500',
    popularFor: 'Sophie Copeland & 42 others upgraded this year'
  },
  {
    id: 'solar_installation',
    title: 'Smart Solar Systems',
    description: 'Premium solar paneled solutions engineered for high efficiency in the intense Phoenix heat. We consult, install, and maximize your offsets.',
    iconName: 'Sun',
    basePriceRange: '$12,000 - $25,000 (Before tax credits)',
    popularFor: 'Chosen after 6 alternative consultations'
  },
  {
    id: 'breaker_troubleshooting',
    title: 'Breaker & Fault Troubleshooting',
    description: 'Diagnose and repair tripped breakers that won\'t reset, flickering lights, and faulty wiring with our rapid 24/7 emergency dispatch.',
    iconName: 'ZapOff',
    basePriceRange: '$150 - $450',
    popularFor: 'Tracey Conner: "Talked to someone right away"'
  },
  {
    id: 'ceiling_fan_lighting',
    title: 'Ceiling Fan & Premium Lighting',
    description: 'Keep your cooling optimal with professional installation of high-efficiency ceiling fans, custom chandeliers, and architectural LED lighting.',
    iconName: 'Fan',
    basePriceRange: '$120 - $350 per fan',
    popularFor: '12+ verified ceiling fan installations'
  },
  {
    id: 'switches_outlets',
    title: 'Smart Switches & Outlets',
    description: 'Install high-end smart switches, dimmers, USB outlets, and dedicated GFCIs for bathrooms, kitchens, and outdoor zones.',
    iconName: 'ToggleRight',
    basePriceRange: '$80 - $180 per switch',
    popularFor: '14+ verified switch upgrades'
  },
  {
    id: 'condo_work',
    title: 'Condo & Multi-Family Electrical',
    description: 'Expert, low-disruption electrical updates tailored specifically to high-rise and condo code requirements and strict HOA regulations.',
    iconName: 'Building2',
    basePriceRange: 'Varies by HOA scope',
    popularFor: 'Specialized Midtown condo experts'
  }
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sophie Copeland',
    rating: 5,
    timeAgo: '4 months ago',
    text: 'I highly recommend Phoenix Best Electricians! They provided quick and expert service when updating our electrical panel. Tracy was very knowledgeable, answered all of our questions, and took time to explain everything clearly. The pricing was fair and transparent.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    category: 'panel',
    tags: ['Panel Upgrade', 'Skilled', 'Tracy']
  },
  {
    id: '2',
    author: 'Shirley A',
    rating: 5,
    timeAgo: '4 months ago',
    text: 'I’m really happy I chose to have my solar panels installed by this electrical company in Phoenix. I had about six different electricians come out for consultations, and in the end, the solar panel options they offered just made the most sense and the savings have been incredible!',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    category: 'solar',
    tags: ['Solar Panels', 'Consultation', 'Energy Savings']
  },
  {
    id: '3',
    author: 'Tracey Conner',
    rating: 5,
    timeAgo: '6 months ago',
    text: 'I recently had an issue where one of my electrical breakers tripped and wouldn’t reset. After searching for electricians nearby, I found a company with great reviews and decided to give them a call. I was able to talk to someone right away and they dispatched Tracy within the hour. Outstanding service!',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    category: 'breaker',
    tags: ['Breaker', 'Emergency Dispatch', 'Tracy']
  },
  {
    id: '4',
    author: 'Marcus Vance',
    rating: 5,
    timeAgo: '2 months ago',
    text: 'Needed 14 smart switches and dimmers installed across our home in Phoenix. Tracy did a spectacular job setting them up, grouping them, and ensuring everything met safety standards. Clean workspace and extremely skilled.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    category: 'ceiling_fan',
    tags: ['Switches', 'Smart Home', 'Skilled']
  },
  {
    id: '5',
    author: 'Elena Rojas',
    rating: 5,
    timeAgo: '1 month ago',
    text: 'Phoenix heat is brutal, so when our primary living room ceiling fan stopped working, we needed a replacement immediately. Called Phoenix Best Electricians and they came out the same afternoon. Installed a gorgeous new fan and checked our panel, too.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    category: 'ceiling_fan',
    tags: ['Ceiling Fans', 'Same-Day Service']
  },
  {
    id: '6',
    author: 'David K.',
    rating: 5,
    timeAgo: '5 months ago',
    text: 'Excellent condo work. Did a full electrical update for my unit in Midtown. They understood our complex building codes and completed everything on time with zero issues from the HOA. Pricing was very reasonable.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    category: 'general',
    tags: ['Condo Work', 'HOA Compliant']
  }
];

export const FAQS = [
  {
    question: 'Are you licensed, bonded, and insured in the state of Arizona?',
    answer: 'Absolutely. We are fully licensed, bonded, and insured for both residential and commercial electrical work in Phoenix and the surrounding municipalities. Our technicians are highly trained, background-checked, and regularly certified.'
  },
  {
    question: 'How fast can you dispatch an electrician for a tripped breaker or emergency?',
    answer: 'We operate 24 hours a day, 7 days a week. For emergencies like tripped main breakers, power failures, or burning smells, our priority dispatch can usually have a technician at your Phoenix door within 45 to 60 minutes.'
  },
  {
    question: 'What is the cost of a panel upgrade or replacement in Phoenix?',
    answer: 'A standard main electrical panel upgrade (e.g., upgrading from 100A to 200A) typically ranges from $1,800 to $3,500. This depends on the brand of the panel, complexity of labeling, and if any local utility coordination is needed. We provide complete upfront quotes with zero hidden fees.'
  },
  {
    question: 'Why should I choose your solar options over other Phoenix solar companies?',
    answer: 'Unlike high-pressure solar marketing agencies, we are actual electricians first. We design and install solar panels that integrate perfectly with your existing electrical architecture, offer transparent pricing without predatory financing, and handle all local permitting directly.'
  }
];

export const SERVICE_LOCATIONS = [
  'North Mountain',
  'Marketplace At Central',
  'Paradise Valley',
  'Camelback East',
  'Downtown Phoenix',
  'Biltmore Area',
  'Arcadia',
  'Scottsdale Border'
];
