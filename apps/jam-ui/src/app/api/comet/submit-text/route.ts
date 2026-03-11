import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest): Promise<Response> {
    return NextResponse.json(
        { error: "Frames are not enabled" },
        { status: 501 },
    );
}

export const dynamic = "force-dynamic";
