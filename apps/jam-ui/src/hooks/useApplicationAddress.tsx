import { getAddress } from "viem";

const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS;

export const useApplicationAddress = () => getAddress(appAddress);
