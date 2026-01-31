from web3 import Web3, EthereumTesterProvider
import json

# Create a local blockchain
w3 = Web3(EthereumTesterProvider())

# Check if connected
print(f"Connected to local blockchain: {w3.is_connected()}")

# Get account information
accounts = w3.eth.accounts
print("\nAvailable accounts:")
for i, account in enumerate(accounts):
    print(f"{i}: {account}")

# Get the first account's private key (for development only!)
# In a real application, never expose private keys in code
private_key = w3.eth.account.create()._private_key.hex()
print(f"\nGenerated private key (for development only!): {private_key}")

# Environment variables for your .env file
print("\nAdd these to your .env file:")
print("RPC_URL=http://127.0.0.1:8545")
print(f"PRIVATE_KEY={private_key}")
print("CONTRACT_ADDRESS=0xYourContractAddress")

print("\nTo deploy a contract, you'll need to update CONTRACT_ADDRESS with the deployed contract's address.")
print("For now, you can use the above configuration to start the backend.")
