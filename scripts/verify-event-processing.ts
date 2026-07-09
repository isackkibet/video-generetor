import { PrismaService } from '../backend/shared/prisma.service';
import { EventProcessingValidator } from '../backend/launch-validation/event-processing-validator';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const result = await new EventProcessingValidator(prisma).validate();
  console.log(JSON.stringify(result, null, 2));

  await prisma.$disconnect();

  if (!result.passed) process.exit(1);
}

main();
