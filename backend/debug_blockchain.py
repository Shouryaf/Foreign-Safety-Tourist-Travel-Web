import sys
import traceback
from web3 import Web3, EthereumTesterProvider

def debug_blockchain():
    print("=== Blockchain Debug Information ===\n")
    
    try:
        # Test basic Web3 installation
        print("1. Testing Web3 import...", end=" ")
        from web3 import __version__ as web3_version
        print(f"✅ Web3 version: {web3_version}")
        
        # Test EthereumTesterProvider
        print("2. Initializing EthereumTesterProvider...", end=" ")
        w3 = Web3(EthereumTesterProvider())
        print("✅ Initialized")
        
        # Test connection
        print("3. Testing connection...", end=" ")
        is_connected = w3.is_connected()
        print(f"✅ Connected: {is_connected}")
        
        if is_connected:
            # Get chain information
            print("4. Getting chain information...")
            try:
                chain_id = w3.eth.chain_id
                block_number = w3.eth.block_number
                print(f"   - Chain ID: {chain_id}")
                print(f"   - Latest block: {block_number}")
                
                # List accounts
                print("5. Listing test accounts...")
                accounts = w3.eth.accounts
                if accounts:
                    for i, account in enumerate(accounts[:3]):  # Show first 3 accounts
                        balance = w3.from_wei(w3.eth.get_balance(account), 'ether')
                        print(f"   - Account {i}: {account} - Balance: {balance} ETH")
                    if len(accounts) > 3:
                        print(f"   - ... and {len(accounts) - 3} more accounts")
                else:
                    print("   ❌ No accounts found")
                
                print("\n✅ Blockchain is working correctly!")
                
            except Exception as e:
                print(f"❌ Error getting chain info: {str(e)}")
                print("\nDebug Info:")
                print(f"- Web3 provider: {w3.provider}")
                print(f"- Middleware: {w3.middleware_onion}")
        
    except ImportError as e:
        print(f"❌ Import Error: {str(e)}")
        print("\nPlease install the required packages:")
        print("pip install web3 eth-account python-dotenv eth-tester")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        print("\nStack trace:")
        traceback.print_exc()

if __name__ == "__main__":
    debug_blockchain()
