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

    console.log(getSubmitTextFrameMetadata(process.env.WEB_APP_BASE_URL));

    return new NextResponse(
        getSubmitTextFrameMetadata(process.env.WEB_APP_BASE_URL),
    );
}

export async function POST(req: NextRequest): Promise<Response> {
    return getResponse(req);
}

export const dynamic = "force-dynamic";
