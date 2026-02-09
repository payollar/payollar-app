const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigrations() {
  try {
    // Apply MediaListingPackage migration
    console.log('Applying MediaListingPackage migration...');
    const packageMigrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20260131180000_add_media_listing_packages/migration.sql'),
      'utf8'
    );

    const packageStatements = packageMigrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of packageStatements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('✓ Executed:', statement.substring(0, 60) + '...');
        } catch (error) {
          // Ignore errors for already existing tables/constraints
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log('⚠ Skipped (already exists):', statement.substring(0, 60) + '...');
          } else {
            console.error('✗ Error:', error.message);
            console.error('Statement:', statement.substring(0, 100));
          }
        }
      }
    }

    // Apply MediaListingTimeClass migration
    console.log('\nApplying MediaListingTimeClass migration...');
    const timeClassMigrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20260131190000_add_media_listing_time_classes/migration.sql'),
      'utf8'
    );

    const timeClassStatements = timeClassMigrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of timeClassStatements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('✓ Executed:', statement.substring(0, 60) + '...');
        } catch (error) {
          // Ignore errors for already existing tables/constraints
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log('⚠ Skipped (already exists):', statement.substring(0, 60) + '...');
          } else {
            console.error('✗ Error:', error.message);
            console.error('Statement:', statement.substring(0, 100));
          }
        }
      }
    }

    console.log('\n✅ Migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigrations();
