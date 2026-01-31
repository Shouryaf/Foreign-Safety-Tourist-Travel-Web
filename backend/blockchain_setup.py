from web3 import Web3, HTTPProvider
from eth_account import Account
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_local_blockchain():
    # Connect to a local Ethereum node (Ganache)
    w3 = Web3(HTTPProvider('http://127.0.0.1:7545'))
    
    # Check if connected to Ganache
    if not w3.is_connected():
        print("Error: Could not connect to Ganache. Please make sure Ganache is running on http://127.0.0.1:7545")
        print("You can download Ganache from: https://www.trufflesuite.com/ganache")
        return
    
    # Get accounts from Ganache
    accounts = w3.eth.accounts
    
    print("\n=== Local Blockchain Setup ===")
    print(f"Connected to Ganache at http://127.0.0.1:7545")
    print(f"Network ID: {w3.net.version}")
    print(f"Current block number: {w3.eth.block_number}")
    
    # Create a new account for the application
    private_key = Account.create()._private_key.hex()
    account = Account.from_key(private_key)
    
    print("\n=== Application Account ===")
    print(f"Address: {account.address}")
    print(f"Private Key: {private_key}")
    
    # Get some test ETH from Ganache (first account is the coinbase with test ETH)
    if accounts:
        coinbase = accounts[0]
        tx_hash = w3.eth.send_transaction({
            'from': coinbase,
            'to': account.address,
            'value': w3.to_wei(100, 'ether')
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        balance = w3.from_wei(w3.eth.get_balance(account.address), 'ether')
        print(f"\nSent 100 test ETH to application account")
        print(f"New balance: {balance} ETH")
    
    print("\n=== Add to .env ===")
    print(f"RPC_URL=http://127.0.0.1:7545")
    print(f"PRIVATE_KEY={private_key}")
    print("CONTRACT_ADDRESS=0xYourContractAddress")
    
    print("\nNote: Deploy your smart contract and update CONTRACT_ADDRESS in .env")
    print("For now, you can use the above configuration to start the backend.")

if __name__ == "__main__":
    setup_local_blockchain()
