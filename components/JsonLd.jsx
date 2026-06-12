// Renders schema.org JSON-LD for SEO/rich results.
// `data` is app-generated structured data (never user input). We still escape
// "<" to "<" so a stray "</script>" inside any string (e.g. a college name
// sourced from a PDF) cannot break out of the script element — the recommended
// safe way to embed JSON-LD in React.
export function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
