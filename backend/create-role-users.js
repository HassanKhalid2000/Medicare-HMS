const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createRoleUsers() {
  console.log('Creating role-based user accounts...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      email: 'admin@medicore.com',
      fullName: 'System Administrator', 
      role: 'admin',
      employeeId: 'ADMIN001'
    },
    {
      email: 'doctor@medicore.com',
      fullName: 'Dr. System Doctor',
      role: 'doctor', 
      employeeId: 'DOC999'
    },
    {
      email: 'nurse@medicore.com',
      fullName: 'System Nurse',
      role: 'nurse',
      employeeId: 'NUR999'
    },
    {
      email: 'receptionist@medicore.com',
      fullName: 'System Receptionist',
      role: 'receptionist',
      employeeId: 'REC999'
    }
  ];
  
  for (const userData of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          passwordHash: hashedPassword,
          phone: '+1000000000',
          department: 'System',
          status: 'active'
        }
      });
      console.log(`✅ Created/Updated: ${user.email}`);
    } catch (error) {
      console.log(`❌ Failed to create ${userData.email}:`, error.message);
    }
  }
  
  await prisma.$disconnect();
  console.log('Done!');
}

createRoleUsers().catch(console.error);
