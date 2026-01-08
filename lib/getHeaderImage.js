/**
 * Get a random header image for a given pathname
 * This ensures each page gets a consistent image (not truly random per visit)
 */
export function getHeaderImage(pathname) {
  const images = ["/design.jpg", "/design2.jpg"]
  
  // Create a simple hash from the pathname to deterministically select an image
  let hash = 0
  for (let i = 0; i < pathname.length; i++) {
    const char = pathname.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use the hash to select an image (always positive index)
  const index = Math.abs(hash) % images.length
  return images[index]
}

