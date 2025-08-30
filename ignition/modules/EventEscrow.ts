import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EventEscrowModule", (m) => {
  const eventEscrow = m.contract("EventEscrow");

  return { eventEscrow };
});

