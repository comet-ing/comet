import {
    Address,
    decodeFunctionData,
    getAddress,
    Hex,
    isAddressEqual,
    parseAbi,
    zeroHash,
} from "viem";
import { Proof, Voucher, VoucherType } from "./types";

const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_ADDRESS;

const mintAbi = parseAbi(["function mint(address receiver, uint256 jamId)"]);

const withdrawEtherAbi = parseAbi([
    "function withdrawEther(address receiver, uint256 value)",
]);

/**
 * Backend stores raw contract calldata in voucher payload:
 * - Mint: ERC1155 mint(receiver, jamId) calldata
 * - Withdraw: 0x or withdrawEther(receiver, value) calldata
 */
const decodeMintVoucher = (voucher: Voucher) => {
    return decodeFunctionData({ abi: mintAbi, data: voucher.payload });
};

const decodeEtherWithdrawVoucher = (voucher: Voucher) => {
    if (!voucher.payload || voucher.payload === "0x" || voucher.payload.length <= 10) {
        return {
            args: [getAddress(voucher.destination), BigInt(voucher.value)] as [
                Address,
                bigint,
            ],
            functionName: "withdrawEther" as const,
        };
    }
    return decodeFunctionData({
        abi: withdrawEtherAbi,
        data: voucher.payload,
    });
};

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
    const isMint = isAddressEqual(
        getAddress(voucher.destination),
        getAddress(erc1155Address),
    );

    const decoder = !isMint ? decodeEtherWithdrawVoucher : decodeMintVoucher;

    const { args } = decoder(voucher);

    const [receiver, value] = args;

    const type: VoucherType = !isMint ? "WITHDRAW" : "MINT";

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
