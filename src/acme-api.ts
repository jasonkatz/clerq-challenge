import axios, { AxiosResponse } from "axios";

const API_URL = "https://acme-payments.clerq.io/tech_assessment";

export interface MerchantDetails {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcmeMerchantDetails {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getMerchantDetails(merchantId: string) {
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
  try {
    const response = await axios.get(`${API_URL}${path}`);
    return response;
  } catch (e) {
    console.log(e);
    throw e;
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
