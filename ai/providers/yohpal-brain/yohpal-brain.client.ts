import axios, { AxiosInstance } from "axios";
import { env } from "../../../backend/shared/env";

export class YohPalBrainClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.aiGatewayUrl,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        "X-YohPal-Service": "yohpal-live-ai-content-factory",
      },
    });
  }

  async post<TResponse>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<TResponse> {
    const response = await this.http.post<TResponse>(path, body);
    return response.data;
  }
}
