// Aptos Client Configuration
// This file sets up the Aptos client for interacting with deployed contracts

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { APTOS_CONFIG, CONTRACT_ADDRESS } from "../config/aptos";

// Create Aptos client instance
const aptosConfig = new AptosConfig({
  network: APTOS_CONFIG.network as Network,
  fullnode: APTOS_CONFIG.rpcUrl,
});

export const aptosClient = new Aptos(aptosConfig);

// Helper function to get account resources
export const getAccountResources = async (address: string) => {
  try {
    const resources = await aptosClient.getAccountResources({
      accountAddress: address,
    });
    return resources;
  } catch (error) {
    console.error("Error fetching account resources:", error);
    return [];
  }
};

// Helper function to get account resource by type
export const getAccountResource = async (address: string, resourceType: string) => {
  try {
    const resource = await aptosClient.getAccountResource({
      accountAddress: address,
      resourceType,
    });
    return resource;
  } catch (error) {
    console.error(`Error fetching resource ${resourceType}:`, error);
    return null;
  }
};

// Helper function to get token balance
export const getTokenBalance = async (address: string, tokenType: string) => {
  try {
    // Use the correct API method for getting fungible asset balances
    const response = await aptosClient.getAccountResource(
      address,
      `0x1::coin::CoinStore<${tokenType}>`
    );
    
    if (response && response.data) {
      return (response.data as any).coin?.value || "0";
    }
    return "0";
  } catch (error) {
    console.error(`Error fetching token balance for ${tokenType}:`, error);
    return "0";
  }
};

// Helper function to simulate transaction
export const simulateTransaction = async (transaction: any) => {
  try {
    const result = await aptosClient.simulateTransaction({
      transaction,
    });
    return result;
  } catch (error) {
    console.error("Error simulating transaction:", error);
    throw error;
  }
};

// Helper function to submit transaction
export const submitTransaction = async (transaction: any) => {
  try {
    const result = await aptosClient.submitTransaction({
      transaction,
    });
    return result;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw error;
  }
};

// Helper function to get full function ID
export const getAptosFullFunctionId = (moduleName: string, functionName: string) => {
  return `${CONTRACT_ADDRESS}::${moduleName}::${functionName}`;
};

// Helper function to get contract address
export const getAptosContractAddress = (moduleName: string) => {
  return `${CONTRACT_ADDRESS}::${moduleName}`;
};

export default aptosClient;