'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Box, Button, Stack, TextField, Typography, IconButton } from '@mui/material';
import { DarkMode, LightMode, AccountCircle } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          background: {
            default: darkMode ? '#121212' : '#f7f7f8',
          },
          text: {
            primary: darkMode ? '#ffffff' : '#000000',
            secondary: darkMode ? '#b0b0b0' : '#555555',
          },
        },
      }),
    [darkMode],
  );

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setMessages(messages => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.filter(msg => msg.role === 'user'),
            { role: 'user', content: message }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages(messages => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(messages => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      setDarkMode(prefersDarkMode);
    }
  }, [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="row"
        bgcolor={theme.palette.background.default}
      >
        <Stack
          width="20%"
          height="100%"
          bgcolor={darkMode ? '#1f1f1f' : "#f0f0f0"}
          borderRight="1px solid #dcdcdc"
          p={2}
          overflow="auto"
        >
          <Box mb={2}>
            <Typography variant="h6" color={theme.palette.text.primary}>
              Chat History
            </Typography>
          </Box>
          <Stack direction="column" spacing={2}>
            {messages.length === 0 ? (
              <Typography color={theme.palette.text.secondary}>
                No chat history available.
              </Typography>
            ) : (
              // messages.map((message, index) => (
              //   <Box
              //     key={index}
              //     display="flex"
              //     justifyContent="flex-start"
              //     bgcolor={
              //       message.role === 'assistant' ? darkMode ? '#2f2f2f' : '#e1e1e1' : '#007bff'
              //     }
              //     color={message.role === 'assistant' ? theme.palette.text.primary : 'white'}
              //     borderRadius={8}
              //     p={1}
              //     mb={1}
              //     wordBreak="break-word"
              //   >
              //     <ReactMarkdown>
              //       {message.content}
              //     </ReactMarkdown>
              //   </Box>
                // ))
                <Box
                  display="flex"
                  justifyContent="flex-start"
                  bgcolor={
                    message.role === 'assistant' ? darkMode ? '#2f2f2f' : '#e1e1e1' : '#007bff'
                  }
                  color={message.role === 'assistant' ? theme.palette.text.primary : 'white'}
                  borderRadius={8}
                  p={1}
                  mb={1}
                  wordBreak="break-word"
                >
                  <ReactMarkdown>
                    Tech Prep
                  </ReactMarkdown>
                </Box>
              )
          }
          </Stack>
        </Stack>

        <Stack
          direction={'column'}
          width="70%"
          height="100%"
          border="1px solid #dcdcdc"
          bgcolor={darkMode ? '#1c1c1c' : 'white'}
          p={2}
          spacing={2}
          boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
          flexGrow={1}
        >
          {showWelcome ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              height="100%"
              color={theme.palette.text.primary}
            >
              <Typography variant="h4" gutterBottom>
                Welcome to Headstarter Technical Support
              </Typography>
              <Typography variant="body1" gutterBottom>
                How can we assist you today?
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setShowWelcome(false)}
              >
                Get Started
              </Button>
            </Box>
          ) : (
            <>
              <Stack
                direction={'column'}
                spacing={2}
                flexGrow={1}
                overflow="auto"
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === 'assistant' ? 'flex-start' : 'flex-end'
                    }
                  >
                    <Box
                      bgcolor={
                        message.role === 'assistant'
                          ? darkMode ? '#2f2f2f' : '#e1e1e1'
                          : '#007bff'
                      }
                      color={message.role === 'assistant' ? theme.palette.text.primary : 'white'}
                      borderRadius={16}
                      p={2}
                      maxWidth="80%"
                      wordBreak="break-word"
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <TextField
                  label="Message"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  InputLabelProps={{
                    style: { color: theme.palette.text.secondary }
                  }}
                  InputProps={{
                    style: { color: theme.palette.text.primary }
                  }}
                />
                <Button variant="contained" onClick={sendMessage}>
                  Send
                </Button>
              </Stack>
            </>
          )}
        </Stack>

        <Stack
          width='20%'
          bgcolor={darkMode ? '#1f1f1f' : 'background.paper'}
          p={2}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            width='100%'
          >
            <IconButton>
              <AccountCircle />
            </IconButton>
            <IconButton onClick={toggleTheme}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  )
}
