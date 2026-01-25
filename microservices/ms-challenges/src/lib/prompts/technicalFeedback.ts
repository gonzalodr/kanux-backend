export function buildTechnicalFeedbackPrompt(input: {
  challenge: {
    id: string;
    title: string;
    description?: string | null;
    difficulty?: string | null;
    duration_minutes?: number | null;
  };
  submission: {
    submissionId: string;
    language?: string | null;
    sourceCode: string;
    createdAt?: Date | null;
  };
  testResult?: {
    status: string;
    summary?: string;
    passed?: number;
    failed?: number;
    total?: number;
    details?: any;
  };
}) {
  const system = [
    "You are Molmo2 8B (free), a large language model from allenai.",
    "Follow these formatting rules:",
    "- Use Markdown for lists, tables, and styling.",
    "- Use ```code fences``` for all code blocks.",
    "- Format file names, paths, and function names with inline-code backticks.",
    "- For all mathematical expressions, use dollar-sign delimiters ($...$ for inline, $$...$$ for blocks).",
    "- For responses with many sections, you may use collapsible sections (HTML details/summary) if needed.",
    "Critical: Respond ONLY with a single JSON object matching the schema below. Do not include any text outside the JSON.",
    "Schema:",
    "{",
    "  type: 'technical',",
    "  title: string,",
    "  summary: string,",
    "  final_score: number,",
    "  score_breakdown: { tests: number, code_quality: number, robustness: number },",
    "  strengths: string[],",
    "  areas_for_improvement: string[],",
    "  next_steps: string[],",
    "  tests: { total: number, passed: number, failed: number, details?: any },",
    "  code_quality: { readability: number, efficiency: number, edge_cases: number },",
    "  tags: string[],",
    "  markdown: string  // richly formatted summary suitable for display",
    "}",
  ].join("\n");

  const user = [
    `Challenge: ${input.challenge.title} (ID: ${input.challenge.id})`,
    input.challenge.description
      ? `Description: ${input.challenge.description}`
      : undefined,
    input.challenge.difficulty
      ? `Difficulty: ${input.challenge.difficulty}`
      : undefined,
    input.challenge.duration_minutes
      ? `Duration (min): ${input.challenge.duration_minutes}`
      : undefined,
    `Submission ID: ${input.submission.submissionId}`,
    input.submission.language
      ? `Language: ${input.submission.language}`
      : undefined,
    `Source Code:`,
    "```",
    input.submission.sourceCode,
    "```",
    input.testResult
      ? `Test Result Status: ${input.testResult.status}`
      : undefined,
    input.testResult?.summary
      ? `Summary: ${input.testResult.summary}`
      : undefined,
    input.testResult
      ? `Passed: ${input.testResult.passed ?? 0}, Failed: ${input.testResult.failed ?? 0}, Total: ${input.testResult.total ?? 0}`
      : undefined,
    input.testResult?.details
      ? `Details: ${JSON.stringify(input.testResult.details).slice(0, 20000)}`
      : undefined,
    "Task: Provide structured, objective feedback as per the JSON schema. Use consistent scales (0-100) for scoring and keep the markdown concise and scannable.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
