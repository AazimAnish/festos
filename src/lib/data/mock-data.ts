export interface SampleEvent {
  id: number;
  uniqueId: string; // Lu.ma style unique ID
  title: string;
  location: string;
  price: string;
  image: string;
  joinedCount: number;
  hasPOAP: boolean;
  isSaved: boolean;
  category: string;
  date: string;
}

// India coordinates for events
export const EVENT_COORDINATES: Record<number, [number, number]> = {
  1: [77.5946, 12.9716], // Bangalore
  2: [77.209, 28.6139], // New Delhi
  3: [72.8777, 19.076], // Mumbai
  4: [80.2707, 13.0827], // Chennai
  5: [78.4867, 17.385], // Hyderabad
  6: [73.8563, 18.5204], // Pune
  7: [88.3639, 22.5726], // Kolkata
  8: [72.5714, 23.0225], // Ahmedabad
};

export const MOCK_EVENTS: SampleEvent[] = [
  {
    id: 1,
    uniqueId: 'fpvxrdl3', // Lu.ma style unique ID
    title: 'ETHIndia 2025 🇮🇳',
    location: 'Bangalore, India',
    price: '0.01 ETH',
    image: '/card1.png',
    joinedCount: 421,
    hasPOAP: true,
    isSaved: false,
    category: 'Tech',
    date: '2025-01-15',
  },
  {
    id: 2,
    uniqueId: 'web3delhi',
    title: 'Web3 Delhi Summit',
    location: 'New Delhi, India',
    price: '0.05 ETH',
    image: '/card2.png',
    joinedCount: 1200,
    hasPOAP: true,
    isSaved: true,
    category: 'Tech',
    date: '2025-02-20',
  },
  {
    id: 3,
    uniqueId: 'mumbaiblock',
    title: 'Mumbai Blockchain Fest',
    location: 'Mumbai, India',
    price: 'Free',
    image: '/card3.png',
    joinedCount: 89,
    hasPOAP: false,
    isSaved: false,
    category: 'Music',
    date: '2025-03-10',
  },
  {
    id: 4,
    uniqueId: 'chennainft',
    title: 'Chennai NFT Expo',
    location: 'Chennai, India',
    price: '0.1 ETH',
    image: '/card1.png',
    joinedCount: 567,
    hasPOAP: true,
    isSaved: false,
    category: 'Art',
    date: '2025-04-05',
  },
  {
    id: 5,
    uniqueId: 'hydcrypto',
    title: 'Hyderabad Crypto Gaming',
    location: 'Hyderabad, India',
    price: '0.03 ETH',
    image: '/card2.png',
    joinedCount: 234,
    hasPOAP: true,
    isSaved: true,
    category: 'Tech',
    date: '2025-05-12',
  },
  {
    id: 6,
    uniqueId: 'punedefi',
    title: 'Pune DeFi Workshop',
    location: 'Pune, India',
    price: '0.02 ETH',
    image: '/card3.png',
    joinedCount: 156,
    hasPOAP: false,
    isSaved: false,
    category: 'Tech',
    date: '2025-06-08',
  },
  {
    id: 7,
    uniqueId: 'kolkataweb3',
    title: 'Kolkata Web3 Meetup',
    location: 'Kolkata, India',
    price: 'Free',
    image: '/card1.png',
    joinedCount: 89,
    hasPOAP: true,
    isSaved: false,
    category: 'Tech',
    date: '2025-07-15',
  },
  {
    id: 8,
    uniqueId: 'ahmedabadblk',
    title: 'Ahmedabad Blockchain',
    location: 'Ahmedabad, India',
    price: '0.04 ETH',
    image: '/card2.png',
    joinedCount: 312,
    hasPOAP: true,
    isSaved: true,
    category: 'Tech',
    date: '2025-08-20',
  },
];

// Default location (India - New Delhi)
export const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.209,
};

// Map configuration
export const MAP_CONFIG = {
  defaultZoom: 8,
  cityZoom: 10,
  countryZoom: 6,
};
