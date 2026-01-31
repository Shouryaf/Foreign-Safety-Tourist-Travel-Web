import sys

def main():
    print("Python Environment Test")
    print("=====================")
    print(f"Python version: {sys.version}")
    print("\nTesting blockchain connection...")
    
    try:
        from web3 import Web3, EthereumTesterProvider
        print("✅ Web3 package is installed")
        
        w3 = Web3(EthereumTesterProvider())
        print(f"✅ EthereumTesterProvider initialized")
        
        is_connected = w3.is_connected()
        print(f"✅ Connection status: {is_connected}")
        
        if is_connected:
            print(f"✅ Chain ID: {w3.eth.chain_id}")
            print(f"✅ Block number: {w3.eth.block_number}")
            print(f"✅ Accounts: {len(w3.eth.accounts)}")
            
    except ImportError as e:
        print(f"❌ Error: {e}")
        print("\nPlease install the required packages:")
        print("pip install web3 eth-account python-dotenv eth-tester")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
