# deploy command
near deploy hello2.baideployer.testnet build/hello_near.wasm --networkId testnet

# Check owner's balance
near view hello2.baideployer.testnet ft_balance_of '{"account_id": "hello2.baideployer.testnet"}'

# Check metadata
near view hello2.baideployer.testnet ft_metadata

# Register storage for recipient (replace 'recipient.testnet' with actual account)
near call hello2.baideployer.testnet storage_deposit '' --accountId fungible.baideployer.testnet --amount 0.00129


# Transfer 100 tokens (adjust decimals according to your token)
near call hello2.baideployer.testnet ft_transfer '{
    "receiver_id": "fungible.baideployer.testnet",
    "amount": "100000000000000000000",
    "memo": "Test transfer"
}' --accountId hello2.baideployer.testnet --amount 0.000000000000000000000001


# Check sender's new balance
near view hello2.baideployer.testnet ft_balance_of '{"account_id": "hello2.baideployer.testnet"}'

# Check recipient's new balance
near view hello2.baideployer.testnet ft_balance_of '{"account_id": "fungible.baideployer.testnet"}'


