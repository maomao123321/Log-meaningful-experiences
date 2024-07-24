import { AddCircle, Mic, Send } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, TextField, Typography, useMediaQuery, Fade } from '@mui/material';
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

const InputContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '40px',
});

const TopicAndActionContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '40px',
  marginBottom: '40px',
});

const TopicDisplayContainer = styled(Paper)(({ theme }) => ({
  width: '35%',
  height: '80px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  margin: '0 20px 0 0',
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  width: '35%',
  height: '80px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ImageDisplayContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: '20px',
  marginTop: 'auto',
  width: '100%',
  maxHeight: '40vh',
  overflowY: 'auto'
});

const ConfirmButtonContainer = styled(Box)({
  position: 'absolute',
  top: '30px',
  right: '30px',
});



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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  };
  
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContainer>
        <Typography variant="h2" style={{ textAlign: 'center', marginBottom: '40px', fontWeight: 'bold' }}>
          Log New Diary
        </Typography>

        <ConfirmButtonContainer>
          <Button 
            variant="contained"
            color="primary"
            disabled={!canConfirm}
            onClick={handleConfirm}
            sx={{ 
              fontSize: '1.2rem', 
              padding: '10px 30px',
              borderRadius: '20px',
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
            Save
          </Button>
        </ConfirmButtonContainer>

        <InputContainer>
          <TextField 
            value={currentInput} 
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress} 
            placeholder="Input your topic, e.g. Hawaii travel"
            variant="outlined"
            InputProps={{
              style: { fontSize: '1.4rem', backgroundColor: theme.palette.background.default }
            }}
            sx={{ width: '60%' }}
          />
          <IconButton onClick={isRecording ? stopRecording : startRecording} size="large">
            <Mic color={isRecording ? "secondary" : "primary"} style={{ fontSize: '2rem' }} />
          </IconButton>
          <IconButton onClick={handleSend} size="large" color="primary">
            <Send style={{ fontSize: '2rem' }} />
          </IconButton>
        </InputContainer>

        <TopicAndActionContainer>
          <Fade in={topic !== ''}>
            <TopicDisplayContainer elevation={3}>
              {topic ? topic : <Typography color="inherit" style={{ fontSize: 'inherit' }}>Your Topic</Typography>}
            </TopicDisplayContainer>  
          </Fade>

          <ActionContainer>
            <IconButton size="large" onClick={handleImageUpload}>
              <AddCircle style={{ fontSize: '3rem' }} />
            </IconButton>
            <Typography variant="h6" style={{ marginTop: '10px', fontSize: '1.4rem' }}>
              Upload photos
            </Typography>
          </ActionContainer>
        </TopicAndActionContainer>
        
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
      </PageContainer>
    </ThemeProvider>
  );
}

export default NewEntryPage;