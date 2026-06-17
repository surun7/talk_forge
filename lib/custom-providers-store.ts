import type { CustomProviderConfig } from "./providers";

let providers: CustomProviderConfig[] | null = null;

function load(): CustomProviderConfig[] {
  if (providers) return providers;

  const raw = process.env.CUSTOM_PROVIDERS_JSON;
  if (!raw) {
    providers = [];
    return providers;
  }
  try {
    const arr = JSON.parse(raw);
    providers = Array.isArray(arr) ? arr : [];
    console.log(`[custom-providers] Loaded ${providers.length} provider(s) from CUSTOM_PROVIDERS_JSON`);
  } catch (e) {
    console.error("[custom-providers] Failed to parse CUSTOM_PROVIDERS_JSON:", e instanceof Error ? e.message : e);
    providers = [];
  }
  return providers;
}

export function getCustomProvider(id: string): CustomProviderConfig | undefined {
  return load().find((cp) => cp.id === id);
}

export function getSafeProviderList(): { id: string; name: string; model: string }[] {
  return load().map((cp) => ({
    id: cp.id,
    name: cp.name,
    model: cp.model,
  }));
}
