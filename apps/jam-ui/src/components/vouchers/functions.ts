import { Address, decodeFunctionData, isAddressEqual, parseAbi } from "viem";
import { Voucher } from "./types";

const mintAbi = parseAbi(["function mint(address receiver, uint256 jamId)"]);

export const voucherExecutionAbi = parseAbi([
    "struct OutputValidityProof { uint64 inputIndexWithinEpoch; uint64 outputIndexWithinInput; bytes32 outputHashesRootHash; bytes32 vouchersEpochRootHash; bytes32 noticesEpochRootHash; bytes32 machineStateHash; bytes32[] outputHashInOutputHashesSiblings; bytes32[] outputHashesInEpochSiblings; }",
    "struct Proof { OutputValidityProof validity; bytes context; }",
    "function wasVoucherExecuted(uint256 inputIndex, uint256 outputIndexWithinInput) external view returns (bool)",
    "function executeVoucher(address _destination, bytes calldata _payload, Proof calldata _proof) external returns (bool)",
]);

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
    return vouchers.filter((voucher) => {
        const { receiver } = decodeVoucher(voucher);
        return isAddressEqual(receiver, account);
    });
}
