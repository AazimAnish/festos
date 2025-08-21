import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('EventFactoryModule', m => {
  // Deploy the EventFactory contract
  const eventFactory = m.contract('EventFactory');

  // Optional: Set initial platform fee (default is 2.5%)
  // m.call(eventFactory, "updatePlatformFee", [300]); // 3%

  // Optional: Transfer ownership to a specific address if needed
  // m.call(eventFactory, "transferOwnership", ["0x..."]);

  return { eventFactory };
});
