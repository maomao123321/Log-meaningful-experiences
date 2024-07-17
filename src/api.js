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
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system", 
              content: `You are tasked with summarizing a conversation about "${topic}" into exactly 3 subtopics. For each subtopic:
              1. Provide a short, descriptive title (maximum 5 words) that reflects the user's perspective.
              2. Write a concise summary (2-3 sentences) in the first person, as if the user is speaking. Use "I" statements.
              3. Focus strictly on the content of the user's responses. Do not introduce new information or questions.
              4. Use simple language and incorporate key phrases or terms from the user's original responses.
              5. Ensure each subtopic covers a distinct aspect of the user's experience or thoughts.
              
              Format your response as: 
              Subtopic 1: [Title]
              Summary: [2-3 sentence summary in first person]
  
              Subtopic 2: [Title]
              Summary: [2-3 sentence summary in first person]
  
              Subtopic 3: [Title]
              Summary: [2-3 sentence summary in first person]`
            },
            ...messages.map(m => ({role: m.sender === 'user' ? 'user' : 'assistant', content: m.text}))
          ],
          temperature: 0.5, // Lowered for more focused responses
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const summaryText = response.data.choices[0].message.content;
      const subTopics = parseSubTopics(summaryText);
  
      return { subTopics: subTopics.slice(0, 3) };
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return {
        subTopics: [
          { title: 'Error', summary: 'Failed to generate summary. Please try again.' },
          { title: 'Error', summary: 'Failed to generate summary. Please try again.' },
          { title: 'Error', summary: 'Failed to generate summary. Please try again.' }
        ]
      };
    }
  };
  
  const parseSubTopics = (summaryText) => {
    const subTopics = [];
    const regex = /Subtopic \d+: (.*?)\nSummary: ([\s\S]*?)(?=\n\nSubtopic|$)/g;
    let match;
  
    while ((match = regex.exec(summaryText)) !== null) {
      subTopics.push({
        title: match[1].trim(),
        summary: match[2].trim()
      });
    }
  
    while (subTopics.length < 3) {
      subTopics.push({
        title: `Additional Thought ${subTopics.length + 1}`,
        summary: 'I didn\'t provide more information on this point.'
      });
    }
  
    return subTopics;
  };