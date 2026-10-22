import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { type, productId } = await req.json();
    if ((type !== "view" && type !== "whatsapp") || typeof productId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const exists = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!exists) return NextResponse.json({ ok: false }, { status: 404 });
    await db.event.create({ data: { type, productId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
