import anyTest from 'ava';
import { Worker } from 'near-workspaces';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // temp fix for node >v17

/**
 *  @typedef {import('near-workspaces').NearAccount} NearAccount
 *  @type {import('ava').TestFn<{worker: Worker, accounts: Record<string, NearAccount>}>}
 */
const test = anyTest;

test.beforeEach(async (t) => {
  // Create sandbox
  const worker = (t.context.worker = await Worker.init());

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('test-account');

  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // Save state for test runs, it is unique for each test
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('returns the default total supply', async (t) => {
  const { contract } = t.context.accounts;
  const totalSupply = await contract.view('ft_total_suppy', {});
  t.is(totalSupply, '0');
});

test('returns the default token metadata', async (t) => {
  const { contract } = t.context.accounts;
  const metadata = await contract.view('ft_metadata', {});
  t.is('metadata', metadata, '0');
});

test('mint the token', async (t) => {
  const { root, contract } = t.context.accounts;
  await root.call(contract, 'ft_mint', {
    accounr_id: 'baideployer.testnet',
    amount: '100000000000000000',
  });
  const totalSupply = await contract.view('ft_total_supply', {});
  t.is('The total supply after mint:', totalSupply, 'boss dev test');
});

test('changes the greeting', async (t) => {
  const { root, contract } = t.context.accounts;
  await root.call(contract, 'set_greeting', { greeting: 'Howdy' });
  const greeting = await contract.view('get_greeting', {});
  t.is(greeting, 'boss dev');
});
