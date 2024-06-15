import {
    Address,
    decodeFunctionData,
    getAddress,
    isAddressEqual,
    parseAbi,
    zeroHash,
} from "viem";
import { Proof, Voucher, VoucherType } from "./types";

const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS;

const mintAbi = parseAbi(["function mint(address receiver, uint256 jamId)"]);

const withdrawEtherAbi = parseAbi([
    "function withdrawEther(address receiver, uint256 value)",
]);

const decodeMintVoucher = (voucher: Voucher) =>
    decodeFunctionData({ abi: mintAbi, data: voucher.payload });
const decodeEtherWithdrawVoucher = (voucher: Voucher) =>
    decodeFunctionData({ abi: withdrawEtherAbi, data: voucher.payload });

export const dummyProof: Proof = {
    context: "0x",
    validity: {
        inputIndexWithinEpoch: 0,
        outputIndexWithinInput: 0,
        outputHashesRootHash: zeroHash,
        vouchersEpochRootHash: zeroHash,
        noticesEpochRootHash: zeroHash,
        machineStateHash: zeroHash,
        outputHashInOutputHashesSiblings: [],
        outputHashesInEpochSiblings: [],
    },
};

export function decodeVoucher(voucher: Voucher) {
    const isWithdraw = isAddressEqual(
        getAddress(voucher.destination),
        getAddress(appAddress),
    );

    const decoder = isWithdraw ? decodeEtherWithdrawVoucher : decodeMintVoucher;

    const { args } = decoder(voucher);

    const [receiver, value] = args;

    const type: VoucherType = isWithdraw ? "WITHDRAW" : "MINT";

    return {
        receiver,
        value,
        type,
    };
}

export function filterVouchersByReceiver(
    vouchers: Voucher[],
    account: Address,
) {
    return vouchers.filter((voucher) =>
        isVoucherOwnedByAccount(voucher, account),
    );
}

export function isVoucherOwnedByAccount(voucher: Voucher, account: Address) {
    const { receiver } = decodeVoucher(voucher);
    return isAddressEqual(receiver, account);
}
