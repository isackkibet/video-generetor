module.exports = {
  apps: [
    {
      name: "admin-web",
      cwd: "./apps/admin_web",
      script: "npx",
      args: "next dev -p 3100",
    },
    {
      name: "api-gateway",
      script: "npx",
      args: "ts-node backend/api-gateway/src/main.ts",
    },
    {
      name: "trend-service",
      script: "npx",
      args: "ts-node backend/trend-service/src/main.ts",
    },
    {
      name: "script-service",
      script: "npx",
      args: "ts-node backend/script-service/src/main.ts",
    },
    {
      name: "render-service",
      script: "npx",
      args: "ts-node backend/render-service/src/main.ts",
    },
    {
      name: "moderation-service",
      script: "npx",
      args: "ts-node backend/moderation-service/src/main.ts",
    },
    {
      name: "recommendation-service",
      script: "npx",
      args: "ts-node backend/recommendation-service/src/main.ts",
    },
  ],
};
