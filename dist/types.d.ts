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
export type DiscordOAuthResponseBuilderInput = {
    /**
     * The normalized user object built by this library.
     */
    user: DiscordUser;
    /**
     * The raw Discord user response from the `/users/@me` endpoint.
     */
    rawUser: DiscordUserResponse;
    /**
     * The full token response returned by Discord.
     */
    tokens: DiscordTokenResponse;
};
export type DiscordOAuthConfig = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    routePrefix?: string;
    scopes?: string[];
    onUserAuthenticated?: (user: DiscordUser, tokens: DiscordTokenResponse) => Promise<void> | void;
    /**
     * Optional function to customize the JSON returned from the callback route.
     *
     * If not provided, the default response is:
     * `{ user, access_token, token_type, expires_in }`
     */
    response?: (input: DiscordOAuthResponseBuilderInput) => Promise<unknown> | unknown;
};
