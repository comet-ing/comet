import { prepareFrameHTMLResponse, prepareFrameMessage } from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
    const request = await req.json();
    const neynarApiKey = process.env.NEYNAR_ONCHAIN_KIT_API_KEY || "";
    const { isValid } = (await prepareFrameMessage({
        req: request,
        apiKey: neynarApiKey,
    })) as { isValid: boolean };

    if (!isValid) {
        return new NextResponse("Message not valid", { status: 500 });
    }

    return new NextResponse(prepareFrameHTMLResponse(request));
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
