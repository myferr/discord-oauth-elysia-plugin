import { Elysia } from "elysia";
import type {
  DiscordOAuthConfig,
  DiscordTokenResponse,
  DiscordUserResponse,
  DiscordUser,
} from "./types";

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
export function discordOAuth(config: DiscordOAuthConfig) {
  const {
    clientId,
    clientSecret,
    redirectUri,
    routePrefix = "/auth/discord",
    scopes = ["identify"],
    onUserAuthenticated,
  } = config;

  // Normalize route prefix (remove trailing slash, ensure leading slash)
  const normalizedPrefix = routePrefix.replace(/\/$/, "") || "/auth/discord";
  const authorizeRoute = normalizedPrefix;
  const callbackRoute = `${normalizedPrefix}/callback`;

  return new Elysia()
    .get(authorizeRoute, () => {
      if (!clientId || !redirectUri) {
        return new Response("Discord OAuth is not configured", { status: 500 });
      }

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: scopes.join(" "),
        prompt: "consent",
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://discord.com/api/oauth2/authorize?${params.toString()}`,
        },
      });
    })
    .get(
      callbackRoute,
      async ({ query }: { query: { code?: string; error?: string } }) => {
        // Handle OAuth errors
        if (query.error) {
          return new Response(JSON.stringify({ error: query.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const code = query.code;

        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Missing "code" query parameter' }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        if (!clientId || !clientSecret || !redirectUri) {
          return new Response(
            JSON.stringify({ error: "Discord OAuth is not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          // Exchange code for access token
          const tokenBody = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
          });

          const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: tokenBody.toString(),
          });

          if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error("Discord token exchange failed", errorText);
            return new Response(
              JSON.stringify({
                error: "Failed to exchange Discord OAuth token",
              }),
              {
                status: 502,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const tokenJson = (await tokenRes.json()) as DiscordTokenResponse;

          // Fetch user information
          const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: {
              Authorization: `${tokenJson.token_type} ${tokenJson.access_token}`,
            },
          });

          if (!userRes.ok) {
            const errorText = await userRes.text();
            console.error("Discord user fetch failed", errorText);
            return new Response(
              JSON.stringify({ error: "Failed to fetch Discord user" }),
              {
                status: 502,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const userJson = (await userRes.json()) as DiscordUserResponse;

          // Transform Discord user response to our user format
          const user: DiscordUser = {
            id: userJson.id,
            username: userJson.username,
            globalName: userJson.global_name ?? null,
            avatar: userJson.avatar ?? null,
            discriminator: userJson.discriminator,
            email: userJson.email ?? null,
            verified: userJson.verified,
            locale: userJson.locale,
          };

          // Call the user-provided callback if available
          if (onUserAuthenticated) {
            await onUserAuthenticated(user, tokenJson);
          }

          return new Response(
            JSON.stringify({
              user,
              access_token: tokenJson.access_token,
              token_type: tokenJson.token_type,
              expires_in: tokenJson.expires_in,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Discord OAuth error:", error);
          return new Response(
            JSON.stringify({
              error: "Internal server error during OAuth flow",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    );
}

// Re-export types for convenience
export type {
  DiscordOAuthConfig,
  DiscordTokenResponse,
  DiscordUserResponse,
  DiscordUser,
} from "./types";
