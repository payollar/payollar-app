# Media listing packages & rate card (optional)

The **Rate card** and media station pages support **packages** per listing and a **custom package section** for latest update details. To enable everything:

1. Ensure your database is reachable (e.g. Neon, local PostgreSQL).
2. Run:

   ```bash
   npx prisma migrate deploy
   ```

   This applies pending migrations, including:
   - **MediaListingPackage** – add/edit packages per listing.
   - **MediaListingTimeClass** – per-listing time classes and rates for the Custom Package Builder (e.g. Premium, M1–M4 with time ranges and rate per 30 sec).

After that, the rate-card page will load packages and the **Time classes & rates** section. Media agencies can define time classes per listing; those drive the Custom Package Builder on the public media pages.
“”
If **MediaListingPackage** or **MediaListingTimeClass** tables do not exist yet, the app still runs but package/time-class data is empty until you run the migration above.
