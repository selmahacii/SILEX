const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/web/node_modules/@prisma/client'));

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const match = envContent.match(/DIRECT_URL=["']([^"']+)["']/);
const url = match ? match[1] : null;

const prisma = new PrismaClient({ datasources: { db: { url } } });

async function run() {
  try {
    const prjs = await prisma.project.findMany();
    console.log('Projects on Neon:', prjs);
    const opps = await prisma.opportunity.findMany();
    console.log('Opps on Neon:', opps);
    const css = await prisma.costSheet.findMany();
    console.log('CostSheets on Neon:', css);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
