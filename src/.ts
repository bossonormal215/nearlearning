import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  NearPromise,
} from 'near-sdk-js';

@NearBindgen({})
class FungibleToken {
  totalSupply: string;
  balances: Map<string, string>;
  owner: string;

  constructor() {
    this.totalSupply = '1000000'; // Example total supply as string
    this.balances = new Map();
    this.owner = '';
  }

  @initialize({})
  init({ owner_id }: { owner_id: string }): void {
    if (this.owner !== '') {
      throw new Error('Contract has already been initialized');
    }
    this.owner = owner_id;
    this.balances.set(this.owner, this.totalSupply);
  }

  @view({})
  ft_total_supply(): string {
    return this.totalSupply;
  }

  @view({})
  ft_balance_of({ account_id }: { account_id: string }): string {
    return this.balances.get(account_id) || '0';
  }

  @call({})
  ft_transfer({
    receiver_id,
    amount,
  }: {
    receiver_id: string;
    amount: string;
  }): void {
    const sender = near.predecessorAccountId();
    const senderBalance = BigInt(this.balances.get(sender) || '0');
    const amountBigInt = BigInt(amount);

    if (senderBalance < amountBigInt) {
      throw new Error('Insufficient balance');
    }

    this.balances.set(sender, (senderBalance - amountBigInt).toString());
    const receiverBalance = BigInt(this.balances.get(receiver_id) || '0');
    this.balances.set(receiver_id, (receiverBalance + amountBigInt).toString());
  }
}
