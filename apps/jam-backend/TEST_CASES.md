# Comet Jam Backend Test Cases

## Purpose

This document defines the executable test cases for the Comet jam backend before running them in a local Cartesi dev environment.

It is derived from:

- `apps/jam-backend/src/index.js`
- `apps/jam-backend/src/JamManager.js`
- `apps/jam-backend/README.md`
- `apps/jam-backend/test_comet_jam.sh`
- `apps/jam-backend/test_inspect.sh`

## Environment Prerequisites

- Docker is running.
- Cartesi CLI `2.0.0-alpha.29` or newer is installed.
- Foundry is installed.
- Backend dependencies are installed with `yarn install`.
- The backend is built with `cartesi build`.
- The local stack is running with `cartesi run`.
- The current application address is known and updated in any helper scripts.
- The ERC1155 contract is built and deployed when mint-path tests are executed.

## Backend Surface Inventory

### Advance payload format

- Advance payloads are JSON strings encoded to hex bytes.
- Supported direct actions:
  - `jam.setNFTAddress`
  - `jam.create`
  - `jam.append`
  - `eth.withdraw`
- Supported ether-portal execution action:
  - `jam.mint`

### Inspect routes

- `alljams`
- `jams/<jamID>`
- `openjams`
- `closedjams`
- `user/<address>`
- `balance/<address>`
- `jamstats`
- `nftaddress`
- `nextjamid`

### State and behavior notes from code

- Jam IDs start at `0` and increment by `1`.
- A jam is created with one genesis entry from the creator.
- A participant can only contribute once per jam.
- A jam closes automatically when `entries.length >= maxEntries`.
- Minting requires:
  - sender is the Ether Portal
  - a valid JSON execution payload
  - `action === "jam.mint"`
  - an NFT address already configured
  - an existing jam ID
  - sufficient deposited ether balance
- Minting updates jam stats and distributes mint proceeds across submitted addresses.
- Inspect `user/<address>` currently returns full jam objects, not lite jam objects.
- Invalid inspect actions reject with an error report.
- Invalid advance actions reject with an error report.

## Recommended Execution Order

1. Run inspect smoke tests on empty state.
2. Configure NFT contract address.
3. Create a jam.
4. Run inspect verification for populated state.
5. Append entries from different users.
6. Run jam closure and user-query verification.
7. Test simple ether deposit.
8. Test mint success and mint failure paths.
9. Test withdrawal success and failure paths.
10. Run invalid payload and stress scenarios.

## Shared Test Data

Use these sample payloads as a baseline and adjust addresses or IDs to match the active devnet session.

### Valid `jam.setNFTAddress`

```json
{"action":"jam.setNFTAddress","address":"0x1234567890123456789012345678901234567890"}
```

### Valid `jam.create`

```json
{"action":"jam.create","name":"myJam","description":"my jam desc","mintPrice":"3","maxEntries":3,"genesisEntry":"Roses are red"}
```

### Valid `jam.append`

```json
{"action":"jam.append","jamID":0,"entry":"Skies are blue"}
```

### Valid `jam.mint` execution payload

```json
{"action":"jam.mint","jamID":0}
```

### Valid `eth.withdraw`

```json
{"action":"eth.withdraw","amount":"2000000000000000000"}
```

## Inspect Test Cases

