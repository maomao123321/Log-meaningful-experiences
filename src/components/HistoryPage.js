import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Modal, Box, IconButton, Button } from '@mui/material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { textToSpeech } from '../api';
// import { summarizeConversation } from '../api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3a5a40',
    },
    background: {
      default: '#f1faee',
    },
    text: {
      primary: '#1d3557',
    },
  },
  typography: {
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
    h2: {
      fontWeight: 700,
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  height: '100%', // 改为100%高度以适应竖长条
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  backgroundColor: '#a8dadc',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
    backgroundColor: '#457b9d',
    color: '#fff',
  },
}));

const IconWrapper = styled(Box)({
  fontSize: '4rem',
  marginBottom: '1rem',
});

const TopicColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRight: '1px solid #ccc',
}));

const ContentColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const ImageColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderLeft: '1px solid #ccc',
}));

function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const navigate = useNavigate();

  useEffect(() => {
    const loadedHistories = JSON.parse(localStorage.getItem('histories') || '[]');
    const processedHistories = loadedHistories.map(entry => ({
      ...entry,
      summary: {
        subTopics: (entry.summary?.subTopics || []).map(st => ({
          title: st.title || 'Untitled Subtopic',
          summary: st.summary || 'No additional information available.'
        }))
      }
    }));
    setEntries(processedHistories);
  }, []);

  const handleSubTopicClick = (subTopic) => {
    setSelectedSubTopic(subTopic);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleTopicClick = (topic) => {
    const processedTopic = {
      ...topic,
      summary: {
        subTopics: (topic.summary?.subTopics || []).slice(0, 3).map((st, index) => ({
          title: st.title || `Subtopic ${index + 1}`,
          summary: st.summary || 'No additional information available.'
        }))
      }
    };
    while (processedTopic.summary.subTopics.length < 3) {
      processedTopic.summary.subTopics.push({
        title: `Subtopic ${processedTopic.summary.subTopics.length + 1}`,
        summary: 'No additional information available.'
      });
    }
    setSelectedTopic(processedTopic);
  };

  const handleDeleteTopic = () => {
    if (!selectedTopic) return;
    const updatedEntries = entries.filter(entry => entry.topic !== selectedTopic.topic);
    setEntries(updatedEntries);

    setSelectedTopic(null);

    localStorage.setItem('histories', JSON.stringify(updatedEntries));
  };

  // text to speech
  const handlePlayText = async (text) => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        const audioBlob = await textToSpeech(text);
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
      // 可以添加一个临时提示，比如使用 Snackbar 组件
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.onended = () => setIsPlaying(false);
    return () => {
      audio.onended = null;
    };
  }, []);

  
  if (error) {
    return <Typography color="error" variant="h4">{error}</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, padding: theme.spacing(4) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, width: '100%' }}>

          <Typography variant="h2" component="h1" color="primary">
            History
          </Typography>

          <IconButton onClick={handleHomeClick} sx={{ fontSize: '2rem', mr: 2 }}>
            <HomeIcon fontSize="inherit" />
            Home
          </IconButton>
        </Box>

<Grid container spacing={4}>
  {/* 左侧主题列表 */}
  <Grid item xs={2}>
    <TopicColumn>
      {/* <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Topics
      </Typography> */}
      {entries.slice().reverse().map((entry, index) => (
        <Button
          key={index}
          variant="text"
          fullWidth
          onClick={() => handleTopicClick(entry)}
          sx={{
            justifyContent: 'flex-start',
            mb: 2,
            textTransform: 'none'
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'left' }}>
            {entry.topic || 'Untitled Entry'}
          </Typography>
        </Button>
      ))}
    </TopicColumn>
  </Grid>
  

 {/* 中间内容区域 */}
 <Grid item xs={8}>
  <ContentColumn>
    {selectedTopic ? (
      <Box sx={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" color="primary">{selectedTopic.topic}</Typography>
          <IconButton 
            onClick={handleDeleteTopic}
            size="large"
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
<Grid container spacing={3}>
  {(selectedTopic?.summary?.subTopics || []).slice(0, 3).map((subTopic, subIndex) => (
    <Grid item xs={4} key={subIndex} sx={{ height: '500px' }}>
      <StyledPaper elevation={3} onClick={() => handleSubTopicClick(subTopic)}>
        <Typography variant="h5" gutterBottom>{subTopic.title}</Typography>
        <Typography variant="body1">{subTopic.summary}</Typography>
      </StyledPaper>
    </Grid>
))}

        </Grid>
      </Box>
    ) : (
      <Typography variant="h3" align="center">Please select a topic from the left</Typography>
    )}
  </ContentColumn>
</Grid>

{/* Modal 弹窗 */}
<Modal
  open={Boolean(selectedSubTopic)}
  onClose={() => setSelectedSubTopic(null)}
  aria-labelledby="subtopic-modal-title"
  aria-describedby="subtopic-modal-description"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography 
        id="subtopic-modal-title" 
        variant="h5"  // 从 h6 改为 h5
        component="h2" 
        sx={{ fontSize: '3.0rem' }}  // 增加字体大小
      >
        {selectedSubTopic?.title}
      </Typography>
      <Box>
        <IconButton onClick={() => handlePlayText(selectedSubTopic?.summary)} color="primary">
          <VolumeUpIcon />
        </IconButton>
        <IconButton onClick={() => handleCopyText(selectedSubTopic?.summary)} color="primary">
          <ContentCopyIcon />
        </IconButton>
      </Box>
    </Box>
    <Typography 
      id="subtopic-modal-description" 
      sx={{ mt: 2, fontSize: '1.8rem' }}  // 增加字体大小
    >
      {selectedSubTopic?.summary}
    </Typography>
  </Box>
</Modal>


          {/* 右侧图片列 */}
          <Grid item xs={2}>
            <ImageColumn>
              <Typography variant="h3" gutterBottom>Images</Typography>
              {[1, 2, 3, 4].map((num) => (
                <Box key={num} sx={{ mb: 2 }}>
                  <img src={`/${num}.jpg`} alt={`Image ${num}`} style={{ width: '100%', borderRadius: '8px' }} />
                </Box>
              ))}
            </ImageColumn>
          </Grid>
        </Grid>


      </Container>
    </ThemeProvider>
  );
}

export default HistoryPage;