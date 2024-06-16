import { hexToString } from "viem";
import { InspectResponseBody, Report } from "../../utils/rollups.types";
import { Jam, JamListFilter, JamStats } from "./types";

const rollupHost = process.env.NEXT_PUBLIC_ROLLUPS_ENDPOINT;

const parseReport = <T>(report: Report, defaultValue: any): T => {
    if (report) {
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
    const url = `${rollupHost}/inspect/${action[filter]}`;

    const response = await fetch(url);

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception")
        return createError(hexToString(data.exception_payload));

    const result = parseReport<Jam[]>(data.reports[0], []);

    return result;
};

export const fetchJamById = async (id: number) => {
    if (id === undefined || id === null)
        return createError("Can't get information without an id");

    const url = `${rollupHost}/inspect/jams/${id}`;

    const response = await fetch(url);

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception")
        return createError(hexToString(data.exception_payload));

    const result = parseReport<Jam>(data.reports[0], null);
    return result;
};

export const fetchJamsStats = async () => {
    const url = `${rollupHost}/inspect/jamstats`;

    const response = await fetch(url);

    if (!response.ok) {
        return createError(`Network response error - ${response.status}`);
    }

    const data = (await response.json()) as InspectResponseBody;

    if (data.status === "Exception")
        return createError(hexToString(data.exception_payload));

    const result = parseReport<JamStats[]>(data.reports[0], []);

    return result;
};
