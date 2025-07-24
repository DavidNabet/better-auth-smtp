import { authClient } from "./auth.client";

interface OTPResponse {
  data?: { status: boolean } | null;
  error?: { message: string };
}

type SuccessResponse = Pick<OTPResponse, "data">;

/**
 * Send OTP to user's email with a success message to check mail
 *
 * @returns Promise<OTPResponse>
 */
export const requestOTP = async (): Promise<OTPResponse> => {
  try {
    const response: SuccessResponse = await authClient.twoFactor.sendOtp();
    return response;
  } catch (error) {
    console.log(error);
    return { error: { message: "Failed to request OTP. Please try again." } };
  }
};
