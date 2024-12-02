import { NearBindgen, near, call, view, LookupMap, assert } from 'near-sdk-js';

// Define types
type AccountId = string;

// Define metadata structure
interface FungibleTokenMetadata {
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
  description: string;
}

@NearBindgen({})
class FungibleToken {
  totalSupply: bigint;
  balances: LookupMap<bigint>;
  allowances: LookupMap<{ [spenderId: string]: bigint }>;
  metadata: FungibleTokenMetadata;
  owner: string;

  constructor() {
    this.totalSupply = BigInt(1000000000); // Set later during initialization
    this.balances = new LookupMap<bigint>('balances');
    this.allowances = new LookupMap('allowances');
    this.owner = '';
    this.metadata = {
      spec: 'ft-1.0.0',
      name: 'Example Token',
      symbol: 'EXTKN',
      icon: null,
      reference: null,
      reference_hash: null,
      decimals: 18,
      description: 'An example fungible token',
    };
  }

  // Initialize contract with an owner and initial supply
  @call({})
  init({
    owner_id,
    initial_supply,
  }: {
    owner_id: AccountId;
    initial_supply: string;
  }): void {
    assert(this.totalSupply === BigInt(0), 'Contract is already initialized.');
    const supply = BigInt(initial_supply);
    this.totalSupply = supply;

    // Assign the entire supply to the owner
    this.balances.set(owner_id, supply);
  }

  // Get metadata
  @view({})
  ft_metadata(): FungibleTokenMetadata {
    return this.metadata;
  }

  // Get total supply
  @view({})
  ft_total_supply(): bigint {
    return this.totalSupply;
  }

  // Get account balance
  @view({})
  ft_balance_of({ account_id }: { account_id: AccountId }): bigint {
    return this.balances.get(account_id) || BigInt(0);
  }

  // Transfer tokens
  @call({})
  ft_transfer({
    receiver_id,
    amount,
    memo,
  }: {
    receiver_id: AccountId;
    amount: string;
    memo?: string;
  }): void {
    const sender_id = near.predecessorAccountId();
    const transfer_amount = BigInt(amount);
    this.internal_transfer(sender_id, receiver_id, transfer_amount, memo);
  }

  // Transfer with approval
  @call({})
  ft_transfer_from({
    owner_id,
    receiver_id,
    amount,
    memo,
  }: {
    owner_id: AccountId;
    receiver_id: AccountId;
    amount: string;
    memo?: string;
  }): void {
    const spender_id = near.predecessorAccountId();
    const transfer_amount = BigInt(amount);

    const allowances = this.allowances.get(owner_id) || {};
    assert(
      allowances[spender_id] && allowances[spender_id] >= transfer_amount,
      'Not enough allowance'
    );

    // Update allowances
    allowances[spender_id] -= transfer_amount;
    this.allowances.set(owner_id, allowances);

    this.internal_transfer(owner_id, receiver_id, transfer_amount, memo);
  }

  // Approve spender
  @call({})
  ft_approve({
    spender_id,
    amount,
  }: {
    spender_id: AccountId;
    amount: string;
  }): void {
    const owner_id = near.predecessorAccountId();
    const approve_amount = BigInt(amount);

    const allowances = this.allowances.get(owner_id) || {};
    allowances[spender_id] = approve_amount;
    this.allowances.set(owner_id, allowances);
  }

  // Storage deposit
  @call({})
  storage_deposit({
    account_id,
    registration_only,
  }: { account_id?: AccountId; registration_only?: boolean } = {}): {
    total: string;
    available: string;
  } {
    const storage_account_id = account_id || near.predecessorAccountId();
    const deposit = near.attachedDeposit();
    const min_balance = near.storageUsage() * near.storageByteCost();

    assert(
      deposit >= min_balance,
      `Insufficient deposit. Minimum: ${min_balance}`
    );

    this.balances.set(storage_account_id, BigInt(deposit - min_balance));
    return {
      total: min_balance.toString(),
      available: (deposit - min_balance).toString(),
    };
  }

  // Internal transfer logic
  private internal_transfer(
    sender_id: AccountId,
    receiver_id: AccountId,
    amount: bigint,
    memo?: string
  ): void {
    const sender_balance = this.balances.get(sender_id) || BigInt(0);
    assert(sender_balance >= amount, 'Not enough balance');

    // Update balances
    this.balances.set(sender_id, sender_balance - amount);
    const receiver_balance = this.balances.get(receiver_id) || BigInt(0);
    this.balances.set(receiver_id, receiver_balance + amount);

    if (memo) {
      near.log(`Transfer memo: ${memo}`);
    }
  }
}
