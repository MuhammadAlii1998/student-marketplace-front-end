export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
    university: string;
  };
  createdAt: string;
  isFavorite: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Calculus: Early Transcendentals 8th Edition',
    description:
      'Perfect condition calculus textbook. Used for one semester only. Includes all pages with minimal highlighting. Great for MATH 101-201 courses.',
    price: 45.0,
    originalPrice: 150.0,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=600&fit=crop',
    ],
    category: 'Books',
    condition: 'like-new',
    location: 'Campus Library',
    seller: {
      id: 's1',
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 4.8,
      reviews: 23,
      university: 'ESILV',
    },
    createdAt: '2024-01-15',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'MacBook Pro 13" 2021 - M1 Chip',
    description:
      'Selling my MacBook Pro in excellent condition. 256GB SSD, 8GB RAM. Includes original charger and box. Perfect for programming and design work.',
    price: 850.0,
    originalPrice: 1299.0,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
    ],
    category: 'Electronics',
    condition: 'good',
    location: 'Engineering Building',
    seller: {
      id: 's2',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5.0,
      reviews: 47,
      university: 'ESILV',
    },
    createdAt: '2024-01-20',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'IKEA KALLAX Shelf Unit - White',
    description:
      '4x4 KALLAX shelf unit in white. Great for organizing books, storage boxes, and decorations. Minor scratches on top, otherwise in great shape.',
    price: 35.0,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'],
    category: 'Furniture',
    condition: 'fair',
    location: 'Student Housing',
    seller: {
      id: 's3',
      name: 'Mike Brown',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      rating: 4.5,
      reviews: 12,
      university: 'ESILV',
    },
    createdAt: '2024-01-22',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'TI-84 Plus CE Graphing Calculator',
    description:
      'Essential for all math and science courses. Full color display, rechargeable battery. Includes charging cable and protective cover.',
    price: 75.0,
    originalPrice: 130.0,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop'],
    category: 'Electronics',
    condition: 'like-new',
    location: 'Math Building',
    seller: {
      id: 's4',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 4.9,
      reviews: 31,
      university: 'ESILV',
    },
    createdAt: '2024-01-25',
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Organic Chemistry Textbook + Study Guide',
    description:
      'Complete set including textbook and study guide with practice problems. Perfect for pre-med students.',
    price: 55.0,
    originalPrice: 220.0,
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop'],
    category: 'Books',
    condition: 'good',
    location: 'Science Center',
    seller: {
      id: 's5',
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 4.7,
      reviews: 19,
      university: 'ESILV',
    },
    createdAt: '2024-01-28',
    isFavorite: true,
  },
  {
    id: '6',
    title: 'Sony WH-1000XM4 Headphones',
    description:
      'Industry-leading noise cancellation headphones. Includes case, cable, and airplane adapter. Battery life is still excellent.',
    price: 180.0,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'],
    category: 'Electronics',
    condition: 'like-new',
    location: 'Student Center',
    seller: {
      id: 's6',
      name: 'Lisa Park',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      rating: 5.0,
      reviews: 56,
      university: 'ESILV',
    },
    createdAt: '2024-02-01',
    isFavorite: false,
  },
  {
    id: '7',
    title: 'Ergonomic Desk Chair - Black',
    description:
      'Comfortable desk chair with lumbar support, adjustable height, and armrests. Perfect for long study sessions.',
    price: 95.0,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop'],
    category: 'Furniture',
    condition: 'good',
    location: 'Off-Campus Housing',
    seller: {
      id: 's7',
      name: 'James Lee',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      rating: 4.6,
      reviews: 8,
      university: 'ESILV',
    },
    createdAt: '2024-02-05',
    isFavorite: false,
  },
  {
    id: '8',
    title: 'Nike Dunk Low - Size 10',
    description:
      'Worn twice, in excellent condition. Original box and extra laces included. Great for campus walking!',
    price: 85.0,
    originalPrice: 120.0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'],
    category: 'Clothing',
    condition: 'like-new',
    location: 'Campus Store',
    seller: {
      id: 's8',
      name: 'Chris Martin',
      avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop',
      rating: 4.8,
      reviews: 34,
      university: 'ESILV',
    },
    createdAt: '2024-02-10',
    isFavorite: false,
  },
];

export const categories = [
  { name: 'Books', slug: 'books', count: 245 },
  { name: 'Electronics', slug: 'electronics', count: 189 },
  { name: 'Furniture', slug: 'furniture', count: 87 },
  { name: 'Clothing', slug: 'clothing', count: 156 },
  { name: 'Sports', slug: 'sports', count: 63 },
  { name: 'Music', slug: 'music', count: 42 },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}
