import { Hex, hexToString } from "viem";
import { inspectUrl } from "../../utils/rollups.inspect";
import { InspectResponseBody, Report } from "../../utils/rollups.types";
import { Jam, JamListFilter, JamLite, JamStats } from "./types";

const safeHexToString = (hex: Hex | undefined): string => {
    if (!hex) return "Unknown error";
    try {
        return hexToString(hex);
    } catch {
        return "Failed to decode error message";
    }
};

const parseReport = <T>(report: Report, defaultValue: any): T => {
    if (report && report.payload) {
        try {
            return JSON.parse(hexToString(report.payload)) as T;
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    return defaultValue;
};

const createError = (message: string) => Promise.reject(new Error(message));

const action = {
    all: "alljams",
    closed: "closedjams",
    open: "openjams",
} as const;

export const fetchJams = async (filter: JamListFilter = "all") => {
    const payload = action[filter];
    const payloadBlob = new TextEncoder().encode(payload);

    const response = await fetch(inspectUrl, {
        method: 'POST',
        body: payloadBlob, 
    });

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception") {
        let errorMsg = "Unknown exception";
        if (data.exception_payload) {
            errorMsg = safeHexToString(data.exception_payload);
        } else if (data.reports && data.reports.length > 0 && data.reports[0]?.payload) {
            errorMsg = safeHexToString(data.reports[0].payload);
        }
        return createError(errorMsg);
    }

    if (!data.reports || data.reports.length === 0) {
        return createError("No reports returned from jams inspect");
    }

    const report = data.reports[0];
    if (!report || !report.payload) {
        return createError("Invalid report structure from jams inspect");
    }

    const result = parseReport<JamLite[]>(report, []);

    return result;
};

export const fetchJamById = async (id: number) => {
    if (id === undefined || id === null)
        return createError("Can't get information without an id");

    const payload = `jams/${id}`;
    const payloadBlob = new TextEncoder().encode(payload);
    
    const response = await fetch(inspectUrl, {
        method: 'POST',
        body: payloadBlob,
    });

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception") {
        let errorMsg = "Unknown exception";
        if (data.exception_payload) {
            errorMsg = safeHexToString(data.exception_payload);
        } else if (data.reports && data.reports.length > 0 && data.reports[0]?.payload) {
            errorMsg = safeHexToString(data.reports[0].payload);
        }
        return createError(errorMsg);
    }

    if (!data.reports || data.reports.length === 0) {
        return createError("No reports returned from jam detail inspect");
    }

    const report = data.reports[0];
    if (!report || !report.payload) {
        return createError("Invalid report structure from jam detail inspect");
    }

    const result = parseReport<Jam>(report, null);
    return result;
};

export const fetchJamsStats = async () => {
    const payload = 'jamstats';
    const payloadBlob = new TextEncoder().encode(payload);
    
    console.log("Fetching jamstats from:", inspectUrl);
    
    if (!inspectUrl || inspectUrl.includes("undefined")) {
        return createError("Invalid inspect URL - check environment variables");
    }
    
    let response: Response;
    try {
        response = await fetch(inspectUrl, {
            method: 'POST',
            body: payloadBlob,
        });
    } catch (error: any) {
        console.error("Fetch error for jamstats:", error);
        return createError(`Network error: ${error.message || "Failed to connect"}`);
    }

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    let data: InspectResponseBody;
    try {
        data = (await response.json()) as InspectResponseBody;
    } catch (error: any) {
        console.error("JSON parse error for jamstats:", error);
        return createError(`Failed to parse response: ${error.message}`);
    }

    console.log("jamstats response status:", data.status, "reports count:", data.reports?.length);

    // Try to parse report data first, even if status is Exception
    // (backend may return Exception status but still have valid data in reports)
    if (data.reports && data.reports.length > 0 && data.reports[0]?.payload) {
        const report = data.reports[0];
        try {
            const result = parseReport<JamStats[]>(report, []);
            // If we got a valid array, return it regardless of status
            if (Array.isArray(result)) {
                console.log("jamstats parsed successfully, count:", result.length);
                return result;
            }
        } catch (e) {
            console.warn("Failed to parse jamstats report as data, treating as error");
        }
    }

    // If we get here with Exception status, it's a real error
    if (data.status === "Exception") {
        let errorMsg = "Unknown exception";
        if (data.exception_payload) {
            errorMsg = safeHexToString(data.exception_payload);
        } else if (data.reports && data.reports.length > 0 && data.reports[0]?.payload) {
            errorMsg = safeHexToString(data.reports[0].payload);
        }
        console.error("jamstats exception:", errorMsg);
        return createError(errorMsg);
    }

    return createError("No valid data returned from jamstats inspect");
};
