import { formatEther, parseEther } from "viem";

export default class Jam {
    static allJams = [];
    static jamIDCounter = 0;
    static jamStats = new Map();

    constructor(
        name,
        description,
        mintPrice,
        maxEntries,
        genesisEntry,
        contributor,
    ) {
        this.id = Jam.jamIDCounter++;
        this.name = name;
        this.description = description;
        this.mintPrice = mintPrice;
        this.maxEntries = maxEntries;
        this.entries = [{ text: genesisEntry, address: contributor }];
        this.creatorAddress = contributor;
        this.submittedAddresses = new Set([contributor]);
        this.open = true;
        Jam.allJams.push(this);

        Jam.jamStats.set(this.id, {
            name: this.name,
            numTotalMints: 0,
            totalMintAmount: "0",
            score: "0",
        });
    }

    static showAllJams = () => {
        console.log(Jam.allJams);
    };

    appendToJam = (address, text) => {
        if (!this.open) {
            throw new Error("This jam is closed for new entries.");
        }
        if (this.submittedAddresses.has(address)) {
            throw new Error(
                "This address has already contributed to this Jam.",
            );
        }
        if (this.entries.length >= this.maxEntries) {
            this.open = false;
            throw new Error(
                "This jam has reached the maximum number of entries.",
            );
        }
        this.entries.push({ text, address });
        this.submittedAddresses.add(address);

        // Update the overall jam score
        Jam.updateJamScore(this);

        if (this.entries.length >= this.maxEntries) {
            this.open = false;
        }
    };

    static appendToJamByID = (jamID, address, text) => {
        const jam = Jam.allJams.find((jam) => jam.id === jamID);
        if (!jam) {
            throw new Error(`Jam with ID ${jamID} not found.`);
        }
        jam.appendToJam(address, text);
    };

    static getJamByID = (jamID) => {
        return Jam.allJams.find((jam) => jam.id === jamID) || null;
    };

    static getJamsByStatus = (status) => {
        if (status !== "open" && status !== "closed") {
            throw new Error(
                'Invalid status. Must be either "open" or "closed".',
            );
        }
        if (status === "open") {
            return Jam.allJams.filter((jam) => jam.open === true);
        } else {
            return Jam.allJams.filter((jam) => jam.open === false);
        }
    };

    static getJamsByCreator = (creatorAddress) => {
        return Jam.allJams.filter(
            (jam) => jam.creatorAddress === creatorAddress,
        );
    };

    static getJamsByParticipant = (participantAddress) => {
        return Jam.allJams.filter(
            (jam) =>
                jam.creatorAddress !== participantAddress &&
                jam.submittedAddresses.has(participantAddress),
        );
    };

    static updateCreatorsBalance = async (jamID, fromAddress, wallet) => {
        const jam = Jam.getJamByID(jamID);
        const totalParticipants = jam.submittedAddresses.size;
        const amountPerParticipant =
            parseEther(String(jam.mintPrice)) / BigInt(totalParticipants);
        console.debug("Amount per participant: ", amountPerParticipant);
        for (const toAddress of jam.submittedAddresses) {
            try {
                await wallet.transferEther(
                    fromAddress,
                    toAddress,
                    amountPerParticipant,
                );
            } catch (error) {
                console.error(`Failed to transfer to ${toAddress}:`, error);
            }
        }
        console.debug("Balance updated successfully");
    };

    handleMintStats(mintAmount) {
        const currentJamStat = Jam.jamStats.get(this.id);
        if (currentJamStat) {
            currentJamStat.numTotalMints += 1;
            currentJamStat.totalMintAmount = String(
                formatEther(
                    BigInt(parseEther(currentJamStat.totalMintAmount)) +
                        BigInt(mintAmount),
                ),
            );
            Jam.jamStats.set(this.id, currentJamStat);
            Jam.updateJamScore(this);
        }
    }

    static updateJamScore = (jam) => {
        const currentJamStat = Jam.jamStats.get(jam.id);
        console.log("JamStat fetched to update score: ", currentJamStat);
        const numCollaborators = jam.submittedAddresses.size;
        const numTotalMints = currentJamStat ? currentJamStat.numTotalMints : 0;
        const totalMintAmount = currentJamStat
            ? Number(currentJamStat.totalMintAmount)
            : 0;

        // hard-coded weights
        const weightCollaborators = 0.2;
        const weightTotalMints = 0.4;
        const weightTotalMintAmount = 0.4;

        // hard-coded max values for normalisation
        const maxCollaborators = 100;
        const maxTotalMints = 100;
        const maxTotalMintAmount = 100;
        const scoreCollaborators = (numCollaborators / maxCollaborators) * 100;
        const scoreTotalMints = (numTotalMints / maxTotalMints) * 100;
        const scoreTotalMintAmount =
            (totalMintAmount / maxTotalMintAmount) * 100;

        const overallScore =
            scoreCollaborators * weightCollaborators +
            scoreTotalMints * weightTotalMints +
            scoreTotalMintAmount * weightTotalMintAmount;

        // update jam stats
        currentJamStat.score = Math.min(overallScore, 100).toFixed(2);
        Jam.jamStats.set(jam.id, currentJamStat);
    };

    static getJamStatsById = (jamID) => {
        return Jam.jamStats.get(jamID);
    };

    static getAllJamsStats() {
        return Array.from(Jam.jamStats.entries()).map(([jamID, info]) => {
            return { jamID, ...info };
        });
    }
}
