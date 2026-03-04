# @geokit/sdk

Next.js middleware SDK for GeoKit geo-blocking.

## Installation

```bash
pnpm add @geokit/sdk
```

## Usage

```typescript
// middleware.ts
import { withGeoBlocking } from '@geokit/sdk'

export const middleware = withGeoBlocking({
  apiKey: process.env.GEOKIT_API_KEY!,
  denyCountries: ['CN', 'RU', 'KP'],
  redirectTo: '/geo-blocked',
})

export const config = { matcher: ['/((?!api|_next|favicon.ico).*)'] }
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Your GeoKit API key |
| `apiUrl` | `string` | `https://geokit.threestack.io` | GeoKit API base URL |
| `denyCountries` | `string[]` | `undefined` | ISO country codes to block |
| `allowCountries` | `string[]` | `undefined` | If set, only these countries are allowed |
| `redirectTo` | `string` | `undefined` | URL to redirect blocked users to |
| `blockResponse` | `{ status: number; body: string }` | `{ status: 403, body: '...' }` | Custom block response |

## Behavior

- **Fail open**: If the GeoKit API is unreachable, the request is allowed through
- **Headers**: Sets `x-geokit-country` header with the detected country code
- **Edge compatible**: Uses only native `fetch`, works in Next.js Edge Runtime
