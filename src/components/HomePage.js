import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box,
  Container,
  ThemeProvider,
  createTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { styled } from '@mui/material/styles';

// 创建一个新的主题
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  height: '200px',
  width: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  backgroundColor: '#a8dadc', // 淡蓝色背景
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
    backgroundColor: '#457b9d', // 悬停时变为深蓝色
    color: '#fff', // 悬停时文字变为白色
  },
}));

const IconWrapper = styled(Box)({
  fontSize: '4rem',
  marginBottom: '1rem',
});

function HomePage() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh', 
        py: 10 
      }}>
        <Container maxWidth="md" sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{ 
              mb: 8, 
              color: theme.palette.primary.main,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            My Experience Diary
          </Typography>
          <Grid container spacing={6} justifyContent="center" sx={{ mt: 4 }}>
            <Grid item>
              <StyledPaper elevation={3} onClick={() => navigate('/new-entry')}>
                <IconWrapper>
                  <AddIcon fontSize="inherit" color="primary" />
                </IconWrapper>
                <Typography variant="h5" component="h2">
                  Create New
                </Typography>
              </StyledPaper>
            </Grid>
            <Grid item>
              <StyledPaper elevation={3} onClick={() => navigate('/history')}>
                <IconWrapper>
                  <HistoryIcon fontSize="inherit" color="primary" />
                </IconWrapper>
                <Typography variant="h5" component="h2">
                  History
                </Typography>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default HomePage;