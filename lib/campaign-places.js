/** Place label for a saved campaign. */
export function campaignPlaceLabel(campaign) {
  const city = campaign?.location?.trim();
  const country = campaign?.country?.trim();
  if (!city && !country) return "";
  if (!country || country === "Remote" || city === "Remote") {
    return city === "Remote" || country === "Remote" ? "Remote" : city || country;
  }
  if (!city) return country;
  return `${city}, ${country}`;
}

let placesPromise;

/** Full country list plus every city for a chosen country. Loaded once, on demand. */
export function loadPlaces() {
  if (!placesPromise) {
    placesPromise = import("country-state-city").then(({ Country, City }) => {
      const countries = Country.getAllCountries()
        .map((country) => ({ name: country.name, isoCode: country.isoCode }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return {
        countries,
        citiesFor(isoCode) {
          const cities = City.getCitiesOfCountry(isoCode) || [];
          const counts = new Map();
          for (const city of cities) {
            counts.set(city.name, (counts.get(city.name) || 0) + 1);
          }
          const labels = new Set();
          for (const city of cities) {
            const label =
              counts.get(city.name) > 1 && city.stateCode
                ? `${city.name}, ${city.stateCode}`
                : city.name;
            if (label && label !== "Nationwide") labels.add(label);
          }
          return ["Nationwide", ...[...labels].sort((a, b) => a.localeCompare(b))];
        },
      };
    });
  }
  return placesPromise;
}
