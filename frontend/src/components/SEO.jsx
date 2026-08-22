import { Helmet } from 'react-helmet-async'
import { homestay } from '../content/homestay'

/**
 * Reusable per-page SEO component. Every page should render this once with
 * a unique title and description — this is the core of on-page local SEO.
 */
export default function SEO({ title, description, canonicalPath = '' }) {
  const siteUrl = 'https://www.replace-this-with-your-domain.com' // replace with the real production domain
  const fullTitle = `${title} | ${homestay.name}`
  const canonicalUrl = `${siteUrl}${canonicalPath}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
    </Helmet>
  )
}
