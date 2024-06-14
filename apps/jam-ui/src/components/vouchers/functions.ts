import {
    Address,
    decodeFunctionData,
    isAddressEqual,
    parseAbi,
    zeroHash,
} from "viem";
import { Proof, Voucher } from "./types";

const mintAbi = parseAbi(["function mint(address receiver, uint256 jamId)"]);

export const voucherExecutionAbi = parseAbi([
    "struct OutputValidityProof { uint64 inputIndexWithinEpoch; uint64 outputIndexWithinInput; bytes32 outputHashesRootHash; bytes32 vouchersEpochRootHash; bytes32 noticesEpochRootHash; bytes32 machineStateHash; bytes32[] outputHashInOutputHashesSiblings; bytes32[] outputHashesInEpochSiblings; }",
    "struct Proof { OutputValidityProof validity; bytes context; }",
    "function wasVoucherExecuted(uint256 inputIndex, uint256 outputIndexWithinInput) external view returns (bool)",
    "function executeVoucher(address _destination, bytes calldata _payload, Proof calldata _proof) external returns (bool)",
]);

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
    const { args } = decodeFunctionData({
        abi: mintAbi,
        data: voucher.payload,
    });

    const [receiver, value] = args;

    return {
        receiver,
        value,
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
