// src/components/SEO.jsx
export default function SEO({
  title = "Menty Tours — Sri Lanka Authentic & Tailor-Made Tours",
  description = "Discover Sri Lanka with private drivers, local guides, curated stays, Yala safaris, tea-country trains, and beach escapes.",
  canonical,
  ogImage
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}
