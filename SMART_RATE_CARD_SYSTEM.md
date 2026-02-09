# Smart Rate Card System

## Overview

A flexible, table-based rate card system that allows media agencies to create dynamic rate cards similar to Notion tables, with built-in booking intelligence.

## Features

### For Media Agencies

1. **Create Rate Cards**
   - Add multiple sections (headings)
   - Insert one or more smart tables under each section
   - Define columns dynamically with different data types
   - Add/edit rows freely (like a spreadsheet)

2. **Column Types Supported**
   - Text
   - Number
   - Currency
   - Dropdown (with configurable options)
   - Boolean
   - Notes

3. **Column Configuration**
   - Name
   - Data type
   - Display order
   - Visibility on frontend
   - Required for booking flag

4. **Row Management**
   - Toggle bookability per row
   - Reorder rows
   - Edit cell values inline

### For Users

1. **View Rate Cards**
   - Clean, read-only display
   - Grouped by sections
   - Shows "Last updated" timestamp

2. **Book Services**
   - Book individual rows from tables
   - See clear price, unit, and description before booking
   - Validation ensures required fields are present
   - Booking creates a snapshot of row data (never changes)

## Database Schema

The system uses a flexible, normalized schema:

- `RateCard` - Top-level rate card
- `RateCardSection` - Sections/headings within a rate card
- `SmartTable` - Tables within sections
- `SmartTableColumn` - Column definitions with types and config
- `SmartTableRow` - Rows in tables
- `SmartTableCell` - Individual cell values
- `RateCardBookingItem` - Bookings with snapshot data

## API Routes

### Media Agency Routes (Authenticated)

- `GET /api/media-agency/rate-cards` - List all rate cards
- `POST /api/media-agency/rate-cards` - Create rate card
- `GET /api/media-agency/rate-cards/[id]` - Get rate card
- `PATCH /api/media-agency/rate-cards/[id]` - Update rate card
- `DELETE /api/media-agency/rate-cards/[id]` - Delete rate card
- `POST /api/media-agency/rate-cards/[id]/sections` - Add section
- `POST /api/media-agency/rate-cards/[id]/sections/[sectionId]/tables` - Add table
- `POST /api/media-agency/rate-cards/tables/[tableId]/columns` - Add column
- `PATCH /api/media-agency/rate-cards/tables/[tableId]/columns` - Update columns (reorder)
- `POST /api/media-agency/rate-cards/tables/[tableId]/rows` - Add row
- `PATCH /api/media-agency/rate-cards/tables/[tableId]/rows` - Update rows (reorder)
- `PUT /api/media-agency/rate-cards/tables/rows/[rowId]/cells` - Update cell values
- `POST /api/media-agency/rate-cards/bookings` - Create booking
- `GET /api/media-agency/rate-cards/bookings` - List bookings

### Public Routes

- `GET /api/rate-cards/[id]` - Get published rate card (public)

## Pages

### Media Agency Dashboard

- `/media-agency/smart-rate-card` - Rate card editor
  - Create/edit rate cards
  - Add sections and tables
  - Configure columns
  - Add/edit rows
  - Toggle publish status

### Public Pages

- `/rate-cards/[rateCardId]` - Public rate card display
  - View published rate cards
  - Book services from tables
  - See agency information

## Booking Logic

A row is bookable ONLY if:

1. `row.isBookable = true`
2. All columns marked `isRequiredForBooking = true` have valid values

When a user books a row:

1. System validates row is bookable
2. System validates all required fields have values
3. Creates a snapshot of the row data (stored in `snapshotData` JSON field)
4. Extracts price, unit, and description for quick reference
5. Creates booking with status `PENDING`

**Important**: Bookings never reference live rate card data - they use snapshots to ensure historical accuracy.

## Setup Instructions

1. **Run Migration**

   The database migration script is available at `scripts/apply-rate-card-migration.js`. Run it when your database connection is working:

   ```bash
   node scripts/apply-rate-card-migration.js
   ```

   Note: Due to TLS certificate issues with the Neon database, you may need to run this manually when the connection is stable.

2. **Access the Editor**

   Navigate to `/media-agency/smart-rate-card` in the media agency dashboard.

3. **Create Your First Rate Card**

   - Click "New Rate Card"
   - Enter a title and description
   - Add sections
   - Add tables to sections
   - Configure columns
   - Add rows with data
   - Publish when ready

4. **Share Rate Card**

   Once published, share the URL: `/rate-cards/[rateCardId]`

## Design Principles

1. **Flexibility First**: No hardcoded media-specific fields
2. **Snapshot-Based Bookings**: Historical accuracy guaranteed
3. **Notion-Like UX**: Familiar table editing experience
4. **Type Safety**: Column types ensure data consistency
5. **Extensible**: Easy to add new column types or features

## Future Enhancements

- Column reordering (drag & drop)
- Row reordering (drag & drop)
- Bulk row operations
- Column templates
- Rate card templates
- Export to PDF
- Version history
- Discounts and packages
- Campaign-based pricing
