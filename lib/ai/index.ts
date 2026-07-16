import type { AIProvider, ProviderName } from "./types";
import { falProvider } from "./fal";
import { localProvider } from "./local";
import { mockProvider } from "./mock";

export * from "./types";

const PROVIDERS: Record<ProviderName, AIProvider> = {
  fal: falProvider,
  local: localProvider,
  mock: mockProvider,
};

// Resolve which AI backend to use.
//   AI_PROVIDER=fal|local|mock   explicit choice
//   (unset)                      fal when FAL_KEY exists, otherwise mock
// `local` is refused in production and falls back to fal, so a stray local
// setting can never reach real users.
export function resolveProviderName(): ProviderName {
  const isProd = process.env.NODE_ENV === "production";
  const configured = process.env.AI_PROVIDER as ProviderName | undefined;

  let name: ProviderName =
    configured && configured in PROVIDERS
      ? configured
      : process.env.FAL_KEY
      ? "fal"
      : "mock";

  if (name === "local" && isProd) {
    console.error(
      "[ai] AI_PROVIDER=local is not allowed in production; falling back to fal."
    );
    name = "fal";
  }

  return name;
}

export function getProvider(): AIProvider {
  return PROVIDERS[resolveProviderName()];
}
