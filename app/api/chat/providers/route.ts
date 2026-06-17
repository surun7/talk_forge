import { getAvailableProviders } from "@/lib/providers";
import { getSafeProviderList } from "@/lib/custom-providers-store";

export async function GET() {
  return Response.json({
    providers: getAvailableProviders(),
    customProviders: getSafeProviderList(),
  });
}
