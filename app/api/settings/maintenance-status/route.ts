import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const setting = await prisma.setting.findUnique({ 
    where: { key: 'maintenanceMode' } 
  });
  return NextResponse.json({ isMaintenance: setting?.value === 'true' });
}