# Other Site Route

This route serves your other website (HTML/CSS + Vue app in iframe).

## Setup Instructions

1. **Copy your files** to `public/other-site/`:
   ```
   public/
     other-site/
       index.html
       styles.css
       script.js
       vue-app/          # Your Vue app iframe content
       assets/           # Images, fonts, etc.
   ```

2. **Update paths** in your HTML/CSS files:
   - Change relative paths like `./styles.css` to `/other-site/styles.css`
   - Update iframe src in your HTML to point to `/other-site/vue-app/index.html`

3. **Test locally**:
   ```bash
   npm run dev
   ```
   Visit: http://localhost:3000/other-site

## Alternative: Render HTML Directly (No iframe)

If you prefer to render the HTML content directly instead of using an iframe, 
replace the content of `page.tsx` with:

```tsx
import { readFileSync } from 'fs';
import { join } from 'path';

export default function OtherSitePage() {
  const htmlContent = readFileSync(
    join(process.cwd(), 'public', 'other-site', 'index.html'),
    'utf-8'
  );

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
```

**Note**: This approach works better for simpler sites, but the iframe approach 
is recommended if you have a Vue app or complex JavaScript that might conflict 
with React/Next.js.

## Multiple Pages

If your site has multiple pages, create additional routes:

- `src/app/other-site/about/page.tsx` for `/other-site/about`
- `src/app/other-site/contact/page.tsx` for `/other-site/contact`
- etc.

Each route can point to different HTML files in `public/other-site/`.

