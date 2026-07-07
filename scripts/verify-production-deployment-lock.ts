import { PrismaService } from '../backend/shared/prisma.service';
import { ProductionDeploymentLockService } from '../backend/shared/production-deployment-lock.service';

async function main() {
  const releaseVersion = process.env.RELEASE_VERSION;

  if (!releaseVersion) {
    console.error('NO-GO: RELEASE_VERSION is required.');
    process.exit(1);
  }

  const prisma = new PrismaService();
  await prisma.$connect();

  const service = new ProductionDeploymentLockService(prisma);

  try {
    const result = await service.validateReleaseCanDeploy(releaseVersion);
    console.log('GO: Production deployment lock validated.');
    console.log(JSON.stringify(result, null, 2));
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('NO-GO: Production deployment locked.');
    console.error(error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
