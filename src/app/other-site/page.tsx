/**
 * Route for serving your other website
 * 
 * Place your HTML/CSS/JS files in: public/other-site/
 * 
 * To customize:
 * 1. Change the iframe src to match your HTML file location
 * 2. Update the route path by renaming this directory
 * 3. Add additional routes for multiple pages
 */

export default function OtherSitePage() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/other-site/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Other Site"
        allow="camera; microphone; geolocation"
      />
    </div>
  );
}

