import { useEffect } from 'react'

const SITE = 'https://mylovestruck.com'
const DEFAULT_IMAGE = `${SITE}/assets/Open-graph.png`

interface SeoInput {
  title: string
  description: string
  canonical?: string
  noindex?: boolean
  image?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Keeps the document head in sync with the active route.
 *
 * Googlebot and Bingbot render JS and read the post-render DOM, so this
 * genuinely affects organic search results. Social-link scrapers
 * (Facebook, WhatsApp, Twitter, LinkedIn, iMessage) do NOT run JS and will
 * always see the static tags in index.html — that is expected, and fine
 * here because ShareModal shares the origin rather than a deep link.
 */
export function useSeo({
  title,
  description,
  canonical,
  noindex = false,
  image = DEFAULT_IMAGE,
}: SeoInput) {
  useEffect(() => {
    document.title = title
    setMeta('name', 'description', description)

    const url = canonical ?? SITE + window.location.pathname

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:url', url)
    setMeta('name', 'twitter:image', image)

    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      // Must be removed, not left stale: navigating /results -> / would
      // otherwise leave a noindex on the homepage in the rendered DOM.
      document.head.querySelector('meta[name="robots"]')?.remove()
    }
  }, [title, description, canonical, noindex, image])
}
