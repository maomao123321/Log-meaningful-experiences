import HomeIcon from '@mui/icons-material/Home';
import MicIcon from '@mui/icons-material/Mic';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Avatar, Box, Container, Grid, IconButton, Paper, TextField, Typography, Button } from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assistedDialogue, textToSpeech, summarizeConversation } from '../api';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';


const theme = createTheme({
  palette: {
    primary: {
      main: '#3a5a40', // 深绿色
    },
    background: {
      default: '#f1faee', // 淡青色背景
      paper: '#a8dadc', // 淡蓝色背景for聊天框
    },
    text: {
      primary: '#1d3557', // 深蓝色文字
    },
  },
  typography: {
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
  },
});


function EntryDetails() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [currentInput, setCurrentInput] = useState(''); 
  const mediaRecorder = useRef(null);
  const messagesEndRef = useRef(null);
  const { images, topic } = location.state || {};
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentInput]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initiateAIDialogue();
  }, []); 

  const VoiceInputContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
  });

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return '';
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };

  // AI initiate dialogue

  const initiateAIDialogue = async () => {
    const prompt = `You are an AI assistant helping a user with their diary entry. The topic of their entry is "${topic}". Based on this topic and the images they've uploaded, ask a single, short, simple question related to their experience. For example, if the topic is travel, you might ask "What was your favorite food there?" or "Who traveled with you?". Keep your question brief and conversational.`;
    const aiMessage = await assistedDialogue(prompt);
    setMessages([{ text: aiMessage, sender: 'ai' }]);
  };

  const handleSend = async () => {
    if (currentInput.trim() || audioBlob) {
      let text = currentInput.trim();
      if (audioBlob) {
        text = await transcribeAudio(audioBlob);
      }
      setMessages(prev => [...prev, { text, sender: 'user' }]);
      setCurrentInput('');
      setAudioBlob(null);

      // AI reply
      const prompt = `The user's topic is "${topic}". They just answered: "${text}". Based on this, ask another single, short, simple question related to their experience. Keep your question brief and conversational.`;
    const aiReply = await assistedDialogue(prompt);
    setMessages(prev => [...prev, { text: aiReply, sender: 'ai' }]);
  }
};

const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        recorder.start();
        setIsRecording(true);
  
        const audioChunks = [];
        recorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });
  
        recorder.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          setAudioBlob(audioBlob);
          const text = await transcribeAudio(audioBlob);
          setCurrentInput(prevInput => prevInput + ' ' + text);
        });
  
        // 添加实时转录
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.addEventListener('result', (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setCurrentInput(transcript);
        });
        recognition.start();
      });
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  const handleSpeak = async (text) => {
    const audioBlob = await textToSpeech(text);
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  };

  const handleSave = (text) => {
    // 实现保存功能
    console.log('Saving:', text);
  };

  const handleInputChange = useCallback((e) => {
    setCurrentInput(e.target.value);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({
      top: messagesEndRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  const handleHomeClick = () => {
    navigate('/home');
  };

  const handleFinishConversation = async () => {
    const summary = await summarizeConversation(topic, messages);
    const newEntry = { 
      topic: topic || 'Untitled Entry', 
      summary: {
        subTopics: summary.subTopics.map(st => ({
          title: st.title || 'Untitled Subtopic',
          summary: st.summary || 'No additional information available.'
        }))
      },
      date: new Date().toISOString() 
    };
    
    const histories = JSON.parse(localStorage.getItem('histories') || '[]');
    histories.push(newEntry);
    localStorage.setItem('histories', JSON.stringify(histories));
    navigate('/history');
  };

  return (
    <ThemeProvider theme={theme}>
    <Container maxWidth="xl" disableGutters>
    <Grid container sx={{ height: '100vh', bgcolor: 'background.default' }}>
        {/* 图片区域 */}
        <Grid item xs={2} sx={{ 
          borderRight: '1px solid #ccc',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 添加固定标题 */}
          <Box sx={{
            p: 2,
            borderBottom: '1px solid #ccc',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            fontSize: '1.9rem',
            textAlign: 'center'
          }}>
            {topic || "No Topic"}
          </Box>
          
          {/* 图片滚动区域 */}
          <Box sx={{ 
            flexGrow: 1,
            overflowY: 'auto',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            p: 2
          }}>
            {images && images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Upload ${index + 1}`}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            ))}
          </Box>
        </Grid>

{/* AI对话界面 */}
<Grid item xs={10} sx={{ display: 'flex', flexDirection: 'column', height: '100%' , bgcolor: 'background.default'}}>
  <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' , bgcolor: 'background.default'}}>

 {/* 新增的标题和Home图标区域 */}
 <Box sx={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  p: 2,
  borderBottom: '1px solid #ccc'
}}>
  <IconButton onClick={handleHomeClick} sx={{ padding: '12px' }}>
    <HomeIcon sx={{ fontSize: '3rem' }} />
  </IconButton>
  <Typography 
    variant="h4" 
    component="h2" 
    sx={{ 
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      flexGrow: 1,
      textAlign: 'center'
    }}
  >
    Tell more to AI
  </Typography>
  <Button
    onClick={handleFinishConversation}
    variant="contained"
    size="large"
    sx={{
      fontSize: '1.0rem',
      padding: '10px 20px',
      fontWeight: 'bold'
    }}
  >
    Save
  </Button>
</Box>


          {/* 消息显示区域 */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }} ref={messagesEndRef}>
            {messages.map((message, index) => (
              <Box key={index} sx={{ 
                mb: 2, 
                display: 'flex', 
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}>
                <Avatar sx={{ 
                  [message.sender === 'user' ? 'ml' : 'mr']: 2, 
                  bgcolor: message.sender === 'user' ? '#457b9d' : '#3a5a40',
                  width: 40,  // 增加头像大小
                  height: 40  // 增加头像大小 
                }}>
                  {message.sender === 'user' ? 'U' : 'AI'}
                </Avatar>
                <Paper sx={{ 
                  maxWidth: '80%', 
                  p: 2, 
                  bgcolor: message.sender === 'user' ? 'background.paper' : '#e6f3f7',
                  color: 'text.primary',
                  borderRadius: 2, 
                  fontSize: '1.4rem',
                  fontFamily: 'Georgia, serif'
                }}>
                  {message.text}
                  {message.sender === 'ai' && (
                    <Box sx={{ mt: 1 }}>
                      <IconButton size="small" onClick={() => handleSpeak(message.text)}>
                        <VolumeUpIcon fontSize="small" color="primary" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleSave(message.text)}>
                        <SaveIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>

          {/* 输入区域 */}
          <VoiceInputContainer>
            
            <TextField 
              inputRef={inputRef}
              value={currentInput} 
              onChange={handleInputChange}
              onKeyPress={handleKeyPress} 
              onBlur={() => inputRef.current && inputRef.current.focus()}
              placeholder="Start talking with your AI friend"
              fullWidth
              variant="outlined"
              InputProps={{
                style: { fontSize: '1.2rem', fontFamily: 'Georgia, serif' }
              }}
            />

            <IconButton
              size="large" 
              color={isRecording ? "secondary" : "primary"} 
              onClick={isRecording ? stopRecording : startRecording}
            >
              <MicIcon />
            </IconButton>
            <IconButton size="large" color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </VoiceInputContainer>
        </Paper>
      </Grid>
    </Grid>
  </Container>
</ThemeProvider>
  );
}

export default EntryDetails;