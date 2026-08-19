import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const AI_MODEL = "google/gemini-3.7-flash";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export function gatewayModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this workspace.");
  return createLovableAiGatewayProvider(key)(AI_MODEL);
}
