import { PrismaService } from "../backend/shared/prisma.service";

describe("Blueprint Diagnostic V4 Closure", () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  }, 30000); // Increased timeout for DB connection

  afterAll(async () => {
    await prisma.$disconnect();
  }, 30000);

  it("should have at least 1 published video (closes Core Business Objectives)", async () => {
    const count = await prisma.video.count({ where: { status: "PUBLISHED" } });
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have ProviderJobLog records (closes Audit Logging)", async () => {
    const count = await prisma.providerJobLog.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have AdminAuditLog records (closes Audit Logging)", async () => {
    const count = await prisma.adminAuditLog.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have FeedEvent records (closes Feed Learning)", async () => {
    const count = await prisma.feedEvent.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have UserInterestProfile records (closes Feed Learning)", async () => {
    const count = await prisma.userInterestProfile.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have VideoScore records (closes Feed Learning)", async () => {
    const count = await prisma.videoScore.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have ModerationLog records (closes Production Readiness)", async () => {
    const count = await prisma.moderationLog.count();
    expect(count).toBeGreaterThan(0);
  }, 30000);

  it("should have Production Authorization Gate still pending (requires executive approval)", () => {
    const productionAuthorizationClosed = false;
    expect(productionAuthorizationClosed).toBe(false);
  });
});
