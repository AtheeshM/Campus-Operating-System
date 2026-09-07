const {
  generateAIResponse,
} = require("../services/aiService");

const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await generateAIResponse({
      message,
      context: context || {},
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate AI response",
    });
  }
};

module.exports = {
  chatWithAI,
};