from web3 import Web3, EthereumTesterProvider

def test_blockchain_connection():
    # Initialize Web3 with the local Ethereum tester
    w3 = Web3(EthereumTesterProvider())
    
    # Test connection
    is_connected = w3.is_connected()
    print(f"Connected to blockchain: {is_connected}")
    
    if is_connected:
        # Display some blockchain info
        print(f"Chain ID: {w3.eth.chain_id}")
        print(f"Latest block: {w3.eth.block_number}")
        
        # Display test accounts and balances
        print("\nTest accounts:")
        for i, account in enumerate(w3.eth.accounts):
            balance = w3.from_wei(w3.eth.get_balance(account), 'ether')
            print(f"Account {i}: {account} - Balance: {balance} ETH")
        
        print("\n✅ Blockchain is working correctly!")
    else:
        print("❌ Could not connect to the blockchain")

if __name__ == "__main__":
    test_blockchain_connection()
