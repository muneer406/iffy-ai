import { z } from "zod";
import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

/**
 * Validates raw AI output against a Zod schema.
 *
 * Returns the parsed, typed value on success.
 * Throws AppError with detailed issues on failure so the repair layer can act.
 */
export function validateOutput<T>(
  schema: z.ZodType<T>,
  rawData: unknown,
  endpoint: string,
  attempt: number
): T {
  const result = schema.safeParse(rawData);

  if (result.success) {
    return result.data;
  }

  // Extract human-readable issue list
  const issues = result.error.issues.map(
    (e) => `[${e.path.map(String).join(".")}] ${e.message}`
  );

  logger.validationFail({ endpoint, issues, attempt });

  throw new AppError(
    "validation_error",
    `Schema validation failed for ${endpoint}`,
    422,
    issues
  );
}
