const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateChallenge = async (
  category,
  frequency = "Daily",
  domain = "General",
  company = "General"
) => {
  const validCategories = [
    "HR",
    "Technical",
    "Aptitude",
    "Domain-Specific",
  ];

  const validFrequencies = ["Daily", "Weekly"];

  if (!validCategories.includes(category)) {
    throw new Error("Invalid challenge category");
  }

  if (!validFrequencies.includes(frequency)) {
    throw new Error("Invalid challenge frequency");
  }

  const prompt = `
You are an AI interview challenge generator.

Generate one ${frequency} interview challenge.

Category: ${category}
Domain: ${domain}
Company: ${company}

Requirements:

- The challenge must be suitable for interview preparation.
- Match the selected category.
- Make the challenge realistic and useful.
- For HR, focus on behavioral and workplace situations.
- For Technical, focus on technical concepts, implementation, or problem solving.
- For Aptitude, focus on logical reasoning, mathematics, or quantitative aptitude.
- For Domain-Specific, focus on the selected technical domain.
- Difficulty should be Medium.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include code blocks.

Return exactly this format:

{
  "title": "",
  "description": "",
  "question": "",
  "difficulty": "Medium"
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Generate the ${frequency} ${category} challenge now.`,
      },
    ],

    temperature: 0.7,
    max_tokens: 500,
  });

  const raw = completion.choices[0].message.content;

  const clean = raw
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  let challenge;

  try {
    challenge = JSON.parse(clean);
  } catch (error) {
    console.error("Challenge JSON Parse Error:", error.message);
    console.error("Groq Response:", raw);

    throw new Error("AI returned an invalid challenge format");
  }

  // Validate AI response
  if (
    !challenge.title ||
    !challenge.description ||
    !challenge.question
  ) {
    throw new Error("AI returned incomplete challenge data");
  }

  return challenge;
};

module.exports = {
  generateChallenge,
};