| ID | Scenario | Preconditions | Action | Expected Result |
|----|----------|---------------|--------|-----------------|
| I01 | Inspect `alljams` on empty state | Fresh backend state | POST inspect body `alljams` | Accepts and returns `[]` |
| I02 | Inspect `openjams` on empty state | Fresh backend state | POST inspect body `openjams` | Accepts and returns `[]` |
| I03 | Inspect `closedjams` on empty state | Fresh backend state | POST inspect body `closedjams` | Accepts and returns `[]` |
| I04 | Inspect `jamstats` on empty state | Fresh backend state | POST inspect body `jamstats` | Accepts and returns `[]` |
| I05 | Inspect `nextjamid` on empty state | Fresh backend state | POST inspect body `nextjamid` | Accepts and returns `{"nextJamId":0}` |
| I06 | Inspect `nftaddress` before configuration | Fresh backend state | POST inspect body `nftaddress` | Accepts and returns `{"nftAddress":null}` |
| I07 | Inspect single jam before creation | Fresh backend state | POST inspect body `jams/0` | Accepts and returns `null` |
| I08 | Inspect user before activity | Fresh backend state | POST inspect body `user/<known-address>` | Accepts and returns `{"creator":[],"participant":[]}` |
| I09 | Inspect balance before deposit | Fresh backend state | POST inspect body `balance/<known-address>` | Accepts and returns `"0"` or equivalent zero value |
| I10 | Inspect invalid route | Any state | POST inspect body `unknownroute` | Rejects with report containing `Invalid inspect action` |
| I11 | Inspect `nextjamid` after one jam is created | One jam exists | POST inspect body `nextjamid` | Accepts and returns `{"nextJamId":1}` |
| I12 | Inspect `alljams` after one jam is created | One jam exists | POST inspect body `alljams` | Returns array with one lite jam object containing `id`, `name`, `description`, `mintPrice`, `maxEntries`, `creatorAddress`, `timestamp`, `open`, `entryCount`, `submittedAddresses` |
| I13 | Inspect `jams/0` after jam creation | Jam `0` exists | POST inspect body `jams/0` | Returns full jam object with genesis entry present |
| I14 | Inspect `openjams` after jam creation | Jam `0` is open | POST inspect body `openjams` | Returns jam `0` in lite format |
| I15 | Inspect `closedjams` while jam is still open | Jam `0` is open | POST inspect body `closedjams` | Returns `[]` |
| I16 | Inspect creator activity | Jam `0` created by user A | POST inspect body `user/<user-A>` | Returns jam `0` under `creator` |
| I17 | Inspect participant activity after append | Jam `0` has append by user B | POST inspect body `user/<user-B>` | Returns jam `0` under `participant` |
| I18 | Inspect user route with invalid address | Any state | POST inspect body `user/not-an-address` | Rejects with an error report from address parsing |
| I19 | Inspect balance after ether deposit | User A has deposited ether | POST inspect body `balance/<user-A>` | Returns positive wei balance |
| I20 | Inspect `jamstats` after create only | Jam `0` exists, no mint yet | POST inspect body `jamstats` | Returns jam stats entry with `jamID:0`, `numTotalMints:0`, `totalMintAmount:"0"`, numeric `score`, and contributor count reflecting current submitted addresses |
| I21 | Inspect `nftaddress` after configuration | NFT address set | POST inspect body `nftaddress` | Returns configured NFT address |
| I22 | Inspect closed jam after max entries reached | Jam `0` is full | POST inspect body `closedjams` | Returns jam `0` in closed list |
| I23 | Inspect open jams after max entries reached | Jam `0` is full | POST inspect body `openjams` | Does not include jam `0` |
| I24 | Inspect single jam for non-existent ID after activity | Some jams exist but requested ID does not | POST inspect body `jams/999` | Accepts and returns `null` |
| I25 | Inspect `jamstats` after successful mint | Jam `0` minted at least once | POST inspect body `jamstats` | Returns updated `numTotalMints`, updated `totalMintAmount`, and recalculated `score` |
| I26 | Inspect stress loop | Backend running with sample data | Run `test_inspect.sh` or equivalent repeated inspect calls | All requests return valid JSON response envelopes without process crash |

## Advance Test Cases

