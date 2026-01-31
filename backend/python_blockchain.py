from web3 import Web3, EthereumTesterProvider
from eth_account import Account
import json
import os
from dotenv import load_dotenv

def setup_python_blockchain():
    # Create a local blockchain using Python's EthereumTesterProvider
    w3 = Web3(EthereumTesterProvider())
    
    print("\n=== Python Local Blockchain Setup ===")
    print(f"Connected: {w3.is_connected()}")
    print(f"Chain ID: {w3.eth.chain_id}")
    
    # Create a new account for the application
    private_key = Account.create()._private_key.hex()
    account = Account.from_key(private_key)
    
    # Get the first account from the tester (has test ETH)
    coinbase = w3.eth.accounts[0]
    
    # Fund the new account with test ETH
    tx_hash = w3.eth.send_transaction({
        'from': coinbase,
        'to': account.address,
        'value': w3.to_wei(100, 'ether')
    })
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    balance = w3.from_wei(w3.eth.get_balance(account.address), 'ether')
    
    print("\n=== Application Account ===")
    print(f"Address: {account.address}")
    print(f"Private Key: {private_key}")
    print(f"Balance: {balance} ETH")
    
    # Create or update .env file
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    env_lines = []
    
    # Read existing .env file if it exists
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            env_lines = f.readlines()
    
    # Update or add blockchain config
    config = {
        'RPC_URL': 'http://127.0.0.1:8545',
        'PRIVATE_KEY': private_key,
        'CONTRACT_ADDRESS': '0xYourContractAddress',
        'BLOCKCHAIN_ENABLED': 'true'
    }
    
    updated = False
    for i, line in enumerate(env_lines):
        for key in config:
            if line.startswith(f"{key}="):
                env_lines[i] = f"{key}={config[key]}\n"
                updated = True
    
    # Add new configs if they don't exist
    if not updated:
        env_lines.append("\n# Blockchain Configuration\n")
        for key, value in config.items():
            env_lines.append(f"{key}={value}\n")
    
    # Write back to .env
    with open(env_path, 'w') as f:
        f.writelines(env_lines)
    
    print("\n=== Configuration Updated ===")
    print(f"Updated {env_path} with blockchain settings")
    print("\nNext steps:")
    print("1. Deploy your smart contract")
    print("2. Update CONTRACT_ADDRESS in .env")
    print("3. Start your backend server")

if __name__ == "__main__":
    setup_python_blockchain()
