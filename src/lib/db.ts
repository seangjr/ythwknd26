import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Singleton pool-less client for serverless environments
let sql: NeonQueryFunction<false, false> | null = null;

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

/**
 * Returns a Neon serverless SQL tagged-template client.
 * Uses the DATABASE_URL environment variable.
 * Throws DatabaseConnectionError when the env var is missing.
 */
export function getClient(): NeonQueryFunction<false, false> {
  if (sql) return sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new DatabaseConnectionError(
      "DATABASE_URL is not set — cannot connect to Neon",
    );
  }

  sql = neon(url);
  return sql;
}

/**
 * Map a database error to a structured { error, message, status } object.
 * Preserves a consistent { error, message, status } shape
 * for downstream API routes.
 */
export function handleDatabaseError(error: unknown): {
  error: string;
  message: string;
  status: number;
} {
  // Missing / bad config
  if (error instanceof DatabaseConnectionError) {
    return {
      error: "Database connection error",
      message: error.message,
      status: 503, // Service Unavailable
    };
  }

  // Postgres errors from @neondatabase/serverless carry a `code` property
  if (error && typeof error === "object" && "code" in error) {
    const pgError = error as { code: string; message: string };

    switch (pgError.code) {
      // No rows (used when a single-row query returns nothing)
      case "PGRST116":
        return {
          error: "Not found",
          message: "The requested resource was not found",
          status: 404,
        };
      // Unique violation
      case "23505":
        return {
          error: "Conflict",
          message: "A record with this data already exists",
          status: 409,
        };
      // Foreign key violation
      case "23503":
        return {
          error: "Invalid reference",
          message: "The referenced record does not exist",
          status: 400,
        };
      // Connection errors
      case "08001":
      case "08006":
        return {
          error: "Database connection error",
          message: "Unable to reach the database",
          status: 503,
        };
      default:
        return {
          error: "Database error",
          message: pgError.message || "An unexpected database error occurred",
          status: 500,
        };
    }
  }

  // Unknown / generic errors
  return {
    error: "Internal server error",
    message: "An unexpected error occurred",
    status: 500,
  };
}
