const OpenAI = require('openai');

let openai = null;

function getClient() {
  if (!openai) {
    openai = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Build a detailed prompt from assignment data and call OpenAI gpt-4o.
 * Returns the parsed JSON object matching the Result schema.
 */
async function generatePaper(assignment, modifier = 'same') {
  let distributionText = '~40% Easy, ~40% Moderate, ~20% Challenging';
  if (modifier === 'harder') {
    distributionText = '~20% Easy, ~30% Moderate, ~50% Challenging';
  } else if (modifier === 'easier') {
    distributionText = '~60% Easy, ~30% Moderate, ~10% Challenging';
  }

  const sectionDescriptions = assignment.questionTypes
    .map((qt, idx) => {
      const sectionLabel = String.fromCharCode(65 + idx); // A, B, C...
      return `Section ${sectionLabel} — "${qt.type}": ${qt.numQuestions} questions, each worth ${qt.marksPerQuestion} mark(s). Difficulty distribution: ${distributionText}.`;
    })
    .join('\n');

  const prompt = `
You are an expert exam paper creator. Generate a complete exam/assessment paper based on the following details.

Topic / Chapter / Assignment Title: ${assignment.title}
School Name: ${assignment.schoolName}
Subject: ${assignment.subject}
Class: ${assignment.className}
Total Questions: ${assignment.totalQuestions}
Total Marks: ${assignment.totalMarks}
${assignment.additionalInstructions ? `Additional Instructions from Teacher: ${assignment.additionalInstructions}` : ''}

The paper must strictly revolve around the "Topic / Chapter" provided. Do NOT ask questions outside this topic.

The paper must have the following sections:
${sectionDescriptions}

Rules:
1. Each question type from above becomes a separate section (Section A, B, C, etc.).
2. Within each section, strictly distribute difficulty as instructed (${distributionText}).
3. Question numbers must be sequential across all sections (1, 2, 3, ... not restarting per section).
4. Each question must have a "marks" field matching the marksPerQuestion for its section.
5. Provide an answer key for EVERY question. Keep answers concise but accurate.
6. Suggest a reasonable "timeAllowed" for the paper based on total marks and question count.
7. Write a brief "generalInstruction" suitable for a formal exam paper.

Return ONLY valid JSON. No markdown, no explanation, no text outside the JSON.

The JSON must match this structure exactly:
{
  "schoolName": "${assignment.schoolName}",
  "subject": "${assignment.subject}",
  "className": "${assignment.className}",
  "timeAllowed": "<e.g. 3 Hours>",
  "maximumMarks": ${assignment.totalMarks},
  "generalInstruction": "<brief exam instructions>",
  "sections": [
    {
      "title": "Section A",
      "type": "<question type>",
      "instruction": "<section-level instruction>",
      "questions": [
        {
          "number": 1,
          "text": "<question text>",
          "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"], // Include ONLY if it is a Multiple Choice Question, otherwise omit or leave empty array
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": <marks>
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "<concise answer>"
    }
  ]
}
`.trim();

  const response = await getClient().chat.completions.create({
    model: process.env.LLM_MODEL || 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert examination paper creator. Always respond with valid JSON only. No markdown fences, no explanations.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 8000,
  });

  let raw = response.choices[0].message.content || '';

  // Strip any markdown code fences the model might add
  raw = raw.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    const finishReason = response.choices[0].finish_reason;
    if (finishReason === 'length') {
      throw new Error('length_limit');
    }
    parsed = JSON.parse(raw);
  } catch (err) {
    if (err.message === 'length_limit' || err instanceof SyntaxError) {
      throw new Error('This is just for testing purpose. Please generate fewer questions or sections, as API costs are not cheap and the large output reached the AI token limit.');
    }
    throw new Error(`LLM returned invalid JSON: ${err.message}\nRaw output: ${raw.substring(0, 500)}`);
  }

  // Validate required fields
  if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('LLM response missing "sections" array.');
  }
  if (!parsed.answerKey || !Array.isArray(parsed.answerKey) || parsed.answerKey.length === 0) {
    throw new Error('LLM response missing "answerKey" array.');
  }

  return parsed;
}

module.exports = { generatePaper };
