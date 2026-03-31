import { AI_CONFIG } from "./config";
import { AIProvider } from "./aiProvider";
import { GeminiProvider } from "./providers/gemini";
import { DeepseekProvider } from "./providers/deepseek";
import { OpenAIProvider } from "./providers/openai"; 

const PROVIDER_MAP: Record<string, new () => AIProvider> = {
  gemini: GeminiProvider,
  deepseek: DeepseekProvider,
  openai: OpenAIProvider,
};

let cachedProvider: AIProvider | null = null;
let currentProviderName: string | null = null;

export function getAIProvider(): AIProvider {
  const selectedProvider = AI_CONFIG.provider;

  if (cachedProvider && currentProviderName === selectedProvider) {
    return cachedProvider;
  }

  const ProviderClass = PROVIDER_MAP[selectedProvider];

  if (!ProviderClass) {
    throw new Error(
      `AI_ERROR: El proveedor "${selectedProvider}" no está implementado o no existe en el PROVIDER_MAP.`
    );
  }

  cachedProvider = new ProviderClass();
  currentProviderName = selectedProvider;
  
  return cachedProvider;
}