// Aptos Contract Configuration
// This file contains the deployed contract addresses and configuration for Aptos testnet

export const APTOS_NETWORK = "testnet";
export const APTOS_RPC_URL = "https://fullnode.testnet.aptoslabs.com/v1";
export const APTOS_EXPLORER_URL = "https://explorer.aptoslabs.com";

// Deployed contract address (your account)
export const CONTRACT_ADDRESS = "0x5e25225f13c79a741fa58f8db5c6c8aa4da5f5113553592c797a8d1588ddf01b";

// Yield Optimizer Contracts (INITIALIZED and READY)
export const APTOS_CONTRACT_ADDRESSES = {
  // Core Yield Tokenization
  YIELD_TOKENIZATION: `${CONTRACT_ADDRESS}::yield_tokenization`,
  STANDARDIZED_WRAPPER: `${CONTRACT_ADDRESS}::standardized_wrapper`,
  
  // Tokens
  PT_TOKEN: `${CONTRACT_ADDRESS}::pt_token`,
  YT_TOKEN: `${CONTRACT_ADDRESS}::yt_token`,
  
  // Infrastructure
  PRICE_ORACLE: `${CONTRACT_ADDRESS}::price_oracle`,
  STAKING_DAPP: `${CONTRACT_ADDRESS}::staking_dapp`,
  SIMPLE_AMM: `${CONTRACT_ADDRESS}::simple_amm`,
  YT_AUTO_CONVERTER: `${CONTRACT_ADDRESS}::yt_auto_converter`,
  
  // Lending Contracts (DEPLOYED - Ready for initialization)
  INTEREST_RATE_MODEL: `${CONTRACT_ADDRESS}::interest_rate_model`,
  COLLATERAL_VAULT: `${CONTRACT_ADDRESS}::collateral_vault`,
  LOAN_MANAGER: `${CONTRACT_ADDRESS}::loan_manager`,
  CTRL_BTC_TOKEN: `${CONTRACT_ADDRESS}::ctrl_btc_token`,
  LN_BTC_TOKEN: `${CONTRACT_ADDRESS}::ln_btc_token`,
  XBTC_TOKEN: `${CONTRACT_ADDRESS}::xbtc_token`,
} as const;

// Contract Function Names
export const APTOS_FUNCTIONS = {
  // Yield Tokenization
  YIELD_TOKENIZATION: {
    INITIALIZE: "initialize",
    CREATE_PT_YT: "create_pt_yt",
    MINT_PT: "mint_pt",
    MINT_YT: "mint_yt",
    BURN_PT: "burn_pt",
    BURN_YT: "burn_yt",
  },
  
  // Standardized Wrapper
  STANDARDIZED_WRAPPER: {
    INITIALIZE: "initialize",
    WRAP_TOKENS: "wrap_tokens",
    UNWRAP_TOKENS: "unwrap_tokens",
    SET_YIELD_RATE: "set_yield_rate",
  },
  
  // Simple AMM
  SIMPLE_AMM: {
    INITIALIZE: "initialize",
    ADD_LIQUIDITY: "add_liquidity",
    REMOVE_LIQUIDITY: "remove_liquidity",
    SWAP_A_FOR_B: "swap_a_for_b",
    SWAP_B_FOR_A: "swap_b_for_a",
  },
  
  // Price Oracle
  PRICE_ORACLE: {
    INITIALIZE: "initialize",
    UPDATE_PRICE: "update_price",
    GET_PRICE: "get_price",
  },
  
  // YT Auto Converter
  YT_AUTO_CONVERTER: {
    INITIALIZE: "initialize",
    EXECUTE_CONVERSION: "execute_conversion",
    ADD_MATURITY: "add_maturity",
  },
  
  // Lending Functions
  COLLATERAL_VAULT: {
    INITIALIZE: "initialize",
    DEPOSIT_COLLATERAL: "deposit_collateral",
    WITHDRAW_COLLATERAL: "withdraw_collateral",
    LOCK_COLLATERAL: "lock_collateral",
    UNLOCK_COLLATERAL: "unlock_collateral",
  },
  
  LOAN_MANAGER: {
    INITIALIZE: "initialize",
    CREATE_LOAN: "create_loan",
    REPAY_LOAN: "repay_loan",
    LIQUIDATE_LOAN: "liquidate_loan",
  },
  
  INTEREST_RATE_MODEL: {
    INITIALIZE: "initialize",
    GET_INTEREST_RATE: "get_interest_rate",
    UPDATE_INTEREST_RATE: "update_interest_rate",
  },
} as const;

// Token Metadata
export const APTOS_TOKEN_METADATA = {
  PT_TOKEN: {
    name: "PT Token",
    symbol: "PT",
    decimals: 8,
    description: "Principal Token for Yield Farming",
  },
  YT_TOKEN: {
    name: "YT Token", 
    symbol: "YT",
    decimals: 8,
    description: "Yield Token for Yield Farming",
  },
  SY_TOKEN: {
    name: "SY Token",
    symbol: "SY", 
    decimals: 8,
    description: "Standardized Yield Token",
  },
} as const;

// Network Configuration
export const APTOS_CONFIG = {
  network: APTOS_NETWORK,
  rpcUrl: APTOS_RPC_URL,
  explorerUrl: APTOS_EXPLORER_URL,
  contractAddress: CONTRACT_ADDRESS,
  contracts: APTOS_CONTRACT_ADDRESSES,
  functions: APTOS_FUNCTIONS,
  tokens: APTOS_TOKEN_METADATA,
} as const;

export default APTOS_CONFIG;