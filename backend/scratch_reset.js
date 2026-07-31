const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

bcrypt.hash('Password123@', 10)
  .then(hash => prisma.user.update({ where: { email: 'rahul@abc.com' }, data: { passwordHash: hash } }))
  .then(() => console.log('Password reset successfully to Password123@'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
