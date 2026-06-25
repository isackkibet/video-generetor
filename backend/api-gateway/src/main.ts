import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

// ✅ Load environment variables before using shared/env
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { env } from "../../shared/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
  });
  await app.listen(env.apiGatewayPort);
  console.log(`YohPal Live API Gateway running on port ${env.apiGatewayPort}`);
}
bootstrap();
