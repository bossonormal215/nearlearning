import { NearBindgen, call, NearPromise } from 'near-sdk-js';

// maximum gas we are willing to pay for the function call
const GAS = BigInt(50_000_000_000_000);
// no deposit attached to the function call
const NO_DEPOSIT = BigInt(0);

@NearBindgen({})
class HelloNear {
  @call({})
  hello() {
    return NearPromise.new('intro-to-near.agorapp.testnet').functionCall(
      'get_secret',
      '',
      NO_DEPOSIT,
      GAS
    );
  }
}


near call hello-contract.baideployer.testnet init '{"owner_id": "testing1.baideployer.testnet"}' --accountId hello-contract.baideployer.testnet