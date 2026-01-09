/**
 * Production-grade model router for your ATS.
 *
 * Responsibilities:
 * - Route "auto" intelligently based on task type
 * - Provide fallbacks if a model is unavailable
 * - Allow explicit overrides
 * - Centralize all model names in one place
 */

type TaskType =
  | "intake"
  | "summarization"
  | "scoring"
  | "classification"
  | "extraction"
  | "reasoning"
  | "fast"
  | "cheap"
  | "deep";

interface ModelRouterOptions {
  task?: TaskType;
  override?: string;
}

export function chooseModel(options: ModelRouterOptions = {}) {
  const { task = "fast", override } = options;

  // Explicit override always wins
  if (override) return override;

  // Task-based routing
  switch (task) {
    case "intake":
    case "extraction":
      // Structured JSON extraction
      return "gpt-4o-mini";

    case "summarization":
    case "classification":
      // Fast, cheap, high-throughput
      return "gpt-4o-mini";

    case "scoring":
      // Slightly deeper reasoning but still fast
      return "gpt-4o";

    case "reasoning":
      // Heavy reasoning tasks
      return "gpt-4.1";

    case "deep":
      // Maximum quality
      return "gpt-4.1";

    case "cheap":
      return "gpt-4o-mini";

    case "fast":
    default:
      return "gpt-4o-mini";
  }
}
