# Party Guest Check-In

A lightweight check-in kiosk for events. Guests type their name on an iPad at the
entrance (or on their own phone via QR code), get a welcome message, and see their
family's table number.

Plain HTML, CSS and JavaScript (ES modules). No build step and no dependencies.

## Project structure

```
partyCheckIn/
├── index.html                    # Markup for every screen
├── data/
│   └── guests.json               # Event name, families, table numbers
└── assets/
    ├── css/
    │   ├── variables.css         # Colors, fonts, spacing (theme here)
    │   ├── base.css              # Reset and element defaults
    │   ├── layout.css            # Page structure
    │   └── components.css        # Cards, buttons, inputs, table badge
    └── js/
        ├── main.js               # Entry point: app flow and screen logic
        ├── config.js             # Timeouts and search settings
        ├── services/
        │   └── guestService.js   # Loads guest list, searches by name
        ├── ui/
        │   └── view.js           # All DOM rendering and event wiring
        └── utils/
            └── nameMatcher.js    # Name normalization and fuzzy matching
```

## Editing the guest list

Edit [data/guests.json](data/guests.json):

```json
{
  "event": { "name": "The Mattu", "accent": "Gala" },
  "families": [
    {
      "table": 1,
      "guests": ["Raj Sharma", "Priya Sharma"],
      "note": "Optional message shown on the welcome screen."
    }
  ]
}
```

- Each entry is one family: everyone listed in `guests` sits together, and when one
  of them checks in, the welcome screen lists the rest of the family too.
- `event.name` is shown in gold capitals; the optional `event.accent` is shown
  beneath it in script, like the invitation.
- `table` can be a number or text (e.g. `"VIP 1"`).
- `note` is optional.
- Guests are found by name. Matching ignores
  case, accents and punctuation, and accepts partial words (`"raj sh"` finds
  Raj Sharma). If several guests match, they pick themselves from a list.
- If no one matches, guests can open the full seating chart, which is built from
  this same file and grouped by table.

## Running locally

ES modules and `fetch` don't work from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000.

## Deploying

Any static host works — GitHub Pages, Netlify, Vercel or Cloudflare Pages. Upload the
folder as-is.

> The guest list is public to anyone with the URL, since it is served as a plain
> JSON file. Only include names and table numbers.

### QR code

Once deployed, generate a QR code for the site URL with any QR generator and print it
for the entrance or tables.

## iPad kiosk setup

1. Open the site in Safari, tap **Share → Add to Home Screen**, and launch it from
   the home screen icon for a full-screen view.
2. Turn on **Settings → Accessibility → Guided Access** and triple-click the side
   button to lock the iPad to the app.
3. Set **Settings → Display & Brightness → Auto-Lock** to **Never**, and keep the
   iPad plugged in.

The welcome screen resets itself after 15 seconds so it's ready for the next guest.
Timings are in [assets/js/config.js](assets/js/config.js).
