const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@decodethetech.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Super Admin',
      }
    });
    console.log(`Created default admin: ${adminEmail}`);
  } else {
    console.log(`Admin ${adminEmail} already exists. Skipping.`);
  }

  // Create a sample competition
  const existingCompetition = await prisma.competition.findFirst({
    where: { title: 'Sample Web Dev Challenge' }
  });

  if (!existingCompetition) {
    const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    if (!admin) return;

    const competition = await prisma.competition.create({
      data: {
        title: 'Sample Web Dev Challenge',
        description: 'Test your web development skills across multiple rounds!',
        rules: 'No googling during the test. 10 mins per round.',
        joinCode: 'WEBDEV',
        status: 'DRAFT',
        adminId: admin.id,
      }
    });

    const round1 = await prisma.round.create({
      data: {
        competitionId: competition.id,
        orderIndex: 0,
        title: 'Round 1: HTML & CSS Basics',
        description: 'Basic structure and styling questions.',
        timeLimitSeconds: 600,
      }
    });

    await prisma.question.createMany({
      data: [
        {
          roundId: round1.id,
          type: 'MCQ',
          text: 'What does HTML stand for?',
          options: JSON.stringify(['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Markup Language']),
          correctAnswer: JSON.stringify(['Hyper Text Markup Language']),
          marks: 10,
          orderIndex: 0
        },
        {
          roundId: round1.id,
          type: 'TRUE_FALSE',
          text: 'CSS stands for Cascading Style Sheets.',
          options: JSON.stringify(['True', 'False']),
          correctAnswer: JSON.stringify(['True']),
          marks: 5,
          orderIndex: 1
        }
      ]
    });

    console.log('Created sample competition: Sample Web Dev Challenge');
  } else {
    console.log('Sample competition already exists. Skipping.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
