export type NominatimHit = {
  lat: string
  lon: string
  display_name: string
}

/** OpenStreetMap Nominatim search (no API key). */
export async function searchNominatim(query: string): Promise<NominatimHit[]> {
  const q = query.trim()
  if (!q) return []

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Không tìm được địa điểm')
  const data = (await res.json()) as NominatimHit[]
  return Array.isArray(data) ? data : []
}
