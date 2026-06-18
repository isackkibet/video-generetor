import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function seedCreators() {
  const creator = await prisma.creator.upsert({
    where: { username: "yohpal_ai_studio" },
    update: {},
    create: {
      username: "yohpal_ai_studio",
      displayName: "YohPal AI Studio",
      bio: "Official AI seed content studio for YohPal Live.",
      trustScore: 95,
      followers: 0,
      engagementRate: 0,
      isAiCreator: true,
    },
  });
  await prisma.creatorTwin.upsert({
    where: { creatorId: creator.id },
    update: {
      tone: "smart, energetic, African, youth-friendly, safe, optimistic",
    },
    create: {
      creatorId: creator.id,
      tone: "smart, energetic, African, youth-friendly, safe, optimistic",
      styleProfile: {
        pacing: "fast",
        format: "short_video",
        visualStyle: "bright",
        subtitleStyle: "bold",
        defaultDurationSeconds: 45,
      },
      audienceProfile: {
        primary: "African youth",
        secondary: [
          "students",
          "job seekers",
          "creators",
          "small business owners",
        ],
        regions: ["Kenya", "East Africa", "Africa"],
      },
      preferredTopics: [
        "career",
        "comedy",
        "motivation",
        "technology",
        "business",
        "campus",
        "skills",
      ],
      knowledgeGraph: {
        linkedYohPalModules: [
          "YohPal Jobs",
          "YohPal Hustle",
          "YohPal Market",
          "ICS Technical College",
          "Smart Lecturer",
          "AI E-Library",
        ],
      },
    },
  });
  return creator;
}
async function seedAvatars() {
  await prisma.avatar.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "YohPal News Anchor",
        category: "news",
        gender: "female",
        ageGroup: "young_adult",
        voiceId: "ke-female-news-001",
        language: "en",
        region: "Kenya",
        modelUrl: "mock://avatars/yohpal-news-anchor",
      },
      {
        name: "YohPal Campus Guy",
        category: "campus",
        gender: "male",
        ageGroup: "young_adult",
        voiceId: "ke-male-campus-001",
        language: "en",
        region: "Kenya",
        modelUrl: "mock://avatars/yohpal-campus-guy",
      },
      {
        name: "YohPal Business Coach",
        category: "business",
        gender: "male",
        ageGroup: "adult",
        voiceId: "ke-male-business-001",
        language: "en",
        region: "Kenya",
        modelUrl: "mock://avatars/yohpal-business-coach",
      },
      {
        name: "YohPal Motivation Voice",
        category: "motivation",
        gender: "female",
        ageGroup: "adult",
        voiceId: "ke-female-motivation-001",
        language: "en",
        region: "Kenya",
        modelUrl: "mock://avatars/yohpal-motivation-voice",
      },
    ],
  });
}
async function seedTrends() {
  await prisma.trend.createMany({
    data: [
      {
        topic: "Top AI jobs students should learn in 2026",
        category: "career",
        region: "Nairobi",
        country: "Kenya",
        score: 92,
        growthRate: 18,
        source: "internal_seed",
        metadata: {
          audience: "students",
          format: "educational_short",
        },
      },
      {
        topic: "Funny Nairobi traffic survival tips",
        category: "comedy",
        region: "Nairobi",
        country: "Kenya",
        score: 88,
        growthRate: 12,
        source: "internal_seed",
        metadata: {
          audience: "urban_youth",
          format: "comedy_short",
        },
      },
      {
        topic: "How to start a small business with limited capital",
        category: "business",
        region: "Kenya",
        country: "Kenya",
        score: 86,
        growthRate: 10,
        source: "internal_seed",
        metadata: {
          audience: "hustlers",
          format: "business_tip",
        },
      },
      {
        topic: "One skill every campus student should master",
        category: "campus",
        region: "Kenya",
        country: "Kenya",
        score: 84,
        growthRate: 9,
        source: "internal_seed",
        metadata: {
          audience: "campus_students",
          format: "student_tip",
        },
      },
    ],
  });
}
async function seedAdCampaigns() {
  await prisma.adCampaign.createMany({
    data: [
      {
        advertiser: "YohPal Jobs",
        title: "Promote AI-ready career opportunities",
        budget: 50000,
        targeting: {
          country: "Kenya",
          interests: ["jobs", "career", "skills"],
          ageRange: [18, 35],
        },
        status: "ACTIVE",
      },
      {
        advertiser: "ICS Technical College",
        title: "Promote AI and digital skills courses",
        budget: 75000,
        targeting: {
          country: "Kenya",
          interests: ["education", "career", "technology"],
          ageRange: [16, 40],
        },
        status: "ACTIVE",
      },
    ],
  });
}
async function main() {
  console.log("Starting YohPal Live AI Content Factory seed...");
  const creator = await seedCreators();
  await seedAvatars();
  await seedTrends();
  await seedAdCampaigns();
  console.log("Seed complete.");
  console.log(`Default AI creator: ${creator.username}`);
}
main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
