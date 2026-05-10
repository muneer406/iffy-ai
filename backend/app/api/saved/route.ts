import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { savedScenarios } from "../../../lib/mock-data";

export async function GET() {
  try {
    const response = successResponse(savedScenarios);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (err) {
    const response = handleApiError(err);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }
}

export async function OPTIONS() {
  return handleOptions();
}
