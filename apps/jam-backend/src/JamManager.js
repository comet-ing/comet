//import { parseEther } from "viem"

export default class Jam {

    static allJams = []
    static jamIDCounter = 0;

    constructor(name, description, mintPrice, maxEntries, genesisEntry, contributor){
        this.id = Jam.jamIDCounter++;
        this.name = name;
        this.description = description;
        this.mintPrice = mintPrice;
        this.maxEntries = maxEntries;
        this.entries = [{ text: genesisEntry, address: contributor }];;
        this.creatorAddress = contributor;
        this.submittedAddresses = new Set([contributor]);
        this.open = true;
        Jam.allJams.push(this);
    }

    static showAllJams = () => {
          console.log(Jam.allJams)
    }

    appendToJam = (address, text) => {
        if (!this.open) {
            throw new Error("This jam is closed for new entries.");
          }
        if (this.submittedAddresses.has(address)) {
        throw new Error("This address has already contributed to this Jam.");
        }
        if (this.entries.length >= this.maxEntries) {
        this.open = false;
        throw new Error("This jam has reached the maximum number of entries.");
        }
        this.entries.push({ text, address });
        this.submittedAddresses.add(address);

        if (this.entries.length >= this.maxEntries) {
        this.open = false;
        // TODO - option to create a nft mint voucher when jam closes. con - node costs
        }
    }

    static appendToJamByID = (jamID, address, text) => {
        const jam = Jam.allJams.find(jam => jam.id === jamID);
        if (!jam) {
          throw new Error(`Jam with ID ${jamID} not found.`);
        }
        jam.appendToJam(address, text);
      };
    
    static getJamByID = (jamID) => {
      return Jam.allJams.find(jam => jam.id === jamID) || null;
    };

    static getJamsByStatus = (status) => {
      if (status !== 'open' && status !== 'closed') {
        throw new Error('Invalid status. Must be either "open" or "closed".');
      }
      if (status === 'open') {
        return Jam.allJams.filter(jam => jam.open === true);
      } else {
        return Jam.allJams.filter(jam => jam.open === false);
      }
    };

    static getJamsByCreator = (creatorAddress) => {
      return Jam.allJams.filter(jam => jam.creatorAddress === creatorAddress);
    };
  
    static getJamsByParticipant = (participantAddress) => {
      return Jam.allJams.filter(jam => jam.creatorAddress !== participantAddress && jam.submittedAddresses.has(participantAddress));
    };
}