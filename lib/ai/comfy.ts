// Minimal ComfyUI HTTP API client.
//
// ComfyUI has no SDK: you POST an API-format graph to /prompt, poll /history
// until the prompt reports done, then pull the produced bytes from /view. This
// mirrors the flow proven out in videofast/images/comfy_client.py.
//
// Dev-only by construction — the local provider that uses this is refused in
// production (see lib/ai/index.ts).

export interface ComfyNode {
  class_type: string;
  inputs: Record<string, unknown>;
}
export type ComfyGraph = Record<string, ComfyNode>;

// ComfyUI moves between ports depending on how it was launched (Desktop picks
// its own). Probe the usual suspects rather than pinning one.
const HOSTS = ["127.0.0.1"];
const PORTS = [8188, 8000, 8080, 8001];

let cachedBase: string | null = null;

async function ping(base: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}/system_stats`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Resolve a reachable ComfyUI base URL. COMFY_URL short-circuits the probe.
export async function findComfy(): Promise<string> {
  const configured = process.env.COMFY_URL?.replace(/\/$/, "");
  if (configured) {
    if (await ping(configured)) return configured;
    throw new Error(
      `COMFY_URL is set to ${configured} but nothing answered there. Is ComfyUI running?`
    );
  }

  if (cachedBase && (await ping(cachedBase))) return cachedBase;
  cachedBase = null;

  for (const host of HOSTS) {
    for (const port of PORTS) {
      const base = `http://${host}:${port}`;
      if (await ping(base)) {
        cachedBase = base;
        return base;
      }
    }
  }

  throw new Error(
    `Could not find a running ComfyUI on ${PORTS.join(", ")}. Start ComfyUI, or set COMFY_URL to its address.`
  );
}

// Push bytes into ComfyUI's input dir so a LoadImage node can reference them.
// Returns the name to hand to LoadImage (subfolder-qualified when ComfyUI
// chooses one).
export async function uploadImageToComfy(
  base: string,
  filename: string,
  bytes: Uint8Array,
  contentType: string
): Promise<string> {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);

  const form = new FormData();
  form.append("image", new Blob([ab], { type: contentType }), filename);
  form.append("overwrite", "true");

  const res = await fetch(`${base}/upload/image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ComfyUI upload failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const stored: string = data?.name ?? filename;
  const subfolder: string = data?.subfolder ?? "";
  return subfolder ? `${subfolder}/${stored}` : stored;
}

interface OutputRef {
  filename: string;
  subfolder?: string;
  type?: string;
}

// ComfyUI reports produced files under different keys depending on the node
// (SaveImage -> images, SaveAudioMP3 -> audio). Take the first of either.
function firstOutput(outputs: Record<string, unknown>): OutputRef | null {
  for (const node of Object.values(outputs)) {
    const bag = node as Record<string, OutputRef[] | undefined>;
    for (const key of ["images", "audio", "gifs"]) {
      const hit = bag[key]?.[0];
      if (hit?.filename) return hit;
    }
  }
  return null;
}

function executionError(status: Record<string, unknown>): string {
  const messages = (status?.messages as unknown[]) ?? [];
  for (const m of messages) {
    if (Array.isArray(m) && m[0] === "execution_error") {
      const info = m[1] as Record<string, unknown> | undefined;
      const node = info?.node_type ?? "unknown node";
      const msg = info?.exception_message ?? "no message";
      return `${node}: ${msg}`;
    }
  }
  return JSON.stringify(status).slice(0, 400);
}

// Queue a graph, wait for it to finish, and return the first output's bytes.
export async function runGraph(
  graph: ComfyGraph,
  { timeoutMs = 600_000 }: { timeoutMs?: number } = {}
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const base = await findComfy();

  const queued = await fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: graph }),
  });
  // A 400 here is a graph/validation problem (missing model file, bad node
  // input). Surface ComfyUI's own explanation — it is far more useful than
  // "Bad Request".
  if (!queued.ok) {
    throw new Error(
      `ComfyUI rejected the workflow (${queued.status}): ${(await queued.text()).slice(0, 600)}`
    );
  }
  const promptId: string = (await queued.json()).prompt_id;

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const res = await fetch(`${base}/history/${promptId}`);
    if (res.ok) {
      const history = await res.json();
      const entry = history?.[promptId];
      if (entry) {
        const status = entry.status ?? {};
        if (status.status_str === "error") {
          throw new Error(`ComfyUI execution error — ${executionError(status)}`);
        }
        const out = firstOutput(entry.outputs ?? {});
        if (out) {
          const query = new URLSearchParams({
            filename: out.filename,
            subfolder: out.subfolder ?? "",
            type: out.type ?? "output",
          });
          const file = await fetch(`${base}/view?${query}`);
          if (!file.ok) {
            throw new Error(`ComfyUI /view failed: ${file.status}`);
          }
          return {
            bytes: new Uint8Array(await file.arrayBuffer()),
            contentType:
              file.headers.get("content-type") ?? "application/octet-stream",
          };
        }
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(
    `ComfyUI did not finish within ${Math.round(timeoutMs / 1000)}s.`
  );
}
