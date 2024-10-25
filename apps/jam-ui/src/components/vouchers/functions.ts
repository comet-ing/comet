import {
    Address,
    decodeFunctionData,
    getAddress,
    Hex,
    isAddressEqual,
    parseAbi,
    zeroHash,
} from "viem";
import { outputsFactoryAbi } from "../../generated/wagmi-rollups";
import { Proof, Voucher, VoucherType } from "./types";

const erc1155Address = process.env.NEXT_PUBLIC_ERC1155_ADDRESS;

const mintAbi = parseAbi(["function mint(address receiver, uint256 jamId)"]);

const withdrawEtherAbi = parseAbi([
    "function withdrawEther(address receiver, uint256 value)",
]);

const decodeOutput = (payload: Hex) =>
    decodeFunctionData({ abi: outputsFactoryAbi, data: payload });

const decodeMintVoucher = (voucher: Voucher) => {
    const result = decodeOutput(voucher.payload);
    const [_dest, _value, data] = result.args;
    return decodeFunctionData({ abi: mintAbi, data: data as Hex });
};
const decodeEtherWithdrawVoucher = (voucher: Voucher) => {
    const result = decodeOutput(voucher.payload);
    const [dest, value, data] = result.args;

    if (data === "0x")
        return {
            args: [dest, BigInt(value ?? "0")] as [Address, bigint],
            functionName: "withdrawEther",
        };

    return decodeFunctionData({ abi: withdrawEtherAbi, data: data as Hex });
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
