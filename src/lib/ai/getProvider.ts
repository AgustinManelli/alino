import { AI_CONFIG } from "./config";
import { AIProvider } from "./aiProvider";

export function getAIProvider(): AIProvider {
  switch (AI_CONFIG.provider) {
    case "openai": {
      const { OpenAIProvider } = require("./providers/openai");
      return new OpenAIProvider();
    }
    case "gemini": {
      const { GeminiProvider } = require("./providers/gemini");
      return new GeminiProvider();
    }
    default:
      throw new Error(`Proveedor de IA no soportado: ${AI_CONFIG.provider}`);
  }
}
