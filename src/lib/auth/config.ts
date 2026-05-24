export const AUTH_CONFIG = {
  redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  loginPath: "/login",
  dashboardPath: "/dashboard",
  defaultRole: "viewer" as const,
  sessionKey: "supabase-auth-token",
  maxSessionAge: 60 * 60 * 24 * 7, // 7 days
  passwordMinLength: 8,
  magicLinkEnabled: true,
  oAuthProviders: ["google", "microsoft"] as const,
} as const
