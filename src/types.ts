export type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type DiscordUserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
  email?: string | null;
  verified?: boolean;
  locale?: string;
};

export type DiscordUser = {
  id: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
  discriminator?: string;
  email?: string | null;
  verified?: boolean;
  locale?: string;
};

export type DiscordOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  routePrefix?: string;
  scopes?: string[];
  onUserAuthenticated?: (
    user: DiscordUser,
    tokens: DiscordTokenResponse
  ) => Promise<void> | void;
};
