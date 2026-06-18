import type { CustomProviderConfig } from "./providers";

let providers: CustomProviderConfig[] | null = null;

// Allow runtime reload (called when dashboard saves API settings)
export function reloadProviders() {
  providers = null;
  load();
}

function load(): CustomProviderConfig[] {
  if (providers) return providers;

  // Priority 1: server-side env var
  const raw = process.env.CUSTOM_PROVIDERS_JSON;
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      providers = Array.isArray(arr) ? arr : [];
      console.log(`[custom-providers] Loaded ${providers.length} provider(s) from CUSTOM_PROVIDERS_JSON`);
      return providers;
    } catch (e) {
      console.error("[custom-providers] Failed to parse CUSTOM_PROVIDERS_JSON:", e instanceof Error ? e.message : e);
    }
  }

  // Priority 2: localStorage (set via dashboard API Settings)
  if (typeof window !== "undefined") {
    try {
      const ls = localStorage.getItem("talk_forge_api_custom");
      if (ls) {
        const arr = JSON.parse(ls);
        providers = Array.isArray(arr) ? arr : [];
        console.log(`[custom-providers] Loaded ${providers.length} provider(s) from localStorage`);
        return providers;
      }
    } catch (e) {
      console.error("[custom-providers] Failed to parse localStorage custom providers");
    }
  }

  providers = [];
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
