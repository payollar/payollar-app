/**
 * Script to apply mobile money migration manually
 * This can be run if Prisma migrate deploy is having issues
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('📋 Applying mobile money migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260208000000_add_mobile_money_fields/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('SQL to execute:');
    console.log('─'.repeat(50));
    console.log(migrationSQL);
    console.log('─'.repeat(50));
    console.log('');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 60)}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Success\n');
      }
    }
    
    console.log('🎉 Migration applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Restart your development server');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    
    // Check if columns already exist
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('\n⚠️  Columns may already exist. Checking...');
      try {
        const result = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'User' 
          AND column_name LIKE 'mobileMoney%'
        `;
        console.log('Existing mobile money columns:', result);
        console.log('\n✅ Columns already exist. Just run: npx prisma generate');
      } catch (checkError) {
        console.error('Could not check columns:', checkError.message);
      }
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
