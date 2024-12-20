import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  LookupMap,
  NearPromise,
} from 'near-sdk-js';

type AccountId = string;

interface FungibleTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
}

@NearBindgen({})
class FungibleToken {
  totalSupply: number;
  //   balances: LookupMap<string>;
  // balances: Map<string, string>;
  balances = new LookupMap<number>('balance');
  metadata: FungibleTokenMetadata;
  owner: AccountId;

  constructor() {
    this.totalSupply = 1_000_000_000; // 1,000,000,000 tokens with 18 decimals
    // this.balances = new LookupMap('b');
    this.balances = new LookupMap('balance');
    this.metadata = {
      spec: 'ft-1.0.0',
      name: 'Example Token',
      symbol: 'EXTKN',
      icon: 'https://testnet.nearblocks.io/images/nearblocksblack.svg',
      reference: 'https://rferenceexample.com',
      reference_hash: 'https://rferenceexample.com',
      decimals: 18,
    };
    this.owner = '';
  }

  @initialize({})
  init({ owner_id }: { owner_id: AccountId }): void {
    if (this.owner !== '') {
      throw new Error('Contract is already initialized');
    }
    this.owner = owner_id;
    this.balances.set(owner_id, this.totalSupply);
  }

  @view({})
  ft_total_supply(): number {
    return this.totalSupply;
  }

  @view({})
  ft_balance_of({ account_id }: { account_id: AccountId }): number {
    return this.balances.get(account_id) || 0;
  }

  @view({})
  ft_metadata(): FungibleTokenMetadata {
    return this.metadata;
  }

  @call({ payableFunction: true })
  ft_transfer({
    receiver_id,
    amount,
    memo,
  }: {
    receiver_id: AccountId;
    amount: number;
    memo?: string;
  }): void {
    const sender_id = near.predecessorAccountId();
    const amount_bigint = amount;

    // Assert attached deposit is exactly 1 yoctoNEAR
    if (near.attachedDeposit() !== BigInt(1)) {
      throw new Error('Requires attached deposit of exactly 1 yoctoNEAR');
    }

    // Ensure positive transfer amount
    if (amount_bigint <= 0) {
      throw new Error('The amount should be a positive number');
    }

    // Check and update sender balance
    const sender_balance = this.balances.get(sender_id) || 0;
    if (sender_balance < amount_bigint) {
      throw new Error('Not enough balance');
    }
    this.balances.set(sender_id, sender_balance - amount_bigint);

    // Check and update receiver balance
    this.storage_deposit({ account_id: receiver_id });
    const receiver_balance = this.balances.get(receiver_id) || 0;
    this.balances.set(receiver_id, receiver_balance + amount_bigint);

    /*
    EVENT_JSON:{
      "standard":"nep141",
      "version":"1.0.0",
      "event":"ft_transfer",
      "data":
      [
      {
        "owner_id":"sender_id",
        "amount":"100"
      },
      {"owner_id":"sender_id","amount":"200","memo":"has memo"}
    ]}
    */

    // Emit the ft_transfer event
    const eventData = {
      standard: 'nep141',
      version: '1.0.0',
      event: 'ft_transfer',
      data: [
        {
          old_owner_id: sender_id,
          new_owner_id: receiver_id,
          amount: amount,
          memo: memo || '',
        },
      ],
    };
    near.log(`EVENT_JSON:${JSON.stringify(eventData)}`);

    // Log the transfer
    near.log(`Transfer ${amount} from ${sender_id} to ${receiver_id}`);
    if (memo) {
      near.log(`Memo: ${memo}`);
    }
  }

  @call({ payableFunction: true })
  storage_deposit({ account_id }: { account_id?: AccountId }): {
    total: string;
    available: string;
  } {
    const accountId = account_id || near.predecessorAccountId();
    const attachedDeposit = near.attachedDeposit();
    const MIN_STORAGE_BALANCE = BigInt('1250000000000000000000'); // 0.00125 NEAR

    if (attachedDeposit < MIN_STORAGE_BALANCE) {
      throw new Error(
        `The attached deposit is less than the minimum storage balance (${MIN_STORAGE_BALANCE})`
      );
    }

    if (!this.balances.get(accountId)) {
      this.balances.set(accountId, 0);
    }

    return {
      total: MIN_STORAGE_BALANCE.toString(),
      available: '0',
    };
  }

  @view({})
  storage_balance_of({
    account_id,
  }: {
    account_id: AccountId;
  }): { total: string; available: string } | null {
    if (!this.balances.get(account_id)) {
      return null;
    }
    return {
      total: '1250000000000000000000',
      available: '0',
    };
  }
}
