import { Elysia } from "elysia";
import type { DiscordOAuthConfig } from "./types";
/**
 * Creates an Elysia plugin for Discord OAuth2 authentication
 *
 * @param config - Configuration object for Discord OAuth2
 * @returns Elysia instance with Discord OAuth2 routes
 *
 * @example
 * ```ts
 * import { discordOAuth } from "discord-oauth-elysia-plugin";
 *
 * const app = new Elysia()
 *   .use(discordOAuth({
 *     clientId: process.env.DISCORD_CLIENT_ID!,
 *     clientSecret: process.env.DISCORD_CLIENT_SECRET!,
 *     redirectUri: "http://localhost:8080/auth/discord/callback",
 *     routePrefix: "/auth/discord",
 *     onUserAuthenticated: async (user, tokens) => {
 *       // Save user to MongoDB or other database
 *       await usersCollection.updateOne(
 *         { discordId: user.id },
 *         { $set: user },
 *         { upsert: true }
 *       );
 *     },
 *   }));
 * ```
 */
export declare function discordOAuth(config: DiscordOAuthConfig): Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    [x: string]: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: import("undici-types").Response;
            };
        };
    };
} & {
    [x: string]: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: import("undici-types").Response;
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
export type { DiscordOAuthConfig, DiscordTokenResponse, DiscordUserResponse, DiscordUser, } from "./types";
