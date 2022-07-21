import { HTTPError } from "got";
import { topTokenApiClient } from "../client";

export interface IsScamResponse {
  status: "success" | string;
  _data?: {
    address: string;
    network: string;
    isDisableScam: number;
    isBlacklistScam: number;
    isMintScam: number;
    isRugpull: number;
    isFeeScam: number;
    isMaxTXScam: number;
    isScam: number;
    createdAt: string;
  };
}

export const getIsScam = async (address: string): Promise<boolean> => {
  try {
    const response = await topTokenApiClient
      .get(`offer/scamCheck?contract=${address}&network=binance`)
      .json<{ status: "success" | any }>();
  } catch (e) {
    // The scamCheck API seems to return 401 if the token is a scam.
    if (e instanceof HTTPError && e.response.statusCode === 401) return true;
    throw e;
  }
};
