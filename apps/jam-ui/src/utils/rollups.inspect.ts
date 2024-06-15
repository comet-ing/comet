import { hexToString } from "viem";
import { Report } from "./rollups.types";

/**
 * Parse the report payload return from a request to the inspect API
 * @param report
 * @param defaultValue Optional default value in case report is not available
 * @returns
 */
export const parseReportPayload = <T>(
    report: Report,
    defaultValue: any,
    parser?: (a: string) => T,
): T => {
    if (report.payload !== "0x") {
        try {
            const payload = hexToString(report.payload);
            return parser !== undefined
                ? parser(payload)
                : (JSON.parse(payload) as T);
        } catch (error: any) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    return defaultValue;
};
