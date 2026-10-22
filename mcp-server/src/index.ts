/**
 * Foodigo MCP Server – Cloudflare Workers
 * Streamable HTTP transport (MCP spec 2025-06-18) at POST /mcp
 * No auth on /mcp – public endpoint, no 401, no WWW-Authenticate.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// ── Env ────────────────────────────────────────────────────────────────────

export interface Env {
  FOODIGO_API_URL: string;
}

// ── CORS ───────────────────────────────────────────────────────────────────

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, X-Requested-With, Cache-Control",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

// ── Minimal JSON-RPC types ─────────────────────────────────────────────────

interface JRpcMsg {
  jsonrpc: "2.0";
  method?: string;
  result?: unknown;
  error?: { code: number; message: string };
  params?: unknown;
  id?: string | number | null;
}

// ── Queued in-process transport (no Node.js deps) ──────────────────────────

class QueuedTransport {
  onmessage?: (msg: JRpcMsg) => void;
  onerror?: (err: Error) => void;
  onclose?: () => void;

  private _pending: JRpcMsg[] = [];
  private _waiters: Array<(m: JRpcMsg) => void> = [];

  async start() {}
  async close() { this.onclose?.(); }

  async send(msg: JRpcMsg) {
    if (this._waiters.length) this._waiters.shift()!(msg);
    else this._pending.push(msg);
  }

  nextResponse(): Promise<JRpcMsg> {
    if (this._pending.length) return Promise.resolve(this._pending.shift()!);
    return new Promise((res) => this._waiters.push(res));
  }

  deliver(msg: JRpcMsg) { this.onmessage?.(msg); }
}

// ── Foodigo API auth helper ────────────────────────────────────────────────

function apiHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// ── Build McpServer ────────────────────────────────────────────────────────

function buildServer(apiUrl: string): McpServer {
  const s = new McpServer({ name: "foodigo-mcp", version: "1.0.0" });

  s.tool(
    "search_restaurants",
    "List all Foodigo restaurants. Pass name_query to filter by name (case-insensitive).",
    { name_query: z.string().optional().describe("Partial restaurant name to filter") },
    async ({ name_query }) => {
      const res = await fetch(`${apiUrl}/restaurants/`);
      if (!res.ok) return err(`restaurants/ returned ${res.status}: ${await res.text()}`);
      let data = (await res.json()) as Record<string, unknown>[];
      if (name_query) {
        const q = name_query.toLowerCase();
        data = data.filter((r) => String(r.name ?? "").toLowerCase().includes(q));
      }
      return ok(data);
    }
  );

  s.tool(
    "get_restaurant_menu",
    "Get all available dishes for a restaurant.",
    { restaurant_id: z.number().int().positive().describe("Restaurant ID") },
    async ({ restaurant_id }) => {
      const res = await fetch(`${apiUrl}/foods/?restaurant=${restaurant_id}`);
      if (!res.ok) return err(`foods/ returned ${res.status}: ${await res.text()}`);
      return ok(await res.json());
    }
  );

  s.tool(
    "search_dishes",
    "Search dishes across all restaurants with optional filters.",
    {
      search: z.string().optional().describe("Text search on name/description"),
      veg: z.boolean().optional().describe("true=veg only, false=non-veg only"),
      sort: z.enum(["price_asc", "price_desc", "rating"]).optional().describe("Sort order"),
      diet: z.string().optional().describe("Comma-separated diet tags: vegan, jain, dairy-free, gluten-free, high-protein, low-cal, keto"),
      limit: z.number().int().positive().optional().describe("Max results"),
    },
    async ({ search, veg, sort, diet, limit }) => {
      const u = new URL(`${apiUrl}/foods/`);
      if (search) u.searchParams.set("search", search);
      if (veg !== undefined) u.searchParams.set("veg", String(veg));
      if (sort) u.searchParams.set("sort", sort);
      if (diet) u.searchParams.set("diet", diet);
      if (limit) u.searchParams.set("limit", String(limit));
      const res = await fetch(u.toString());
      if (!res.ok) return err(`foods/ returned ${res.status}: ${await res.text()}`);
      return ok(await res.json());
    }
  );

  s.tool(
    "get_dish_details",
    "Get full details (price, nutrition, diet tags, rating) for a single dish.",
    { food_id: z.number().int().positive().describe("Food/dish ID") },
    async ({ food_id }) => {
      const res = await fetch(`${apiUrl}/foods/${food_id}`);
      if (!res.ok) return err(`foods/${food_id} returned ${res.status}: ${await res.text()}`);
      return ok(await res.json());
    }
  );

  s.tool(
    "create_order",
    "Place a food order. Requires a JWT bearer token from the user's login session.",
    {
      bearer_token: z.string().describe("JWT from POST /auth/login"),
      address_id: z.number().int().positive().describe("Saved delivery address ID"),
      items: z.array(z.object({ food_id: z.number().int().positive(), quantity: z.number().int().min(1) })).min(1),
      payment_method: z.enum(["COD", "Card", "UPI"]).default("COD"),
      promo_code: z.string().optional(),
    },
    async ({ bearer_token, address_id, items, payment_method, promo_code }) => {
      const body: Record<string, unknown> = { address_id, items, payment_method };
      if (promo_code) body.promo_code = promo_code;
      const res = await fetch(`${apiUrl}/orders/`, {
        method: "POST",
        headers: apiHeaders(bearer_token),
        body: JSON.stringify(body),
      });
      if (!res.ok) return err(`orders/ returned ${res.status}: ${await res.text()}`);
      return ok(await res.json());
    }
  );

  s.tool(
    "get_order_status",
    "Retrieve an order's current status and details.",
    {
      bearer_token: z.string().describe("JWT from POST /auth/login"),
      order_id: z.number().int().positive().describe("Order ID"),
    },
    async ({ bearer_token, order_id }) => {
      const res = await fetch(`${apiUrl}/orders/${order_id}`, { headers: apiHeaders(bearer_token) });
      if (!res.ok) return err(`orders/${order_id} returned ${res.status}: ${await res.text()}`);
      return ok(await res.json());
    }
  );

  return s;
}

// ── Tool result helpers ────────────────────────────────────────────────────

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function err(msg: string) {
  return { isError: true, content: [{ type: "text" as const, text: msg }] };
}

// ── MCP dispatch: route one JSON-RPC message through a fresh server ────────

async function dispatch(apiUrl: string, msg: JRpcMsg): Promise<JRpcMsg | null> {
  const server = buildServer(apiUrl);
  const t = new QueuedTransport();
  await server.connect(t);

  const isInit = msg.method === "initialize";
  const isNotification = msg.id === undefined || msg.id === null;

  if (!isInit) {
    // Bootstrap the SDK to "ready" state with a synthetic handshake
    t.deliver({
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "cloudflare-proxy", version: "1.0.0" },
      },
      id: -1,
    });
    await t.nextResponse(); // discard synthetic init response
    t.deliver({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
    await Promise.resolve();
  }

  if (isNotification) {
    t.deliver(msg);
    return null;
  }

  t.deliver(msg);
  return await t.nextResponse();
}

// ── Response helpers ───────────────────────────────────────────────────────

function jsonResp(body: string, status = 200, extra: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}

function sseResp(body: string, extra: Record<string, string> = {}) {
  return new Response(body, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      ...extra,
    },
  });
}

function jrpcErr(id: string | number | null | undefined, code: number, message: string) {
  return JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

// ── Fetch handler ──────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";
    const method = request.method;

    // ── CORS preflight ────────────────────────────────────────────────────
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── Health ────────────────────────────────────────────────────────────
    if (pathname === "/health" && method === "GET") {
      return jsonResp(JSON.stringify({
        status: "ok",
        service: "foodigo-mcp",
        version: "1.0.0",
        backend: env.FOODIGO_API_URL,
        timestamp: new Date().toISOString(),
      }));
    }

    // ── MCP Streamable HTTP transport ─────────────────────────────────────
    if (pathname === "/mcp") {
      // GET /mcp – SSE stream for server-initiated messages (not needed; respond 405)
      if (method === "GET") {
        return new Response(null, {
          status: 405,
          headers: { ...CORS, Allow: "POST, OPTIONS" },
        });
      }

      if (method !== "POST") {
        return new Response(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
      }

      // Echo or generate a session ID
      const sessionId = request.headers.get("Mcp-Session-Id") ?? crypto.randomUUID();
      const sessionHeaders = { "Mcp-Session-Id": sessionId };

      // Determine response format from Accept header
      const accept = request.headers.get("Accept") ?? "";
      const preferSSE = accept.includes("text/event-stream");

      let rawBody: string;
      try {
        rawBody = await request.text();
      } catch {
        return jsonResp(jrpcErr(null, -32700, "Failed to read body"), 400);
      }

      // Handle batch (array) or single message
      let msgs: JRpcMsg[];
      try {
        const parsed = JSON.parse(rawBody);
        msgs = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return jsonResp(jrpcErr(null, -32700, "Parse error"), 400);
      }

      if (msgs.length === 0) {
        return jsonResp(jrpcErr(null, -32600, "Empty batch"), 400);
      }

      const apiUrl = env.FOODIGO_API_URL.replace(/\/$/, "");

      try {
        // Process all messages
        const results: JRpcMsg[] = [];
        for (const msg of msgs) {
          if (msg.jsonrpc !== "2.0" || !msg.method) {
            results.push({ jsonrpc: "2.0", id: msg.id ?? null, error: { code: -32600, message: "Invalid Request" } });
            continue;
          }
          const response = await dispatch(apiUrl, msg);
          if (response !== null) results.push(response);
        }

        // Notifications-only batch → 204
        if (results.length === 0) {
          return new Response(null, { status: 204, headers: { ...CORS, ...sessionHeaders } });
        }

        const payload = results.length === 1 ? results[0] : results;
        const jsonBody = JSON.stringify(payload);

        if (preferSSE) {
          // Streamable HTTP SSE format
          const sseBody = `data: ${jsonBody}\n\n`;
          return sseResp(sseBody, sessionHeaders);
        }

        return jsonResp(jsonBody, 200, sessionHeaders);
      } catch (e) {
        const msg = msgs[0];
        return jsonResp(
          jrpcErr(msg?.id, -32603, e instanceof Error ? e.message : "Internal error"),
          500,
          sessionHeaders
        );
      }
    }

    return jsonResp(JSON.stringify({ error: "Not found. Use GET /health or POST /mcp" }), 404);
  },
} satisfies ExportedHandler<Env>;
