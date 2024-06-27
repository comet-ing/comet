import {
    validateRequestMessage,
    getSubmitTextFrameMetadata,
} from "@jam/frames";
import { NextRequest, NextResponse } from "next/server";

async function getResponse(req: NextRequest): Promise<NextResponse> {
    const request = await req.json();
    const isValid = await validateRequestMessage(request);

    if (!isValid) {
        return new NextResponse("Message not valid", { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const cometId: string | null = searchParams.get("cometId");
    if (!cometId) {
        return new NextResponse("cometId is undefined", { status: 500 });
    }

    return new NextResponse(
        getSubmitTextFrameMetadata(process.env.WEB_APP_BASE_URL, cometId),
    );
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
