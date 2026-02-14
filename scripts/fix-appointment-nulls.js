/**
 * Script to fix NULL values in Appointment table before schema migration
 * This removes orphaned appointments that have NULL creatorId or clientId
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAppointmentNulls() {
  try {
    console.log('Checking for NULL values in Appointment table...');
    
    // Find appointments with NULL values
    const nullAppointments = await prisma.$queryRaw`
      SELECT id, "clientId", "creatorId", "createdAt", status
      FROM "Appointment"
      WHERE "clientId" IS NULL OR "creatorId" IS NULL
    `;
    
    if (nullAppointments.length === 0) {
      console.log('✅ No NULL values found. All appointments are valid.');
      return;
    }
    
    console.log(`Found ${nullAppointments.length} appointment(s) with NULL values:`);
    nullAppointments.forEach(apt => {
      console.log(`  - ID: ${apt.id}, clientId: ${apt.clientId}, creatorId: ${apt.creatorId}, Status: ${apt.status}, Created: ${apt.createdAt}`);
    });
    
    // Delete orphaned appointments
    const result = await prisma.$executeRaw`
      DELETE FROM "Appointment"
      WHERE "clientId" IS NULL OR "creatorId" IS NULL
    `;
    
    console.log(`\n✅ Deleted ${result} orphaned appointment(s).`);
    console.log('You can now run: npx prisma db push');
    
  } catch (error) {
    console.error('❌ Error fixing NULL values:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAppointmentNulls();
