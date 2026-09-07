const OLLAMA_URL =
  "http://127.0.0.1:11434/api/chat";

const MODEL_NAME =
  "qwen2.5:3b";

const generateAIResponse = async ({
  message,
  context = {},
}) => {
  if (
    !message ||
    !message.trim()
  ) {
    throw new Error(
      "Message is required"
    );
  }

  const systemPrompt = `
You are panDA, the intelligent learning companion inside CampusOS.

Help students learn, understand concepts, plan their work, and use their
CampusOS academic information.

RULES:
- Be accurate and concise.
- Explain difficult concepts simply.
- Never invent CampusOS data.
- Use CampusOS context when relevant.
- For general knowledge, answer normally.
- For personal academic information, use only the provided context.
- Encourage the student when appropriate.
- Never claim access to unavailable information.

CampusOS context:
${JSON.stringify(
  context,
  null,
  2
)}
`;

  const response =
    await fetch(
      OLLAMA_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model:
            MODEL_NAME,

          stream: false,

          /*
           * Keep the model loaded in
           * Ollama memory for faster
           * subsequent requests.
           */
          keep_alive: "10m",

          /*
           * Faster, concise generation.
           */
          options: {
            temperature: 0.3,
            num_predict: 256,
          },

          messages: [
            {
              role: "system",
              content:
                systemPrompt,
            },

            {
              role: "user",
              content:
                message.trim(),
            },
          ],
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Ollama request failed: ${errorText}`
    );
  }

  const data =
    await response.json();

  return {
    message:
      data.message?.content ||
      "Sorry, I could not generate a response.",

    model:
      MODEL_NAME,
  };
};

module.exports = {
  generateAIResponse,
};