// XXX even though ethers is not used in the code below, it's very likely
// it will be used by any DApp, so we are already including it here
import {hexToString, stringToHex} from "viem";
import Jam from './JamManager.js';

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const sender = data.metadata.msg_sender
  const payload = data.payload
  var input = hexToString(payload)
  console.log("Advance payload : ", input)
  input = JSON.parse(input)
  if (input.action === "jam.create"){
    const newJam = new Jam(input.name, input.description, input.mintPrice, input.maxEntries, input.genesisEntry, sender)
    Jam.showAllJams();
  }
  else if (input.action === "jam.append"){
    Jam.appendToJamByID(input.jamID, sender, input.entry)
  } 
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  const payload = hexToString(data.payload);
  console.log("Inspect payload : ", payload);
  const payloadArr = payload.split("/");

  if (payloadArr[0] === "alljams") {
    const allJams = Jam.allJams
    let inspect_req = await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: stringToHex(JSON.stringify(allJams)) }),
    });
    console.log("Adding report with" + inspect_req.status);
  }

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
