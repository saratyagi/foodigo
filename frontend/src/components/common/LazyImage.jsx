import { useState } from 'react'

const PLACEHOLDER = '/images/placeholder-food.svg'

export default function LazyImage({ src, alt, className, fallback = null }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

  if (!src) {
    return fallback ?? <img src={PLACEHOLDER} alt={alt} className={className} />
  }

  if (status === 'error') {
    return fallback ?? <img src={PLACEHOLDER} alt={alt} className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
      className={`${className} transition-opacity duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
    />
  )
}
