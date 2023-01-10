import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";

import { MerchantDetails, AcmeMerchantDetails } from "./types";

// Creating retry mechanism to re-attempt requests that time out or result in 5xx errors
axiosRetry(axios, { retries: 5 });

const REQUEST_TIMEOUT_MS = 3000;

const API_URL = "https://acme-payments.clerq.io/tech_assessment";

export async function getMerchantDetails(
  merchantId: string
): Promise<MerchantDetails> {
  const response = await executeApiGetRequest<AcmeMerchantDetails>(
    `/merchants/${merchantId}`
  );
  const { data } = response;

  return adaptMerchantDetailsResponse(data);
}

export function getMerchantTransactions(merchantId: string, upToDate: string) {
  // TODO
}

async function executeApiGetRequest<T>(
  path: string
): Promise<AxiosResponse<T>> {
  // Retry 5 times, on top of the 5 axios retries that we have setup - handles parsing errors
  for (let i = 0; i < 5; ++i) {
    try {
      const response = await axios.get(`${API_URL}${path}`, {
        timeout: REQUEST_TIMEOUT_MS,
      });
      return response;
    } catch (e) {
      console.log("API error", e);
    }
  }
}

class DataValidationError extends Error {
  constructor() {
    super();
  }
}

function adaptMerchantDetailsResponse(
  apiResponse: AcmeMerchantDetails
): MerchantDetails {
  if (
    new Date(apiResponse.created_at).toString() === "Invalid Date" ||
    new Date(apiResponse.updated_at).toString() === "Invalid Date"
  ) {
    throw new DataValidationError();
  }

  return {
    id: apiResponse.id,
    name: apiResponse.name,
    createdAt: new Date(apiResponse.created_at),
    updatedAt: new Date(apiResponse.updated_at),
  };
}
