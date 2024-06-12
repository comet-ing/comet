import { Hex } from "viem";

const InspectStatus = [
    "Accepted",
    "Rejected",
    "Exception",
    "MachineHalted",
    "CycleLimitExceeded",
    "TimeLimitExceeded",
] as const;

export type Report = { payload: Hex };

export interface InspectResponseBody {
    status: (typeof InspectStatus)[number];
    exception_payload: Hex;
    reports: Report[];
    processed_input_count: number;
}
