export interface VanityPage {
  // Basic Business Information
  businessInfo: {
    name: string;
    description?: string;
    tagline?: string;
    logo?: MediaAsset[];
    bannerUrl?: MediaAsset[];
  };

  // Branding & Theme Customization
  branding: {
    primaryColor: string;        // Main brand color (buttons, accents)
    secondaryColor: string;      // Secondary brand color
    accentColor: string;         // Accent color for highlights
    backgroundColor: string;     // Page background color
    textColor: string;          // Primary text color
    headingColor: string;       // Heading text color
    cardBackgroundColor: string; // Vehicle card background
    borderColor: string;        // Border colors for cards/sections
    
    // Typography
    fontFamily: string;         // Primary font family
    headingFontFamily?: string; // Optional separate heading font
    fontSize: 'small' | 'medium' | 'large';
    
    // Logo & Banner Settings
    logoPosition: 'left' | 'center' | 'right';
    bannerOverlayOpacity: number; // 0-1 for hero overlay darkness
    borderRadius: 'none' | 'small' | 'medium' | 'large'; // Card border radius
  };

  // Hero Section Customization
  heroSection: {
    enabled: boolean;
    backgroundType: 'image' | 'gradient' | 'solid';
    backgroundImage?: string;
    gradientColors?: [string, string]; // Start and end colors
    solidColor?: string;
    overlayEnabled: boolean;
    overlayOpacity: number; // 0-1
    
    // Content
    showLogo: boolean;
    showCompanyName: boolean;
    showTagline: boolean;
    customTagline?: string;
    
    // Call-to-Action Buttons
    primaryButtonText: string;
    secondaryButtonText: string;
    showSecondaryButton: boolean;
    buttonStyle: 'rounded' | 'square' | 'pill';
  };

  // Quick Info Bar Customization
  quickInfoBar: {
    enabled: boolean;
    backgroundColor?: string;
    textColor?: string;
    
    // Info Items (can be reordered/customized)
    items: QuickInfoItem[];
  };

  // Fleet Showcase Section
  fleetShowcase: {
    enabled: boolean;
    sectionTitle: string;
    sectionSubtitle: string;
    
    // Display Options
    cardsPerRow: 1 | 2 | 3 | 4;
    showAvailabilityBadges: boolean;
    showRatings: boolean;
    showDistance: boolean;
    showTransmissionType: boolean;
    showPricing: boolean;
    showBrandTags: boolean;
    
    // Card Styling
    cardStyle: 'modern' | 'classic' | 'minimal';
    imageAspectRatio: '16:9' | '4:3' | '1:1';
    
    // Placeholder Cards (when no vehicles)
    showPlaceholderCards: boolean;
    placeholderCategories: PlaceholderCategory[];
  };

  // Company Details Section
  companyDetails: {
    enabled: boolean;
    sectionTitle?: string;
    
    // About Section
    aboutSection: {
      enabled: boolean;
      title: string;
      customDescription?: string; // Override default description
      showFeaturesList: boolean;
      customFeatures?: string[]; // Override default features
    };
    
    // Business Hours
    businessHours: {
      enabled: boolean;
      title: string;
      schedule: BusinessHours;
      displayFormat: '12hour' | '24hour';
    };
    
    // Contact Information
    contactInfo: {
      enabled: boolean;
      title: string;
      showPhone: boolean;
      showEmail: boolean;
      showLiveChat: boolean;
      customContactMethods?: ContactMethod[];
    };
  };

  // Booking CTA Section
  bookingCTA: {
    enabled: boolean;
    backgroundColor?: string;
    textColor?: string;
    
    // Content
    title: string;
    subtitle: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    showSecondaryButton: boolean;
    
    // Styling
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundImage?: string;
    gradientColors?: [string, string];
  };

  // Component Visibility & Layout
  layout: {
    // Section Order (drag & drop reordering)
    sectionOrder: PageSection[];
    
    // Responsive Settings
    mobileLayout: 'stack' | 'grid';
    tabletLayout: 'stack' | 'grid';
    
    // Spacing
    sectionSpacing: 'tight' | 'normal' | 'loose';
    containerMaxWidth: number; // in pixels
  };

  // SEO & Meta Information
  seo: {
    pageTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string; // Open Graph image
  };

  // Advanced Customization
  advanced: {
    // Custom CSS
    customCSS?: string;
    
    // Analytics
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    
    // Integrations
    bookingSystemUrl?: string;
    liveChatWidget?: string;
    
    // Performance
    lazyLoadImages: boolean;
    optimizeImages: boolean;
  };

  // Vehicle-specific customization
  vehicles?: Vehicle[];
}

// Supporting Interfaces
export interface MediaAsset {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface QuickInfoItem {
  id: string;
  icon: string; // Emoji or icon class
  label: string;
  value: string;
  enabled: boolean;
  order: number;
}

export interface PlaceholderCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  startingPrice: string;
  enabled: boolean;
}

export interface BusinessHours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface ContactMethod {
  id: string;
  icon: string;
  label: string;
  value?: string; // Phone number, email, etc.
  enabled: boolean;
}

export type PageSection = 
  | 'hero'
  | 'quickInfo'
  | 'fleetShowcase'
  | 'companyDetails'
  | 'bookingCTA';

export interface Vehicle {
  id: string;
  available: boolean;
  photos: MediaAsset[];
  details: {
    make: string;
    model: string;
    year: number;
    category: string;
    transmission: 'Manual' | 'Automatic' | 'CVT';
    fuelType: string;
    seats: number;
    doors: number;
  };
  pricing: {
    dailyRate: number;
    currency: string;
    discountPercentage?: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  location?: {
    distance: string;
    unit: 'km' | 'miles';
  };
  features?: string[];
}

// Preset Themes for Quick Setup
export interface VanityPageTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // URL to preview image
  branding: VanityPage['branding'];
  heroSection: Partial<VanityPage['heroSection']>;
  layout: Partial<VanityPage['layout']>;
}

// Common preset themes
export const PRESET_THEMES: VanityPageTheme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean, professional look with blue accents',
    preview: '/assets/themes/modern-blue.jpg',
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      accentColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      headingColor: '#111827',
      cardBackgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      fontSize: 'medium',
      logoPosition: 'left',
      bannerOverlayOpacity: 0.4,
      borderRadius: 'medium'
    },
    heroSection: {
      backgroundType: 'gradient',
      gradientColors: ['#2563eb', '#1e40af'],
      overlayEnabled: true,
      overlayOpacity: 0.3,
      buttonStyle: 'rounded'
    },
    layout: {
      sectionSpacing: 'normal',
      containerMaxWidth: 1200
    }
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium look with gold accents for luxury brands',
    preview: '/assets/themes/luxury-gold.jpg',
    branding: {
      primaryColor: '#d97706',
      secondaryColor: '#92400e',
      accentColor: '#f59e0b',
      backgroundColor: '#fafaf9',
      textColor: '#1c1917',
      headingColor: '#0c0a09',
      cardBackgroundColor: '#ffffff',
      borderColor: '#e7e5e4',
      fontFamily: 'Playfair Display, serif',
      headingFontFamily: 'Playfair Display, serif',
      fontSize: 'large',
      logoPosition: 'center',
      bannerOverlayOpacity: 0.5,
      borderRadius: 'small'
    },
    heroSection: {
      backgroundType: 'image',
      overlayEnabled: true,
      overlayOpacity: 0.4,
      buttonStyle: 'square'
    },
    layout: {
      sectionSpacing: 'loose',
      containerMaxWidth: 1400
    }
  }
];