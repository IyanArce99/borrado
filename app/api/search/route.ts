import { searchSite } from "@/lib/api";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchSite(q.slice(0, 80));
  return Response.json({ results });
}
