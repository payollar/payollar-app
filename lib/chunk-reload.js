export const CHUNK_RELOAD_KEY = "payollar:chunk-reload-at";

export function isChunkLoadError(error) {
  if (!error) return false;
  const name = String(error?.name || "");
  const message = String(error?.message || error || "");
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/** Returns true if a reload was triggered. */
export function reloadOnceForChunkError() {
  if (typeof window === "undefined") return false;

  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (last && Date.now() - last < 15_000) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // Can't persist the guard — avoid a possible reload loop.
    return false;
  }

  window.location.reload();
  return true;
}
