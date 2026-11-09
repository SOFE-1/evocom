import { useEffect } from 'react'

export function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title
    const tag = document.querySelector('meta[name="description"]')
    if (tag) {
      tag.setAttribute('content', description)
    }
  }, [title, description])

  return null
}
