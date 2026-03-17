import { NextResponse } from "next/server";

import { getServerSessionContext } from "@/src/lib/auth/session";

export async function GET() {
  const session = await getServerSessionContext();
  return NextResponse.json(session);
}