| ID | Scenario | Preconditions | Action | Expected Result |
|----|----------|---------------|--------|-----------------|
| A01 | Set NFT address successfully | Fresh backend state | Send `jam.setNFTAddress` with valid address | Advance accepted and inspect `nftaddress` returns that address |
| A02 | Set NFT address with invalid address | Fresh backend state | Send `jam.setNFTAddress` with malformed address | Advance rejected with error report |
| A03 | Create jam successfully | Fresh backend state | Send valid `jam.create` from user A | Advance accepted, jam `0` created, `nextjamid` becomes `1` |
| A04 | Create multiple jams | At least one jam exists | Send another valid `jam.create` | New jam created with incremented ID |
| A05 | Create jam with missing field | Fresh backend state | Omit one required field such as `genesisEntry` | Behavior is recorded; likely accepted but resulting jam data may be malformed, so this should be documented as a validation gap if no rejection occurs |
| A06 | Create jam with invalid JSON payload | Fresh backend state | Send malformed hex-decoded JSON | Advance rejected from handler parse failure |
| A07 | Create jam with unknown action | Fresh backend state | Send `{"action":"jam.unknown"}` | Advance rejected with report containing `Invalid input action` |
| A08 | Append successfully from second user | Jam `0` exists and is open | Send valid `jam.append` from user B | Advance accepted, entry added, participant set updated |
| A09 | Append successfully from third user | Jam `0` exists and is open | Send valid `jam.append` from user C | Advance accepted, second appended entry added |
| A10 | Append to non-existent jam | No jam with requested ID | Send `jam.append` using bad `jamID` | Advance rejected with report containing `Jam with ID <id> not found.` |
| A11 | Append duplicate contributor | User A already contributed to jam `0` | User A sends another `jam.append` to jam `0` | Advance rejected with report containing `This address has already contributed to this Jam.` |
| A12 | Append when jam reaches max entries exactly | Jam `0` has one slot remaining | Valid user appends final allowed entry | Advance accepted and jam becomes closed |
| A13 | Append after jam is closed | Jam `0` already full | Another user sends `jam.append` | Advance rejected with report containing `This jam is closed for new entries.` or `This jam has reached the maximum number of entries.` depending on state transition timing |
| A14 | Withdraw successfully after deposit | User A has enough internal ether balance | Send valid `eth.withdraw` | Advance accepted and voucher created |
| A15 | Withdraw exact balance | User A balance equals requested amount | Send valid `eth.withdraw` | Advance accepted and resulting internal balance becomes zero |
| A16 | Withdraw with insufficient balance | User has no or low balance | Send `eth.withdraw` above balance | Advance rejected with error report from wallet |
| A17 | Withdraw malformed amount | Any state | Send `eth.withdraw` with non-numeric string amount | Advance rejected during `BigInt` conversion |
| A18 | Direct non-portal sender calls mint action | NFT configured | Send `{"action":"jam.mint","jamID":0}` through regular input box | Advance rejected as invalid input action because direct advance handler does not support this action |

## Ether Portal and Mint Test Cases

| ID | Scenario | Preconditions | Action | Expected Result |
|----|----------|---------------|--------|-----------------|
| P01 | Simple ether deposit without execution payload | Backend running | Call Ether Portal `depositEther` with empty payload | Advance accepted and recipient balance increases |
| P02 | Ether deposit with invalid execution payload JSON | Backend running | Call Ether Portal `depositEther` with non-JSON extra payload | Advance accepted as simple deposit and balance increases |
| P03 | Ether deposit with JSON action other than `jam.mint` | Backend running | Call Ether Portal `depositEther` with `{"action":"other"}` | Advance accepted as simple deposit |
| P04 | Ether deposit with `jam.mint` before NFT address is set | Jam exists, NFT address unset | Deposit ether with mint execution payload | Advance accepted as simple deposit, no mint voucher created |
| P05 | Ether deposit with `jam.mint` for missing jam | NFT address set | Deposit ether with `jamID` that does not exist | Advance accepted and report says `Jam not found with given ID` |
| P06 | Ether deposit with `jam.mint` and insufficient balance | NFT address set, jam exists, deposit amount lower than mint price | Submit mint-path deposit | Advance accepted and report says `Insufficient balance to mint. Deposit ether.` |
| P07 | Ether deposit with `jam.mint` succeeds | NFT address set, jam exists, balance is at least mint price | Submit mint-path deposit | Advance accepted, mint voucher created, jam stats updated, proceeds distributed |
| P08 | Multiple successful mints on same jam | NFT address set, jam exists, repeated valid deposits | Execute mint path several times | `numTotalMints` increments and `totalMintAmount` accumulates correctly |
| P09 | Mint proceeds distribution across all contributors | Jam has multiple submitted addresses | Execute successful mint | All contributors receive equal share in internal wallet state |
| P10 | Mint after jam is closed | Jam exists and is closed for new entries | Execute successful mint-path deposit | Mint should still succeed because code only checks jam existence and pricing |
| P11 | Mint voucher creation failure handling | Force invalid NFT target or voucher creation failure | Execute mint-path deposit | Advance rejects and report contains voucher creation failure message |
| P12 | Mint settlement partial transfer failures | Simulate wallet transfer failure during distribution | Execute successful mint path | Advance still accepts unless settlement throws at higher level; transfer failures are logged and should be noted during execution |

