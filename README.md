# Discord OAuth2 Elysia Plugin

A simple and flexible Elysia plugin for implementing Discord OAuth2 authentication with customizable routes and database integration.

## Features

- Simple Discord OAuth2 implementation
- Customizable route prefixes
- Easy database integration via callbacks
- TypeScript support with full type definitions
- Zero dependencies (only peer dependency on Elysia)

## Installation

```bash
npm install discord-oauth-elysia-plugin # npm
yarn add discord-oauth-elysia-plugin # yarn
pnpm add discord-oauth-elysia-plugin # pnpm
bun add discord-oauth-elysia-plugin # bun
```

## Usage

### Basic Example

```typescript
import { Elysia } from "elysia";
import { discordOAuth } from "discord-oauth-elysia-plugin";

const app = new Elysia()
  .use(
    discordOAuth({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      redirectUri: "http://localhost:8080/auth/discord/callback",
    })
  )
  .listen(8080);
```

### Custom Route Prefix

```typescript
import { discordOAuth } from "discord-oauth-elysia-plugin";

const app = new Elysia().use(
  discordOAuth({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: "http://localhost:8080/oauth/discord/callback",
    routePrefix: "/oauth/discord", // Custom route prefix
  })
);
```

### With MongoDB Integration (using official driver)

```typescript
import { Elysia } from "elysia";
import { MongoClient } from "mongodb";
import { discordOAuth } from "discord-oauth-elysia-plugin";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("my-app");
const users = db.collection("users");

const app = new Elysia().use(
  discordOAuth({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: "http://localhost:8080/auth/discord/callback",
    routePrefix: "/auth/discord",
    onUserAuthenticated: async (user, tokens) => {
      await users.updateOne(
        { discordId: user.id },
        {
          $set: {
            discordId: user.id,
            username: user.username,
            globalName: user.globalName,
            avatar: user.avatar,
            email: user.email,
            verified: user.verified,
          },
        },
        { upsert: true }
      );
    },
  })
);
```

### Custom Scopes

```typescript
const app = new Elysia().use(
  discordOAuth({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: "http://localhost:8080/auth/discord/callback",
    scopes: ["identify", "email", "guilds"], // Custom scopes
  })
);
```

## Configuration Options

| Option                | Type       | Required | Default                               | Description                                                                                    |
| --------------------- | ---------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `clientId`            | `string`   | Yes      | -                                     | Your Discord application client ID                                                             |
| `clientSecret`        | `string`   | Yes      | -                                     | Your Discord application client secret                                                         |
| `redirectUri`         | `string`   | Yes      | -                                     | The redirect URI configured in your Discord application                                        |
| `routePrefix`         | `string`   | No       | `"/auth/discord"`                     | The route prefix for OAuth routes                                                              |
| `scopes`              | `string[]` | No       | `["identify"]`                        | Discord OAuth2 scopes to request                                                               |
| `onUserAuthenticated` | `function` | No       | -                                     | Callback function called after successful authentication                                       |
| `response`            | `function` | No       | returns `{ user, access_token, ... }` | Customize the JSON returned from the callback route; receives user, rawUser, and token details |

## Routes

The plugin creates two routes:

1. **Authorization Route**: `{routePrefix}` (default: `/auth/discord`)

   - Redirects users to Discord's OAuth2 authorization page

2. **Callback Route**: `{routePrefix}/callback` (default: `/auth/discord/callback`)
   - Handles the OAuth2 callback from Discord
   - Returns user information and access token

## Response Format

By default, the callback route returns a JSON response with the following structure:

```json
{
  "user": {
    "id": "123456789012345678",
    "username": "username",
    "globalName": "Display Name",
    "avatar": "avatar_hash",
    "discriminator": "0000",
    "email": "user@example.com",
    "verified": true,
    "locale": "en-US"
  },
  "access_token": "token_here",
  "token_type": "Bearer",
  "expires_in": 604800
}
```

You can override this completely using the `response` option:

```typescript
const app = new Elysia().use(
  discordOAuth({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: "http://localhost:8080/auth/discord/callback",
    response: ({ user, rawUser, tokens }) => ({
      id: user.id,
      username: user.username,
      accessToken: tokens.access_token,
      // add whatever else you need here
    }),
  })
);
```

## TypeScript Types

The plugin exports the following types:

- `DiscordOAuthConfig` - Configuration type for the plugin
- `DiscordUser` - User object type
- `DiscordTokenResponse` - Token response type
- `DiscordUserResponse` - Raw Discord API user response type

## License

MIT
