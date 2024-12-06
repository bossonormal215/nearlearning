import {
  NearBindgen,
  near,
  call,
  view,
  initialize,
  LookupMap,
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
  totalSupply: string;
  accounts: LookupMap<string>;
  metadata: FungibleTokenMetadata;
  owner_id: AccountId;

  constructor() {
    this.totalSupply = '1000000000000000000000000000'; // 1,000,000,000 tokens with 18 decimals
    this.accounts = new LookupMap('a');
    this.metadata = {
      spec: 'ft-1.0.0',
      name: 'Example Token',
      symbol: 'EXTKN',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAClFBMVEUyHnMwL4QyEGc0FmwwNYkxInYzE2kyGnAyOY8vBVcxCVwxQZQyaK0wY6k1PZI5ergyDmMxKn82TJ4vDWAwSpk1RZcwF2w5HnQ1W6JBW6cuJ3s0J3o2b60vV6BHQ5E9QpV63u4qAlFMSZhWQY01UaMrXKc3WqpQN4ZYX6k3YaZHdrJXT5g+T5o5NIo+Oo8kM4g5RJs6Kn4C9d9DV6BbabJXWaI9gruK6vI3PIs/J3lgxOJGaqhNXKM4L4I/Y654PoMxg8JJaLQ0RY1py+ZLYatLVJxDjsNDmdJtY59mi8hEHGtSL3xhX50mUZ8nGW5FhclHcbxCeMF5XJ1XDVZGOolOqdVZut7Y+/xqqNUyAk9mbbIsAEZjf8Gl9vdZdLlmNn9iZarH/fxLl8YnIXZUkM1odreY8PNQoMw3f7BaOIP7P4RCL4JF9upfosg8kc1EEl9Qjb9UsdmBRoo8gsgvdbszl70L49NCBk89a7Vwkslv1OlZ9OpWIGyALHV6YqfVU411o8ZXd7DH7fQmCltVgrcv9uhlQIwiPZQdKH9Zkq2w3epIeacOPpmOWZj5+fz7W49Wf8NhUZ322uUpRJBTaqH4kakZHnWeaaRnlLz9bpgSMoyGstNNu8v1d6P9KnrAUZH9B2e2a55rIWooarhqwdvhhaofYLJW5+G0UIxN3Nf3tH3+gaa1+/qbyN1uVZyNlLsCw8OExeGiFGIKf6z7tsvvZpzp9vfmpcAUVKglRJulWY9lhbN1h7R6EVcLscMV+Oot6Nj4oLb/x3MswcmQJGf9pVyQ1OX7ydnnCV+yh7d7crGlPHide60JmbyLbps0s8LawtjSdJ/EQn24rtCb7sm61MrKh671pKTDGGpv7tj/j3L31Y8NhN6/AAAACXBIWXMAAAsTAAALEwEAmpwYAAANXElEQVR42mWXh1ta2dbGDxEjkaIgSJGiIFIFGWwIiAh2BDtq7DXGsRtb7DFqNCa2WDNx1GjMRGNMMT03uel12jczt/wz39qQuXee73sf4ficc97fXmvtfQ57Ycfc8vb28/MFHQEdBXl4wMffLXRE544eccvX18/P+6svCPur32X2QHK5vP4q12mPrxhE8HYzMLfd22WHq6mp6G7s/wtOoiv+Hi4EEPzcBMxt90N2GMGrtxfTjdYFYJ7/Vzr4uEEojj+D8AbA1+hdKXsxMebo+j2RxjMAicMJ+CpdWn29zlOXhiDuMNyVAMB/h/fyYjLBvnxxJ8dI1Wg0AdT6NCMVSSORGI3GHG00lRoQ4GZ4/BkE5o1K/6e9bv27i2tlJFW9UVO3+KnVNFoqqQdz/c+/i3A4/kitHhAaDSAgChQEEDAY/igqONgli2C3+cRx+RLJ4k+zd3dw+FCJKDRU8ujGgCTUyJfXNjTo8a0/13M8MSYiIASGhu/dwJjMNLAPJMfFRZ7j8qNF9+8uX+kjhOLxeAJ+9LvvpvihoXx5YmJFbUXho3oqR9PKRGkAAfM9etS/bwNLm9q6MZDlExfpE7lE4otGS9/9o5TgEoWS8+jGjVEXoKE5sba2mY3jaEp1UAkopi8GCXhhuqmtS267j0/kOQCE1pdSiBQikREWFiagTC235qhyFLFLvw5WVFTU5jYrqZWcr7XEwM80wehTXS67GxBNAbsgjEYLBtFo660qFUWliH1y8ffmhsEKiGJEyUHrgsn0wPz9mWk796a4ic0uu0/70GOIgE8hgp1tLuruLjJbhWECAYWCAAPyoaXVBoSQCwKYOqYXALx0aRJ9XMMgAsirC4eenCMr+BRhv3JodWL48MKFQ+fE3lAwLYzhBoxUV6ckJqJyynN0MHWYP6ZLm6sYLCoMH/IZqpY/3j93giQUChIWV52/7Q9fAB3u/+rcY9NoCvbj5QG5vHmkJDIyEiHkOQgAFUyLH/mQ1V8o95GfOHfuBNeHK5wRsvacn9bWDxDgzfraonOCTYuwcj+t6/WFQ1CrSMRg5Wiwr4DYrH6f9nawT8I1H3KCkrbkfP/z3Ut1tW/etEi23m69dw4GR7C5BhmXRLIOybmuarMkGvR8eWrS4ieTJ7nIfuJUpA9Xz0pICF4tv//27YtXnLGHuKdbs2/vDx8ERxjIUinpxAkSSd/F5QKDJkGr2tMF0HNPIfspHy6JTJJFaLUju7NvL9zf0OHwmo2tC7Oz5SmGCAPXh0QCAroH1EWXaGA1eHKMafEkUlwc2BPlJ9AVWQTbIMl3Hl64++52X9/tdy8uzDoP+FKpITGwgUwic7kyMhmOJLrECAAOAkBEaPjY5HmSKwK2dGMlf/hw9sbJK1dO3pg9dB7M9ZZJDRU1ge1T61YyWSYjywBQV8/hYByqURLPPREZ5yMtK5uXka1SMgKUHlG3wzpwHh4eOocPHGMeaQDwmXjTvnZj60ssWcaSscj0ujoqAoRK4iEvdlayFUKzZSWTZVKrtNR0m3l+uy0f5Ng8r3llqgMA2aeCtHbpxfLP/TIyiyemS+qpVIyDAwBJNm+b10Nm5GQAsKTW8NIvJ9/9o0/CCA4Ok0AZrnxJK5QaWDwyuXX5xf1Ly+tlYpaYIQkFABWHr4vXTs4nhxgi2DIAZMlYUnN4aevFk9+D3r1D3ycvttYVhhvEYp6MNbr24sX95eVFFwCHw6g5rXXxEVlZtptTyQayzAUIB8DU9yfv3YMaQhXh+P0UAmQli2V6McM08OLupQF6OkOEAOrWnbp4lsJmizDIxGR9VlaEWBueUVL6ZRlZv0O6eOX7i59Kq8MjdtYWoXqydFXfvRsD0XMMkQoA+FBVXbwsOdnGEpO5k1wDi5UgLckoKv3yr0vLJ7/q4qV/PRqtLjRMzazZxDL2+7L0nI+/2IhEkQqPx/AEioiYYJu32SYn5w1iVkJEeHU1AJ788PqHP/64hPTHD69f75dWV0sj1nbYPBb3936x+GH9gpr+FSAQxSfYYBLKbFpkL6wuycgsMmkHwfaDS69f/31fb6qu7k+4qRXzWOlirozH483NAYAQ6gawEmyGhAQeTyEtLCzJKHlfNG2av/Pyt3//3aV//3b5jt5UlFHYP5PA4rFI4nQyCQg8hoifE4oRAEDUJmfN8HhKRVlhuDkjs+T9dErp0OVbHc//+T+gfz7vuPXjY1NRZkZ4/00ti8cDezqZzOMRR0XRBBcgXnFTQVMqZpLLzOaS6urptrYUk+zU9Y6Ob1zq6Lh+SmZKacsAAoqBxiOR09PFPKKIr4rGCBQAKJV0oWKmzBobXliSOV1U5EgxTd55dv30t2dB356+9hJSSHFUuWJQAILOI4vn0okiAYWAUSgCfjydr5iJSLZK+8MzMh1tjpSUFBNKoeP5t6cB0uFKobutxZGZYYYghEoenc4Tp88JBQQCFk0RCPkiEQDYXebwwmlHW/5EvqO7FVJ4/s1XPYcUWlNq89uA0GUuixC6EHQAuCMQCiF+trkktiszs6ho1RlVVbVvmvwMKZz+FnQapSBv3c/f3XMAodBstmr5fCUChBGhiPxRiD8hJEQ7vzqd2VY14QwceVLVbRpBKZxFgLPfQAojpu7pq+UTVdNFJRnhZVJ2GF9AJwrDKBRMxRAoEoJDQkKI8wcZjvzh8hh5UVVSt4n74/WOP1PouP4jt7W7qqSlfHi1LTMzsyRcalAK+HwhAwEEDBr4Y5uX9ITuYeduXldRCgKMvLx17b+z8GzJ1J1UFZ5b7NzLT/n0aPGDdEZLEwj4AgpGCXu8Nxgrb9ar9Xvlzl1LbEZbFZoF/eXnHd9A/lCHv3U8vyw3dVelVJmTip3O4fdKycf1wgiFUCgSqDAio7ameGIQFz84XF5eHpU4eJDvcFQV9Q3dOXXt7N9cOnst9468D6hVDnNLsbO8fDg/uHRnUaqAH10KRsSPb1/dS2btldcUl9e0yPNiLPmOxpJXCRV3Pr+8fg10/eXnOxUJr0oaq1Kmp80WIOyWT2SG9u30w+YBapB6ZuF8Di6luKZmtziwgji28iC3KjPk1Ya24dTnZ89u3Xr27POpBv3GK5LD0f3bm8HEwOLy4prdN1301I+LjDABFq0K8LNztAdRNcXFURY5vOipDzKrlU23U9XyhobLSA0jc6m3m1jT3Qd5ubXymKjiXRitgW2d+qiCCAhEBl9A6w6MqqmJCmxRLox7MnXsTEVq59PUhZV0EpdLEq8sND3tTLWVNDSuqFcYuYEwVE2U5cPOhl3AVyGAkBZuCYyKigqMcXAWxjnJq1VdwfVNnZ2+9oWV8+dXFvybsjuz09iZI2OVWKVnRox7sME0lRItJAKFQVfm9wAg0NKitY8vPC6Pao5lRQek+h4LCjoDOhZU0NTbK2I3R00o7JX2nCT3aBYHzfUsEGAvVhTTExgY2BPTovTCLcFUSsvYjGiNLtXDD9xn/I6mMjl4pbSsIWrYtjBOlbvuDuzJiyUyVCr0Ui3Js/T09FhiYixXB98UBzZazeZYvZZgDAhwbfSZAVRjDkMbbpipjSpeGlm6arFYANFjyWXDNhJTRSy1xFgsMXktLS0AsiRtas1dT/ZXJ5YY0ThqgE6ngd8uvlBr7RIbE+LyYGi4Nw9WS0/P1Qa5Eo9N5+bFXL2al5uU1NgYF9e+/TAstujXt7M/DU8MMuKjkeIZSiXbGttFs9eHpW/GNYKSklwuS15tBob+jWlJjGvf3H5w/ry6XhjCfnR39u3s/axo2GLSlHQaTctmW63mrhIbFR8aqj7/4MH29mZcXAX4YFwAgJJ80mG+xitT65TBIbRXv2zdHbidjZMNWdlstkFqjY017//00wctQ6eJlugqx1dgdh/EJeW2tACgEYXevq22e3mk9qYR4U1V9+jj09tPO6NDVnfz2SFWKdirf529OyAMYRiNRDo/rTfVy25Xb7e3QSqNWBskvikeS83Ozm7yqsSpc1r7OjuPdXrgQ5obIufo8KYJibXdf7t1O5sSzMBDQfFUXS/cnDom3myPa2vD2jfhl2ZMlx0EOtPU1NvXa+dEq/B0fTPLbseHsEPYbHLWLx+zC/wpNABg/k3eZ87Avdm6sXQxabMdI4vTH6o52QVwriA7u/Np7ziDpqTptQ3zlehFB9sO64ebTQV+RqgoA+/pAX1WUEFBQVDBhqf6Ybp4G0t/OKauzO5EAcDzk9pXShQw6HRacwULbfXZweyy5Bw8HseAKWFQjMyjvtAtFqDhOrMr1WMP07Ex9XhlU+fxIOgf/Zo2+npxFNRncBYW8MG0YNrozZsiHBHNJ53BIFLwAV5HfN0NZ8Hxzib7uHoMU4/b/Y6D39v3iJdnZSUuFNY2IPB4iINOx9cb1XQaA8xEIoUSjccFYB5H3IyC4wXe9ko1Von8Bd5Nvv5engFGIw6H+iwCgegWw/WHzBQCATIxwsbQ1br6+nkXHD9+zF6J2c/A0fcItMwYtKuw8HEuhovyF6EzcMXdeKKOzeOINwRxzB8DP0Tv4Wq4UY/M4biaVdx/QHjcf0SlcsDvyUTtFvRbvt5Bx4/9L+6GbM+gtlzOAAAAAElFTkSuQmCC',
      reference: null,
      reference_hash: null,
      decimals: 18,
    };
    this.owner_id = '';
  }

  @initialize({})
  init({
    owner_id,
    metadata,
  }: {
    owner_id: AccountId;
    metadata?: FungibleTokenMetadata;
  }): void {
    // Ensure the contract isn't already initialized
    if (this.owner_id !== '') {
      throw new Error('Contract is already initialized');
    }

    // Set the owner
    this.owner_id = owner_id;

    // Set initial balance for owner
    this.accounts.set(owner_id, this.totalSupply);

    // Update metadata if provided
    if (metadata) {
      this.metadata = metadata;
    }

    near.log(`Contract initialized with owner: ${owner_id}`);
  }

  @view({})
  ft_balance_of({ account_id }: { account_id: AccountId }): string {
    return this.accounts.get(account_id) || '0';
  }

  @view({})
  ft_metadata(): FungibleTokenMetadata {
    return this.metadata;
  }

  @view({})
  ft_total_supply(): string {
    return this.totalSupply;
  }

  @call({ payableFunction: true })
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
    const amount_n = BigInt(amount);

    // Assert attached deposit is at least 1 yoctoNEAR
    if (near.attachedDeposit() != BigInt(1)) {
      throw new Error('Requires attached deposit of exactly 1 yoctoNEAR');
    }

    // Check sender has sufficient balance
    const sender_balance = BigInt(this.accounts.get(sender_id) || '0');
    if (sender_balance < amount_n) {
      throw new Error('Insufficient balance');
    }

    // Update sender balance
    this.accounts.set(sender_id, (sender_balance - amount_n).toString());

    // Update receiver balance
    const receiver_balance = BigInt(this.accounts.get(receiver_id) || '0');
    this.accounts.set(receiver_id, (receiver_balance + amount_n).toString());

    // Emit standard NEP-141 event
    near.log(
      `EVENT_JSON:${JSON.stringify({
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
      })}`
    );
  }

  // Add ft_transfer_call for better wallet integration
  // Add this private helper method
  private internal_register_account(account_id: AccountId): void {
    if (!this.accounts.get(account_id)) {
      this.accounts.set(account_id, '0');
    }
  }

  @call({ payableFunction: true })
  ft_transfer_call({
    receiver_id,
    amount,
    memo,
    msg,
  }: {
    receiver_id: AccountId;
    amount: string;
    memo?: string;
    msg: string;
  }): void {
    // Assert one yoctoNEAR was attached
    if (near.attachedDeposit() != BigInt(1)) {
      throw new Error('Requires attached deposit of exactly 1 yoctoNEAR');
    }

    const sender_id = near.predecessorAccountId();
    // Register account if needed
    this.internal_register_account(receiver_id);
    // Perform the transfer
    const amount_n = BigInt(amount);
    const sender_balance = BigInt(this.accounts.get(sender_id) || '0');

    if (sender_balance < amount_n) {
      throw new Error('Insufficient balance');
    }

    this.accounts.set(sender_id, (sender_balance - amount_n).toString());
    const receiver_balance = BigInt(this.accounts.get(receiver_id) || '0');
    this.accounts.set(receiver_id, (receiver_balance + amount_n).toString());

    // Emit the transfer event
    near.log(
      `EVENT_JSON:${JSON.stringify({
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
      })}`
    );

    // Call receiver's method
    const promise = near.promiseBatchCreate(receiver_id);
    near.promiseBatchActionFunctionCall(
      promise,
      'ft_on_transfer',
      JSON.stringify({
        sender_id,
        amount,
        msg,
      }),
      0,
      30000000000000
    );
  }

  @call({ payableFunction: true })
  storage_deposit({ account_id }: { account_id?: AccountId }): StorageBalance {
    const accountId = account_id || near.predecessorAccountId();
    const deposit = near.attachedDeposit();
    const min_balance = BigInt(this.storage_balance_bounds().min);

    if (deposit < min_balance) {
      throw new Error(`Deposit must be at least ${min_balance}`);
    }

    let refund = deposit - min_balance;
    if (!this.accounts.get(accountId)) {
      this.accounts.set(accountId, '0');
    }

    if (refund > 0) {
      const promise = near.promiseBatchCreate(near.predecessorAccountId());
      near.promiseBatchActionTransfer(promise, refund);
    }

    return {
      total: min_balance.toString(),
      available: '0',
    };
  }

  @view({})
  storage_balance_bounds(): { min: string; max: string } {
    const required_storage_balance =
      BigInt(near.storageByteCost()) * BigInt(128);
    return {
      min: required_storage_balance.toString(),
      max: required_storage_balance.toString(),
    };
  }

  @view({})
  storage_balance_of({
    account_id,
  }: {
    account_id: AccountId;
  }): StorageBalance | null {
    if (!this.accounts.get(account_id)) {
      return null;
    }
    return {
      total: this.storage_balance_bounds().min,
      available: '0',
    };
  }

  // Add this method for better wallet integration
  @view({})
  ft_supports_storage_management(): boolean {
    return true;
  }

  // Add this method for better wallet integration
  @view({})
  ft_supports_transfer_call(): boolean {
    return true;
  }
}

interface StorageBalance {
  total: string;
  available: string;
}
