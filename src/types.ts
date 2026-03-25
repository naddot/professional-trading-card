export interface CardConfig {
  profile: {
    name: string;
    role: string;
    bio: string;
    image: string;
    /**
     * Controls how much of the image is visible in the top card photo.
     * - `imageObjectPosition` maps to CSS `object-position` (e.g. "50% 30%").
     * - `imageZoom` scales the image inside the crop container (1 = no zoom).
     * - `imageOffsetX/Y` translate the image after zoom, in percent of image size.
     */
    imageObjectPosition?: string;
    imageZoom?: number;
    imageOffsetX?: number;
    imageOffsetY?: number;
    // If set, this external URL takes precedence over `image` (which can be a local filename/path).
    imagePublicUrl?: string;
    logo: string;
    /**
     * Company logo size (in pixels) shown next to the name.
     * If unset, defaults to 24px.
     */
    logoSizePx?: number;
    // If set, this external URL takes precedence over `logo` (which can be a local filename/path).
    logoPublicUrl?: string;
    location: string;
    email: string;
    website: string;
    phone: string;
  };
  features: {
    showSocialLinks: boolean;
    showQrCode: boolean;
    showDownloadButton: boolean;
    showCompanyLogo: boolean;
    enableGyroscope: boolean;
    enableHolographicEffect: boolean;
  };
  socials: {
    linkedin: string;
    github: string;
  };
  theme: {
    accentColor: string;
    shimmerOpacity: number;
    shimmerHoverOpacity: number;
    cardRounding: string;
    pageBackground: {
      enabled: boolean;
      type: "mesh" | "dots";
      opacity: number;
    };
  };
  metadata: {
    cardType: string;
  };
}
