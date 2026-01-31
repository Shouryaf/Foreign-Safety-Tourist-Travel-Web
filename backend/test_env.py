import sys
import os

def test_environment():
    with open('test_output.txt', 'w') as f:
        # Test Python version
        f.write(f"Python Version: {sys.version}\n\n")
        
        # Test imports
        try:
            import web3
            f.write("✅ web3 is installed\n")
            f.write(f"web3 version: {web3.__version__}\n\n")
            
            # Test Web3 connection
            from web3 import Web3, EthereumTesterProvider
            w3 = Web3(EthereumTesterProvider())
            f.write(f"Web3 connected: {w3.is_connected()}\n")
            if w3.is_connected():
                f.write(f"Chain ID: {w3.eth.chain_id}\n")
                f.write(f"Block number: {w3.eth.block_number}\n")
                f.write(f"Accounts: {len(w3.eth.accounts)}\n")
        except ImportError as e:
            f.write(f"❌ Error importing web3: {e}\n")
        except Exception as e:
            f.write(f"❌ Error with Web3: {e}\n")
        
        # List installed packages
        try:
            import pkg_resources
            f.write("\nInstalled packages related to blockchain:\n")
            for pkg in ['web3', 'eth-account', 'eth-tester', 'eth-utils']:
                try:
                    version = pkg_resources.get_distribution(pkg).version
                    f.write(f"- {pkg}: {version}\n")
                except:
                    f.write(f"- {pkg}: Not installed\n")
        except Exception as e:
            f.write(f"\nError checking installed packages: {e}\n")

if __name__ == "__main__":
    test_environment()
