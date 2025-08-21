import { network } from 'hardhat';

async function main() {
  const { viem } = await network.connect({
    network: 'hardhatOp',
    chainType: 'op',
  });

  console.log('Sending transaction using the OP chain type');

  const publicClient = await viem.getPublicClient();
  const [senderClient] = await viem.getWalletClients();

  console.log('Sending 1 wei from', senderClient.account.address, 'to itself');

  const l1Gas = await publicClient.estimateL1Gas({
    account: senderClient.account.address,
    to: senderClient.account.address,
    value: BigInt(1),
  });

  console.log('Estimated L1 gas:', l1Gas);

  console.log('Sending L2 transaction');
  const tx = await senderClient.sendTransaction({
    to: senderClient.account.address,
    value: BigInt(1),
  });

  await publicClient.waitForTransactionReceipt({ hash: tx });

  console.log('Transaction sent successfully');
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
