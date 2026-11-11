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
    const forListing = rateCards.filter((card) => card.listingId === listingId);
    if (forListing.length === 1) return forListing[0];
    if (forListing.length > 1) {
      if (listingName) {
        const byListingName = forListing.find((card) => {
          const name = String(card.listing?.name || card.title || "").toLowerCase();
          return name === listingName || name.includes(listingName);
        });
        if (byListingName) return byListingName;
      }
      return forListing[0];
    }
  }

  if (agencyId) {
    const agencyCards = rateCards.filter(
      (card) => card.agencyId === agencyId || card.agency?.id === agencyId
    );
    const linkedAgency = agencyCards.filter((card) => card.listingId);
    const pool = linkedAgency.length > 0 ? linkedAgency : agencyCards;
    if (pool.length === 1) return pool[0];
    if (pool.length > 1 && listingName) {
      const byName = pool.find((card) => {
        const title = String(card.listing?.name || card.title || "").toLowerCase();
        return (
          title === listingName ||
          title.includes(listingName) ||
          listingName.includes(title)
        );
      });
      if (byName) return byName;
    }
    if (pool.length > 0) return pool[0];
  }

  if (listingName) {
    const byName = rateCards.find((card) => {
      const title = String(card.listing?.name || card.title || "").toLowerCase();
      return title === listingName || title.includes(listingName);
    });
    if (byName) return byName;
  }

  return null;
}

/**
 * Station picker options:
 * - From a listing Buy: only that listing's rate card(s)
 * - Open planner directly: only rate cards linked to a listing
 *   (standalone/orphan rate cards are not shown as stations)
 */
export function filterRateCardsForScheduler(rateCards, pref) {
  if (!Array.isArray(rateCards)) return [];

  if (hasStationPref(pref)) {
    const listingId = String(pref.listingId || "").trim();
    if (listingId) {
      const forListing = rateCards.filter((card) => card.listingId === listingId);
      if (forListing.length > 0) return forListing;
    }

    const match = resolvePreferredRateCard(rateCards, pref);
    if (match) return [match];

    const agencyId = String(pref.agencyId || "").trim();
    if (agencyId) {
      return rateCards.filter(
        (card) =>
          (card.agencyId === agencyId || card.agency?.id === agencyId) &&
          card.listingId
      );
    }
    return [];
  }

  const linked = rateCards.filter((card) => card.listingId);
  return linked.length > 0 ? linked : [];
}

export function stationDisplayName(card) {
  if (!card) return "Station";
  return card.listing?.name || card.title || "Station";
}

export function stationDisplayLocation(card) {
  if (!card) return "Nationwide";
  return card.listing?.location || card.location || "Nationwide";
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
