import { useEffect, useRef } from 'react'

export function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef()
  const sentinelRef = useRef()

  useEffect(() => {
    if (!hasMore) return
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) callback()
    })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [callback, hasMore])

  return sentinelRef
}
