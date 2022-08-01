import { KnownNetwork, knownNetworks } from "./types";

export const isKnownNetwork = (
  network: string | undefined
): network is KnownNetwork => {
  if (network === undefined) return false;
  // @ts-expect-error
  return knownNetworks.includes(network);
};
