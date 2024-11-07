import { useEffect, useState } from "react";
import { Address, createPublicClient, http, isAddress } from "viem";
import { getEnsAvatar, getEnsName } from "viem/actions";
import { mainnet } from "viem/chains";

const client = createPublicClient({
    transport: http(),
    chain: mainnet,
});

const fetchENSInfo = async (address: Address) => {
    let name: string | undefined;
    let avatar: string | undefined;

    if (isAddress(address)) {
        name = (await getEnsName(client, { address })) as string | undefined;
        if (name)
            avatar = (await getEnsAvatar(client, { name })) as
                | string
                | undefined;

        // console.log(`ENS checks for ${address}`);
        // console.log(`ENS name result: ${name}`);
        // console.log(`ENS Avatar result ${avatar}`);
    }

    return { name, avatar };
};

type ENSData = {
    name?: string;
    avatar?: string;
};

type Cache = {
    [k: string]: ENSData | undefined;
};

const cache: Cache = {};

const useFindENSData = (address: Address) => {
    const [result, setResult] = useState<ENSData | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        let cached = cache[address];
        if (!cached) {
            setIsLoading(true);
            fetchENSInfo(address)
                .then((ensData) => {
                    cache[address] = ensData;
                    setResult(ensData);
                })
                .catch((reason) => {
                    console.log(reason.message);
                    cache[address] = {};
                    setResult({});
                })
                .finally(() => setIsLoading(false));
        } else {
            setResult(cached);
        }
    }, [address]);

    return {
        data: result,
        isLoading,
    };
};

export default useFindENSData;
