'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Add the initial assistant message only on the frontend
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm the Headstarter Technical support assistant. How can I help you today?",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.filter(msg => msg.role === 'user'),  // Only send user messages to the backend
            { role: 'user', content: message }
          ]
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      // justifyContent="center"
      alignItems="center"
      bgcolor="#f7f7f8" // Light background color
    >
      <Stack
        direction={'column'}
        // width="500px"
        width="100%"
        maxWidth="800px" // Adjusted width
        // height="700px"
        height="90%"
        maxHeight="900px" // Adjusted height
        borderRadius={2} // Rounded corners
        border="1px solid #dcdcdc" // Light border color
        // border="1px solid black"
        bgcolor="white"
        p={2}
        // spacing={3}
        spacing={2}
        boxShadow="0 0 10px rgba(0, 0, 0, 0.1)" // Subtle shadow for depth
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          // maxHeight="100%"
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
                    ? '#e1e1e1'
                    : '#007bff'
                }
                color={message.role === 'assistant' ? 'black' : 'white'}
                borderRadius={16}
                // p={3}
                p={2}
                maxWidth="80%"
                wordBreak="break-word"
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  )
}
