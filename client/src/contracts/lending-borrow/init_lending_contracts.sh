#!/bin/bash

# Script to initialize lending contracts on Aptos testnet
# Make sure you have the Aptos CLI installed and configured

CONTRACT_ADDRESS="0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b"
TESTNET_URL="https://fullnode.testnet.aptoslabs.com/v1"

echo "🚀 Initializing BTC Lending Platform Contracts..."
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Network: Aptos Testnet"
echo ""

# Check if aptos CLI is configured
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Please install it first:"
    echo "   curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

# Initialize all contracts using the Move script (proper way)
echo "🔧 Initializing all contracts using Move script..."
aptos move run-script \
  --url $TESTNET_URL \
  --script-path scripts/init_contracts.move \
  --assume-yes

if [ $? -eq 0 ]; then
    echo "✅ All contracts initialized successfully!"
    echo ""
    echo "🎯 Contracts initialized:"
    echo "   ✅ Interest Rate Model"
    echo "   ✅ Collateral Vault"
    echo "   ✅ Loan Manager"
    echo "   ✅ ctrlBTC Token"
    echo "   ✅ lnBTC Token"
else
    echo "❌ Failed to initialize contracts"
    echo ""
    echo "🔍 Troubleshooting tips:"
    echo "   1. Make sure you have APT for gas fees"
    echo "   2. Check if contracts are already initialized"
    echo "   3. Verify your private key is correct"
fi

echo ""
echo "🎉 Lending contract initialization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test the contracts using the frontend"
echo "   2. Check contract states with: aptos account list --query resources --account $CONTRACT_ADDRESS"
echo "   3. Start using real contract interactions instead of simulation"