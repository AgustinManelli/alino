import { AI_CONFIG } from "./config";
import { AIProvider } from "./aiProvider";
import { GeminiProvider } from "./providers/gemini";
import { DeepseekProvider } from "./providers/deepseek";
import { OpenAIProvider } from "./providers/openai"; 

/**
 * Mapeo de constructores de proveedores.
 * Esto permite que TypeScript verifique que todas las clases 
 * implementen correctamente la interfaz AIProvider.
 */
const PROVIDER_MAP: Record<string, new () => AIProvider> = {
  gemini: GeminiProvider,
  deepseek: DeepseekProvider,
  openai: OpenAIProvider,
};

// Cache para el patrón Singleton
let cachedProvider: AIProvider | null = null;
let currentProviderName: string | null = null;

/**
 * Retorna la instancia del proveedor de IA configurado.
 * Implementa un patrón Singleton para reutilizar la misma instancia.
 */
export function getAIProvider(): AIProvider {
  const selectedProvider = AI_CONFIG.provider;

  // Si ya tenemos una instancia y el proveedor no ha cambiado, la devolvemos
  if (cachedProvider && currentProviderName === selectedProvider) {
    return cachedProvider;
  }

  const ProviderClass = PROVIDER_MAP[selectedProvider];

  if (!ProviderClass) {
    throw new Error(
      `AI_ERROR: El proveedor "${selectedProvider}" no está implementado o no existe en el PROVIDER_MAP.`
    );
  }

  // Creamos la instancia, la guardamos en caché y la devolvemos
  cachedProvider = new ProviderClass();
  currentProviderName = selectedProvider;
  
  return cachedProvider;
}