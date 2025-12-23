# Migrating Another Website to This Domain

This guide explains how to integrate your other website (HTML/CSS + Vue app in iframe) into this Next.js application.

## Recommended Approach: Create a Next.js Route

### Step 1: Copy Your Files to `public/`

Copy all your HTML, CSS, JavaScript, and other assets to a directory in `public/`:

```
public/
  other-site/          # Or whatever name you prefer
    index.html
    styles.css
    script.js
    assets/            # Any images, fonts, etc.
    vue-app/           # Your Vue app iframe content
```

### Step 2: Create a Next.js Route

For each HTML page, create a corresponding Next.js route:

#### Single Page Site

Create `src/app/other-site/page.tsx`:

```tsx
export default function OtherSitePage() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <iframe
        src="/other-site/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Other Site"
      />
    </div>
  );
}
```

#### Multiple Pages Site

For multiple pages, create separate routes:

- `src/app/other-site/page.tsx` → serves `/other-site/index.html`
- `src/app/other-site/about/page.tsx` → serves `/other-site/about.html`
- etc.

### Step 3: Update Asset Paths

Update all relative paths in your HTML/CSS/JS files:

- `./styles.css` → `/other-site/styles.css`
- `./assets/image.png` → `/other-site/assets/image.png`
- Vue app iframe src should point to: `/other-site/vue-app/index.html` (or wherever it is)

### Step 4: Alternative - Render HTML Directly

If you prefer not to use iframes, you can render the HTML content directly:

```tsx
import { readFileSync } from 'fs';
import { join } from 'path';

export default function OtherSitePage() {
  // Read HTML file
  const htmlContent = readFileSync(
    join(process.cwd(), 'public', 'other-site', 'index.html'),
    'utf-8'
  );

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
```

**Note**: This approach requires the page to be a Server Component (remove 'use client' if present).

## Alternative: Serve Files Directly from `public/`

You can also access files in `public/` directly via URL:

- `public/other-site/index.html` → `https://yourdomain.com/other-site/index.html`
- `public/other-site/styles.css` → `https://yourdomain.com/other-site/styles.css`

**Pros**: Simple, no code needed
**Cons**: Bypasses Next.js routing, harder to customize, less control over layout

## Routing Considerations

- Your current site is at `/` (root)
- Add your other site at a different path like `/other-site` or `/portfolio`
- Create a navigation component if you want links between sites
- Consider using Next.js layout files to share common elements

## Vue App in iframe

Since your Vue app is in an iframe, make sure:

1. The iframe src points to the correct path in `public/`
2. Any communication between parent and iframe uses `postMessage`
3. CORS is handled if the Vue app needs to make API calls

## Next Steps

1. Decide on the URL path for your other site (e.g., `/other-site`)
2. Copy your files to `public/[path]/`
3. Create the Next.js route(s) as shown above
4. Test locally with `npm run dev`
5. Update any internal links in your HTML files

