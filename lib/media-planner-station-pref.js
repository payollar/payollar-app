/**
 * Resolve which published rate card to pre-select when arriving from
 * Browse media ("Buy") with ?listing= / ?agency= / ?rateCard=.
 */
export function resolvePreferredRateCard(rateCards, pref) {
  if (!Array.isArray(rateCards) || rateCards.length === 0 || !pref) return null;

  const rateCardId = String(pref.rateCardId || "").trim();
  const listingId = String(pref.listingId || "").trim();
  const agencyId = String(pref.agencyId || "").trim();
  const listingName = String(pref.listingName || "")
    .trim()
    .toLowerCase();

  if (rateCardId) {
    const byId = rateCards.find((card) => card.id === rateCardId);
    if (byId) return byId;
  }

  if (listingId) {
    const byListing = rateCards.find((card) => card.listingId === listingId);
    if (byListing) return byListing;
  }

  if (agencyId) {
    const agencyCards = rateCards.filter(
      (card) => card.agencyId === agencyId || card.agency?.id === agencyId
    );
    if (agencyCards.length === 1) return agencyCards[0];
    if (agencyCards.length > 1 && listingName) {
      const byName = agencyCards.find((card) => {
        const title = String(card.title || "").toLowerCase();
        return (
          title === listingName ||
          title.includes(listingName) ||
          listingName.includes(title)
        );
      });
      if (byName) return byName;
    }
    if (agencyCards.length > 0) return agencyCards[0];
  }

  if (listingName) {
    const byName = rateCards.find((card) => {
      const title = String(card.title || "").toLowerCase();
      return title === listingName || title.includes(listingName);
    });
    if (byName) return byName;
  }

  return null;
}

/** Read station preference from the current URL (client-only). */
export function readStationPrefFromSearch(search = "") {
  const params = new URLSearchParams(
    typeof search === "string" ? search.replace(/^\?/, "") : ""
  );
  return {
    rateCardId: params.get("rateCard") || "",
    listingId: params.get("listing") || "",
    agencyId: params.get("agency") || "",
    listingName: params.get("station") || "",
  };
}

export function hasStationPref(pref) {
  if (!pref) return false;
  return Boolean(
    pref.rateCardId || pref.listingId || pref.agencyId || pref.listingName
  );
}
