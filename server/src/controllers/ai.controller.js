const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/chat`,
      { message: message.trim() },
      { timeout: 30000 }
    );

    res.status(200).json({
      success: true,
      answer:  response.data.answer,
      sources: response.data.sources
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.'
      });
    }
    console.error('AI chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Could not get AI response. Please try again.'
    });
  }
};

module.exports = { chat };