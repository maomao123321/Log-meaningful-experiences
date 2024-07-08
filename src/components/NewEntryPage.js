import { AddCircle, Mic, Send } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, TextField, Typography, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { speechToText } from '../api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3a5a40', // 深绿色
    },
    background: {
      default: '#f1faee', // 淡青色背景
    },
    text: {
      primary: '#1d3557', // 深蓝色文字
    },
  },
  typography: {
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
    h2: {
      fontWeight: 700,
    },
  },
});

const PageContainer = styled('div')(({ theme }) => ({
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  fontSize: '1.2rem',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const TopicDisplayContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '30%',
  left: '45%', // 将左侧位置调整为30%
  transform: 'translate(-50%, -50%)',
  width: '48%', // 减小宽度以为ActionContainer留出空间
  height: '150px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  [theme.breakpoints.up('md')]: {
    left: '45%',
    width: '48%',
  },
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '30%', // 与TopicDisplayContainer对齐
  right: '14%', // 将右侧位置调整为10%
  transform: 'translateY(-50%)', // 垂直居中
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  [theme.breakpoints.up('md')]: {
    left: 'auto',
    right: '14%',
    transform: 'translateY(-50%)',
  },
}));

const ImageDisplayContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: '20px',
  position: 'fixed',
  top: '45%',  // 调整这个值以适应您的布局
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80%',
  maxHeight: '30vh',
  overflowY: 'auto'
});

const ConfirmButtonContainer = styled(Box)({
  position: 'fixed',
  bottom: '90px', // 调整这个值以确保在 VoiceInputContainer 上方
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80%',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px',
});

const VoiceInputContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  display: 'flex',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: theme.palette.background.paper,
}));

function NewEntryPage() {
  const [topic, setTopic] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();
  
  const canConfirm = topic.trim() !== '' && uploadedImages.length > 0;
  const hasUploadedImages = uploadedImages.length > 0;



  const handleImageUpload = () => {
    const presetImages = [
      '/1.jpg',
      '/2.jpg',
      '/3.jpg',
      '/4.jpg'
    ];
    setUploadedImages(presetImages);
  };
  
  const handleConfirm = () => {
    // 这里可以添加保存数据的逻辑
    // 然后导航到 EntryDetails 页面
    navigate('/entry-details', { state: { images: uploadedImages, topic: topic } });
  };
  



  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        audioChunks.current = [];
        const text = await speechToText(audioBlob);
        setCurrentInput(text);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (currentInput.trim()) {
      setTopic(currentInput.trim());
      setCurrentInput('');
    }
  };


  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <PageContainer>
     <Typography variant="h2" style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>
      Log New Diary
     </Typography>


      <TopicDisplayContainer elevation={3}>
       {topic ? topic : <Typography color="text.secondary" style={{ fontSize: 'inherit' }}>Your Topic</Typography>}
      </TopicDisplayContainer>  

      <ActionContainer>
        <IconButton size="large" onClick={handleImageUpload}>
          <AddCircle style={{ fontSize: isMdUp ? '4rem' : '3rem' }} />
        </IconButton>
        <Typography variant={isMdUp ? "h6" : "body1"} style={{ marginTop: '10px' }}>
          Please upload photos
        </Typography>
      </ActionContainer>
      
      <ImageDisplayContainer>
      {uploadedImages.map((img, index) => (
        <img 
          key={index} 
          src={img} 
          alt={`Uploaded ${index + 1}`} 
          style={{ width: '200px', height: '150px', objectFit: 'cover', margin: '5px' }} 
        />
      ))}
    </ImageDisplayContainer>

<ConfirmButtonContainer>
<Button 
  variant="contained"
  color="primary"
  disabled={!canConfirm}
  onClick={handleConfirm}
  sx={{ 
    fontSize: '1.5rem', 
    padding: '15px 50px',
    borderRadius: '30px',
    backgroundColor: canConfirm ? 'primary.main' : '#9e9e9e',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: canConfirm ? 'primary.dark' : '#9e9e9e',
    },
    '&.Mui-disabled': {
      backgroundColor: '#9e9e9e',
      color: '#ffffff',
    }
  }}
>
  CONFIRM
</Button>
</ConfirmButtonContainer>



      <ImageDisplayContainer>
        {uploadedImages.map((img, index) => (
          <img 
            key={index} 
            src={img} 
            alt={`Uploaded ${index + 1}`} 
            style={{ width: '200px', height: '180px', objectFit: 'cover', margin: '5px' }} 
          />
        ))}
      </ImageDisplayContainer>


      <VoiceInputContainer>
        <TextField 
          value={currentInput} 
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Input your topic, e.g. Hawaii travel"
          fullWidth
          variant="outlined"
          InputProps={{
            style: { fontSize: '1.4rem' }
          }}
        />

        <IconButton onClick={isRecording ? stopRecording : startRecording} size="large">
          <Mic color={isRecording ? "secondary" : "primary"} style={{ fontSize: '2rem' }} />
        </IconButton>
        <IconButton onClick={handleSend} size="large" color="primary">
          <Send style={{ fontSize: '2rem' }} />
        </IconButton>
      </VoiceInputContainer>
    </PageContainer>
    </ThemeProvider>
  );
}

export default NewEntryPage;

