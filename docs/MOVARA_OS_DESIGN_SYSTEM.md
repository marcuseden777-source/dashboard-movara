# Movara OS — Interface Design System

This document keeps the private operating system visually consistent with the public Movara Solutions website.

## Source identity

The OS inherits the public site's identity rather than creating a second "software" brand.

### Palette

- Studio ground: `#0f0e0d`
- Raised ground: `#171513`
- High raised ground: `#1f1c19`
- Primary ink / bone: `#efe9df`
- Organic cream: `#f3eee6`
- Ivory: `#fbf8f2`
- Sand accent: `#e2d3bd`
- Botanical burgundy / wine: `#4d1f28`
- Deep wine: `#3b1820`
- Muted smoke: `#a39b90`

Semantic statuses are intentionally muted and borrowed from the website's Seven Wonders accents:
- Success / matched: `#bcd8c7`
- Information: `#bcd3e4`
- Review / warning: `#e6c59b`
- Missing / attention: `#e4b7c3`
- Secondary violet: `#cdbfe6`

Do not introduce neon blue, electric purple, pure black, or generic SaaS-indigo as primary brand colours.

## Typography

The OS uses the same type system as movarasolutions.com.

- Interface / headings: Instrument Sans
- Editorial voice / large numbers / selected italic words: Instrument Serif
- Kicker labels / audit metadata / table headers: IBM Plex Mono

Headlines use the website's two-voice treatment:
- Sans for the structural phrase
- Italic Instrument Serif for the expressive phrase

Financial figures use lining/tabular numerals and may use Instrument Serif at display sizes.

## Shape language

- Main cards: 10px radius, matching the site's `--radius-card: 0.625rem`
- Pills, filters and compact actions: 999px radius
- Hairlines: warm bone at 14% opacity
- Avoid oversized 20–28px "SaaS bubble" radii unless the component is intentionally a sheet/modal.

## Surfaces

The OS is the "studio at night" translated into an operational interface.

- Base is warm near-black, never `#000`
- Raised panels use warm brown-black rather than blue-gray
- Glass is restrained and used mainly for navigation / floating chrome
- Sand is the signature light surface
- Wine is reserved for review / decision surfaces and high-attention states
- Large gradients are decorative only and should stay extremely low contrast

## Navigation

Desktop:
- Warm glass vertical rail
- Canonical Movara monogram
- "Movara Solutions" two-voice wordmark
- Mono section labels
- Active route indicated by a small sand dot, echoing the public site navigation

Mobile:
- Bottom glass navigation dock
- Horizontally scrollable
- Safe-area aware
- No permanently expanded desktop rail

## Finance module

Finance must visually communicate accounting state without looking like accounting software.

### Metric cards
- Small mono label
- Large serif financial figure
- Quiet supporting copy
- No excessive chart chrome

### Evidence states
- Matched = muted green
- Candidate / review = sand-gold
- Missing = muted rose
- Excluded = smoke

### Capital assets
Asset repayments remain visually distinct from operating spend.

### Finance Agent
The Agent is the signature sand card:
- Sand background
- Wine monogram
- Dark warm text
- Prompts as outline pills
- Never use a glowing purple AI orb

## Motion

Use the public site's motion character but reduce intensity for productivity:
- 160ms fast UI transitions
- 280ms standard transitions
- Expo easing for navigation / panel movement
- No continuous decorative animation inside data-heavy screens
- Honour reduced-motion preferences

## Product rule

Movara OS should feel like the private operational counterpart of movarasolutions.com:
same studio, same typography, same materials — denser, calmer and more functional.
