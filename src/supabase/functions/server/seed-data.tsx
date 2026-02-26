// This file contains seed data that will be loaded when the server starts
// You can modify this to add default beats and services

export const defaultBeats = [
  {
    title: 'Midnight Vibes',
    genre: 'Trap',
    bpm: '140',
    duration: '3:24',
    type: 'beat',
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
  },
  {
    title: 'Summer Nights Remix',
    genre: 'House',
    bpm: '128',
    duration: '4:15',
    type: 'remix',
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  },
  {
    title: 'Urban Flow',
    genre: 'Hip-Hop',
    bpm: '90',
    duration: '3:45',
    type: 'beat',
    audioUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  },
];

export const defaultServices = [
  {
    name: 'Social Media Marketing',
    description: 'Complete social media strategy, content creation, and community management',
    icon: 'trending',
    category: 'marketing',
    price: '$499/mo',
  },
  {
    name: 'Video Production',
    description: 'Professional video shooting, editing, and post-production services',
    icon: 'video',
    category: 'marketing',
    price: '$1,499',
  },
  {
    name: 'Ad Campaign Management',
    description: 'Google Ads, Facebook Ads, and Instagram advertising campaigns',
    icon: 'megaphone',
    category: 'marketing',
    price: '$799/mo',
  },
  {
    name: 'Website Design',
    description: 'Custom website design and development with modern frameworks',
    icon: 'code',
    category: 'web',
    price: '$2,999',
  },
  {
    name: 'Website Maintenance',
    description: 'Ongoing website updates, security patches, and performance optimization',
    icon: 'code',
    category: 'web',
    price: '$299/mo',
  },
  {
    name: 'Content Creation',
    description: 'Professional photography and graphic design for your brand',
    icon: 'camera',
    category: 'marketing',
    price: '$599',
  },
];