import { GoogleIcon, GitHubIcon } from "@/components/oauth-icons";

export const SUPPORTED_OAUTH_PROVIDERS = ["google", "github"] as const;

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  {
    name: string;
    icon: typeof GoogleIcon | typeof GitHubIcon;
  }
> = {
  google: {
    name: "Google",
    icon: GoogleIcon,
  },
  github: {
    name: "GitHub",
    icon: GitHubIcon,
  },
};
