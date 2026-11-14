/**
 * Safe environment readiness inspector.
 * Reports boolean readiness flags without exposing secret values to the client.
 */

export interface EnvironmentReadiness {
  mongodbConfigured: boolean;
  localCmsEnabled: boolean;
  adminAuthConfigured: boolean;
  cloudinaryConfigured: boolean;
  emailConfigured: boolean;
  heroVideoConfigured: boolean;
  visualizerUrl: string;
}

export function getEnvironmentReadiness(): EnvironmentReadiness {
  const mongodbConfigured = Boolean(
    process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0
  );

  const localCmsEnabled =
    process.env.LOCAL_CMS_ENABLED === "true" ||
    process.env.NODE_ENV !== "production";

  const adminAuthConfigured = Boolean(
    process.env.ADMIN_AUTH_SECRET &&
      process.env.ADMIN_AUTH_SECRET.trim().length >= 16 &&
      process.env.INITIAL_ADMIN_EMAIL &&
      process.env.INITIAL_ADMIN_PASSWORD
  );

  const cloudinaryConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  const emailConfigured = Boolean(
    (process.env.RESEND_API_KEY &&
      process.env.ENQUIRY_NOTIFICATION_TO_EMAIL) ||
      (process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.ENQUIRY_NOTIFICATION_TO_EMAIL)
  );

  const heroVideoConfigured = Boolean(
    process.env.NEXT_PUBLIC_HERO_VIDEO_URL &&
      process.env.NEXT_PUBLIC_HERO_VIDEO_URL.trim().length > 0
  );

  const visualizerUrl =
    process.env.NEXT_PUBLIC_WALL_VISUALIZER_URL?.trim() ||
    "http://localhost:3000/visualizer";

  return {
    mongodbConfigured,
    localCmsEnabled,
    adminAuthConfigured,
    cloudinaryConfigured,
    emailConfigured,
    heroVideoConfigured,
    visualizerUrl,
  };
}
