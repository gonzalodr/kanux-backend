export function buildNonTechnicalFeedbackPrompt(input: {
  challenge: {
    id: string;
    title: string;
    instructions?: string | null;
  };
  submission: {
    submissionId: string;
    createdAt?: Date | null;
  };
  answers: Array<{
    question_id: string;
    question_text: string;
    question_type: string;
    selected_option_id?: string | null;
    selected_option_text?: string | null;
    is_correct?: boolean | null;
  }>;
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
    "  type: 'non_technical',",
    "  title: string,",
    "  summary: string,",
    "  final_score: number,",
    "  score_breakdown: { correctness: number, reasoning: number, consistency: number },",
    "  strengths: string[],",
    "  areas_for_improvement: string[],",
    "  next_steps: string[],",
    "  answers_overview: { total: number, correct: number, incorrect: number },",
    "  per_question_feedback: Array<{ question_id: string, correct: boolean, explanation: string }>,",
    "  tags: string[],",
    "  markdown: string  // richly formatted summary suitable for display",
    "}",
  ].join("\n");

  const user = [
    `Challenge: ${input.challenge.title} (ID: ${input.challenge.id})`,
    input.challenge.instructions
      ? `Instructions: ${input.challenge.instructions}`
      : undefined,
    `Submission ID: ${input.submission.submissionId}`,
    "Answers:",
    "```json",
    JSON.stringify(input.answers, null, 2),
    "```",
    "Task: Provide structured, objective feedback as per the JSON schema. Use consistent scales (0-100) for scoring and keep the markdown concise and scannable.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
