import { CardConfig } from './types';

export const DEFAULT_CONFIG: CardConfig = {
  // Personal Information
  profile: {
    name: "Daniel Todd",
    role: "AI and Insights",
    bio: "wobble wobble shiny text",
    image: "https://storage.googleapis.com/professional-trading-card-assets/daniel-todd/shared_image.jpg",
    // Image crop controls for the top photo (optional).
    // object-position: where the visible window is centered.
    imageObjectPosition: "50% 50%",
    // Zoom inside the crop window (1 = original size)
    imageZoom: 1,
    // Offset after zoom (percent of the image size)
    imageOffsetX: 0,
    imageOffsetY: 0,
    logo: "https://storage.googleapis.com/professional-trading-card-assets/daniel-todd/michelin_man.png", // URL to company logo
    // Company logo size (px) next to the name.
    logoSizePx: 24,
    location: "1 Tanfield, Edinburgh",
    email: "daniel.todd@blackcircles.com",
    website: "https://www.blackcircles.com/",
    phone: "+447472525655", // International format for WhatsApp
  },

  // Feature Toggles
  features: {
    showSocialLinks: true,
    showQrCode: true,
    showDownloadButton: true,
    showCompanyLogo: true,
    enableGyroscope: true,
    enableHolographicEffect: true,
  },

  // Social Links
  socials: {
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },

  // Visual Customization
  theme: {
    accentColor: "indigo", // Tailwind color name
    shimmerOpacity: 0.4,
    shimmerHoverOpacity: 0.6,
    cardRounding: "2rem",
    pageBackground: {
      enabled: true,
      type: "mesh", // "mesh" | "dots"
      opacity: 0.15,
    }
  },

  // Metadata
  metadata: {
    cardType: "Digital Blackcircles Buisness Card",
  }
};