## DApp Address Relay Test Cases

| ID | Scenario | Preconditions | Action | Expected Result |
|----|----------|---------------|--------|-----------------|
| R01 | Deprecated dapp address relay path accepts known sender | Ability to spoof or send from relay contract address | Send advance from relay contract sender | Advance accepted if wallet handler accepts it |
| R02 | Relay path handler failure | Ability to trigger wallet handler failure on relay path | Send malformed relay payload | Advance rejected |

## Validation and Robustness Test Cases

| ID | Scenario | Preconditions | Action | Expected Result |
|----|----------|---------------|--------|-----------------|
| V01 | Advance payload is not valid JSON | Backend running | Send malformed JSON bytes through input box | Advance rejected with parse-related error report |
| V02 | Advance payload is empty | Backend running | Send empty payload | Advance rejected |
| V03 | `jam.append` missing `entry` field | Jam exists | Send append payload without `entry` | Behavior recorded; likely accepted with malformed entry unless downstream code fails, so this should expose a validation gap |
| V04 | `jam.append` missing `jamID` | Jam exists | Send append payload without `jamID` | Advance rejected because jam lookup fails |
| V05 | `jam.create` with `maxEntries` set to `1` | Fresh backend state | Create jam with one maximum entry | Jam is created already containing the genesis entry; subsequent append should fail because max is reached |
| V06 | `jam.create` with `mintPrice` not parseable by `parseEther` | Fresh backend state | Create jam with invalid mint price string | Creation likely succeeds, but mint later should fail when parsing price; document this as a validation gap |
| V07 | Inspect payload empty string | Backend running | POST inspect body empty | Rejects with `Invalid inspect action` |
| V08 | Inspect route with extra path segments | Backend running | POST inspect body `jams/0/extra` | Accepts or ignores trailing segment depending on route parsing; record actual behavior |
| V09 | High-volume jam creation | Backend running | Create many jams in sequence | Backend remains stable and IDs stay monotonic |
| V10 | High-volume append workload | Several open jams exist | Append repeatedly from many users | Backend remains stable and jam closure rules remain correct |

## Suggested Command Sources During Execution

- Use `cartesi build` and `cartesi run` as documented in `README.md`.
- Use `test_comet_jam.sh` for baseline create, append, deposit, and mint flow.
- Use `test_inspect.sh` for repeated inspect coverage.
- Use direct `curl` for inspect edge cases not covered by the script.
- Use `cast send` for advance-path and ether-portal negative scenarios.

## Minimum Regression Suite

If only a short regression pass is needed, run these first:

1. I01 `alljams` on empty state.
2. A01 set NFT address.
3. A03 create jam.
4. I12 inspect `alljams` after creation.
5. A08 append from a second user.
6. A11 duplicate contributor rejection.
7. P01 simple ether deposit.
8. P07 successful mint.
9. I25 inspect `jamstats` after mint.
10. A14 successful withdrawal.
11. I26 inspect stress loop.
12. V01 malformed advance payload rejection.

## Expected Gaps to Watch

- Input validation is limited for several JSON fields, so some malformed requests may be accepted instead of rejected.
- `user/<address>` returns full jam objects rather than lite jam objects.
- Some failure cases depend on wallet or Cartesi runtime behavior and must be confirmed empirically during execution.
- Relay contract testing may be hard to reproduce locally unless the sender can be controlled.

## Next Step

Use this file as the execution checklist, then capture actual outcomes in a separate `TEST_REPORT.md` after the run.
