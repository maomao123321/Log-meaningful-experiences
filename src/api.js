import OpenAI from 'openai';
import axios from 'axios';


const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

// 文本处理函数
export const processText = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
};

// AI辅助对话
export const assistedDialogue = async (userInput) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant for a diary app." },
        { role: "user", content: userInput }
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in assisted dialogue:', error);
    throw error;
  }
};

// 生成次主题
// export const generateSubtopics = async (mainTopic) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "Generate subtopics for the given main topic." },
//         { role: "user", content: `Main topic: ${mainTopic}` }
//       ],
//     });
//     return response.choices[0].message.content.split('\n');
//   } catch (error) {
//     console.error('Error generating subtopics:', error);
//     throw error;
//   }
// };

// 生成摘要
// export const generateSummary = async (text) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "Summarize the following text." },
//         { role: "user", content: text }
//       ],
//     });
//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error('Error generating summary:', error);
//     throw error;
//   }
// };

// 语音识别
export const speechToText = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const response = await openai.audio.transcriptions.create({
      file: formData.get('file'),
      model: 'whisper-1',
    });

    return response.text;
  } catch (error) {
    console.error('Error in speech recognition:', error);
    throw error;
  }
};

// 文本转语音
export const textToSpeech = async (text) => {
  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        text: text,
        voice_settings: {
          stability: 0,
          similarity_boost: 0
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return new Blob([response.data], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
};

  // AI to summarize

  export const summarizeConversation = async (topic, messages) => {
    try {
      console.log('Summarizing conversation:', topic, messages);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: `Summarize the following conversation about ${topic} into only 3 subtopics. For each subtopic, provide a title and a very brief summary,very simple sentences. Try to use the original words and phrases from the conversation. `},
            ...messages.map(m => ({role: m.sender === 'user' ? 'user' : 'assistant', content: m.text}))
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('API response:', response.data);
      const summaryText = response.data.choices[0].message.content;
      console.log('Summary text:', summaryText);
      const subTopics = parseSubTopics(summaryText);
      console.log('Parsed subtopics:', subTopics);
  
      return { subTopics };
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return { subTopics: [] };
    }
  };
  


  const parseSubTopics = (summaryText) => {
    console.log('Parsing summary text:', summaryText);
    const lines = summaryText.split('\n');
    const subTopics = [];
    let currentTopic = null;
  
    for (const line of lines) {
      if (line.toLowerCase().includes('subtopic:') || line.match(/^\d+\./)) {
        if (currentTopic) subTopics.push(currentTopic);
        currentTopic = { title: line.replace(/^(Subtopic:|)\d+\.?\s*/, '').trim(), summary: '' };
      } else if (currentTopic) {
        currentTopic.summary += line.trim() + ' ';
      }
    }
    if (currentTopic) subTopics.push(currentTopic);
  
    console.log('Parsed subtopics:', subTopics);
    return subTopics;
  };