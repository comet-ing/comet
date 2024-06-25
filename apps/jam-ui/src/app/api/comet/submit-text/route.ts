import { validateRequestMessage, getStartCometHTMLResponse } from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
    const request = await req.json();
    const isValid = await validateRequestMessage(request);

    if (!isValid) {
        return new NextResponse("Message not valid", { status: 500 });
    }

    return NextResponse.json({ status: "success" });
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
