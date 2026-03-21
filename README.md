# WeatherStar 4000+ (Fork)

A customizable fork of [WeatherStar 4000+](https://github.com/netbymatt/ws4kp) by [Matt Walsh](https://github.com/netbymatt), adding environment variable-driven branding, custom city lists, and Docker-first deployment.

## Acknowledgements

This project is a fork of the excellent [WeatherStar 4000+](https://github.com/netbymatt/ws4kp) created by **Matt Walsh** ([@netbymatt](https://github.com/netbymatt)). All credit for the core weather display engine, background graphics, display layouts, and the overall concept goes to Matt and the original contributors. This fork builds on their work by adding configuration and deployment features for self-hosted instances.

The original project is itself based on the work of [Mike Battaglia](https://github.com/vbguyny/ws4kp), who created the initial WeatherStar 4000 simulator.

Additional acknowledgements:
* [TWCClassics](https://twcclassics.com/) for [fonts](https://twcclassics.com/downloads.html), [icons](https://twcclassics.com/downloads.html), and reference materials
* Charles Abel, Nick Smith, and Malek Masoud for icon design
* The growing list of contributors to both the upstream and forked repositories

## About

This project brings back the feel of the 90s with a weather forecast that has the look and feel of The Weather Channel, powered by the [NOAA Weather API](https://www.weather.gov/documentation/services-web-api). For full details about the original project, displays, and features, see the [upstream README](https://github.com/netbymatt/ws4kp).

**This fork adds:**
* Custom app title, description, author, and branding via environment variables
* Custom logo override via `APP_LOGO_URL`
* Custom travel cities with auto-enrichment of NOAA grid point data
* Additional music support via volume mount (append without replacing defaults)
* Server-only Docker image (no static/nginx build)
* Dynamic `manifest.json` endpoint
* WSQS query string injection in production mode

> **Note:** This project only works with US locations via NOAA's Weather API. For international support, see [ws4kp-international](https://github.com/mwood77/ws4kp-international).

## Quick Start

### Docker (Recommended)

```bash
docker run -p 8080:8080 ghcr.io/shawnphoffman/ws4kp:latest
```

### Docker Compose

```yaml
services:
  ws4kp:
    image: ghcr.io/shawnphoffman/ws4kp:latest
    container_name: ws4kp
    restart: unless-stopped
    ports:
      - 8080:8080
    environment:
      TZ: America/Los_Angeles
      APP_TITLE: My Weather
      WSQS_latLonQuery: South Lake Tahoe, CA, USA
      WSQS_settings_wide_checkbox: "true"
```

### Local Development

```bash
git clone https://github.com/shawnphoffman/ws4kp.git
cd ws4kp
npm install
npm start
```

Open http://localhost:8080

## Configuration

All configuration is done via environment variables. See [`.env.example`](.env.example) for a fully documented reference.

### App Branding

| Variable | Description | Default |
|---|---|---|
| `APP_TITLE` | App title (browser tab, loading screen, manifest, meta tags) | `WeatherStar 4000+` |
| `APP_DESCRIPTION` | Meta description tag | Original description |
| `APP_AUTHOR` | Meta author tag | `Matt Walsh` |
| `APP_LOGO_URL` | Corner logo on all display screens (relative path or URL) | `images/logos/logo-corner.png` |
| `OG_IMAGE` | Open Graph preview image URL | Original image |
| `INFO_URL` | "More information" link URL | Upstream GitHub link |

### Custom Travel Cities

Override or extend the built-in travel city list with your own cities.

| Variable | Description | Default |
|---|---|---|
| `TRAVEL_CITIES_FILE` | Path to a JSON file of custom cities | _(none)_ |
| `TRAVEL_CITIES_MODE` | `append` (add to defaults) or `override` (replace defaults) | `append` |

The JSON file should be an array of objects:

```json
[
  {"Name": "Portland", "Latitude": 45.5152, "Longitude": -122.6784},
  {"Name": "Nashville", "Latitude": 36.1627, "Longitude": -86.7816}
]
```

NOAA grid point data (`wfo`, `x`, `y`) is automatically fetched at server startup for any cities that don't already have a `point` field.

In Docker, mount the file:

```yaml
volumes:
  - ./my-travel-cities.json:/app/data/travel-cities.json
environment:
  TRAVEL_CITIES_FILE: /app/data/travel-cities.json
  TRAVEL_CITIES_MODE: override
```

### WSQS — Query String Injection

`WSQS_*` environment variables inject URL query parameters on first page load via a 307 redirect. This controls display settings, enabled screens, location, and more.

**How it works:**
1. Strip the `WSQS_` prefix
2. Convert remaining underscores to hyphens
3. Append as URL query parameters

**Example:** `WSQS_settings_wide_checkbox=true` becomes `?settings-wide-checkbox=true`

**Tip:** Use the "Copy Permalink" feature in the app to generate a starting point, then convert each query param to a `WSQS_` env var (replace hyphens with underscores, add `WSQS_` prefix).

> **Important:** Use underscores only in env var names. Hyphens are silently ignored.

#### Location

| Variable | Effect |
|---|---|
| `WSQS_txtLocation` | Pre-fills the search box (does not auto-load) |
| `WSQS_latLonQuery` | Auto-loads weather data for a location |
| `WSQS_latLon` | Auto-loads by exact coordinates (e.g., `38.9416,-119.9772`) |

#### Display Toggles

| Variable | Default |
|---|---|
| `WSQS_hazards_checkbox` | `true` |
| `WSQS_current_weather_checkbox` | `true` |
| `WSQS_latest_observations_checkbox` | `true` |
| `WSQS_hourly_checkbox` | `false` |
| `WSQS_hourly_graph_checkbox` | `true` |
| `WSQS_travel_checkbox` | `false` |
| `WSQS_regional_forecast_checkbox` | `true` |
| `WSQS_local_forecast_checkbox` | `true` |
| `WSQS_extended_forecast_checkbox` | `true` |
| `WSQS_almanac_checkbox` | `true` |
| `WSQS_spc_outlook_checkbox` | `true` |
| `WSQS_radar_checkbox` | `true` |

#### Settings

| Variable | Description | Default |
|---|---|---|
| `WSQS_settings_wide_checkbox` | Widescreen mode (854x480) | `false` |
| `WSQS_settings_kiosk_checkbox` | Kiosk mode (hides controls, auto-plays) | `false` |
| `WSQS_settings_stickyKiosk_checkbox` | Persist kiosk mode across refreshes | `false` |
| `WSQS_settings_speed_select` | Carousel speed (0.5 = fast, 1.0 = normal, 2.0 = slow) | `1.00` |
| `WSQS_settings_units_select` | `us` (Fahrenheit) or `si` (Celsius) | `us` |
| `WSQS_settings_scanLines_checkbox` | CRT scanline overlay | `false` |
| `WSQS_settings_scanLineMode_select` | `auto`, `on`, or `off` | `auto` |
| `WSQS_settings_mediaVolume_select` | Music volume (0.00–1.00) | `0.75` |
| `WSQS_settings_customTextEnable_checkbox` | Custom scroll text | `false` |
| `WSQS_settings_customText_string` | Scroll text content | _(empty)_ |

## Music

The app includes 4 AI-generated background music tracks. Additional tracks are available in the companion repo [ws4kp-music](https://github.com/netbymatt/ws4kp-music).

### Adding Music (Docker)

**Option 1: Append** — Add tracks while keeping the built-in defaults:

```yaml
volumes:
  - /path/to/extra-music:/app/server/add-music
```

**Option 2: Replace** — Override the built-in tracks entirely:

```yaml
volumes:
  - /path/to/my-music:/app/server/music
```

Only `.mp3` files are supported. Subdirectories are not scanned. The playlist is randomized on each page load.

If neither mount contains `.mp3` files, the 4 built-in default tracks are used.

### Music Autoplay

The app is muted by default. Browsers restrict autoplay — see Chrome's [autoplay policy](https://developer.chrome.com/blog/autoplay/#media_engagement_index) for details. For kiosk setups, launch Chrome with `--autoplay-policy=no-user-gesture-required`.

## Background Images

Custom background images can be added via Docker volume mount:

```yaml
volumes:
  - /path/to/backgrounds:/app/server/images/backgrounds
```

Expected files: `1.png`, `1-wide.png`, `1-chart.png`, `2.png`, `3.png`, `4.png`, `4-wide.png`, `5.png`, `6.png`, `7.png`, `7-wide.png`

## Deployment

This fork uses a **server-only** Docker image (Node.js + Express with caching proxy). There is no static/nginx deployment.

### Docker Build

```bash
docker build -t ws4kp .
docker run -p 8080:8080 ws4kp
```

### Production Mode (without Docker)

```bash
npm run build
DIST=1 npm start
```

### Development Mode

```bash
npm start              # Individual JS files, easier debugging
STATIC=1 npm start     # Without proxy caching
```

## Settings

**Speed:** Playback speed multiplier — "Very Fast" (1.5x) to "Very Slow" (0.5x)

**Widescreen:** Stretches the background to 16:9 to avoid pillarboxing

**Kiosk:** Hides controls and scales to fill the viewport. Exit with `Ctrl-K` or page refresh. See the [upstream docs](https://github.com/netbymatt/ws4kp#kiosk-mode) for detailed kiosk setup instructions including iOS/Android PWA installation.

**Scan Lines:** Retro CRT scanline overlay effect

**Units:** US (Fahrenheit/mph) or SI (Celsius/km/h). Some NWS text products contain embedded units that are not converted.

## Sharing a Permalink

Click "Copy Permalink" near the bottom of the page to generate a URL with all your selected displays, location, and settings. See the [upstream docs](https://github.com/netbymatt/ws4kp#sharing-a-permalink-bookmarking) for details.

## Community Resources

* [Stream as FFMPEG](https://github.com/netbymatt/ws4kp/issues/37#issuecomment-2008491948)
* [Weather like it's 1999](https://blog.scottlabs.io/2024/02/weather-like-its-1999/) — Raspberry Pi + CRT complete setup
* [ws4channels](https://github.com/rice9797/ws4channels) — Stream into Channels DVR
* [SSL Certificates](https://github.com/netbymatt/ws4kp/issues/135)
* [Changing playlists](https://github.com/netbymatt/ws4kp/issues/138)
* [WeatherStar 3000+](https://github.com/netbymatt/ws3kp) — Even more retro

## Disclaimer

This web site should NOT be used in life threatening weather situations, or be relied on to inform the public of such situations. The Internet is an unreliable network subject to server and network outages and by nature is not suitable for such mission critical use. The authors of this web site shall not be held liable in the event of injury, death or property damage that occur as a result of disregarding this warning.

The WeatherSTAR 4000 unit and technology is owned by The Weather Channel. This web site is a free, non-profit work by fans. All background graphics were created from scratch. Icons by Charles Abel, Nick Smith, and Malek Masoud. Fonts by Nick Smith.
