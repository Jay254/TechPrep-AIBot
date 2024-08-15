// import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
// import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// // System prompt for the AI, providing guidelines on how to respond to users
// const systemPrompt = 'Welcome to Headstarter AI! You are an AI-powered customer support assistant designed to help users navigate our platform, which provides AI-powered interviews for Software Engineering jobs. Your role is to assist users with various inquiries, including account setup, interview preparation, troubleshooting technical issues, and understanding platform features. Ensure that all responses are clear, concise, and professional. If you cannot resolve an issue directly, guide the user on how to escalate the problem or where to find additional resources. Maintain a friendly and supportive tone, and prioritize user satisfaction in every interaction.'// Use your own system prompt here

// // POST function to handle incoming requests
// export async function POST(req) {
//   const openai = new OpenAI() // Create a new instance of the OpenAI client
//   const data = await req.json() // Parse the JSON body of the incoming request

//   // Create a chat completion request to the OpenAI API
//   const completion = await openai.chat.completions.create({
//     messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
//     model: 'gpt-4o', // Specify the model to use
//     stream: true, // Enable streaming responses
//   })

//   // Create a ReadableStream to handle the streaming response
//   const stream = new ReadableStream({
//     async start(controller) {
//       const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
//       try {
//         // Iterate over the streamed chunks of the response
//         for await (const chunk of completion) {
//           const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
//           if (content) {
//             const text = encoder.encode(content) // Encode the content to Uint8Array
//             controller.enqueue(text) // Enqueue the encoded text to the stream
//           }
//         }
//       } catch (err) {
//         controller.error(err) // Handle any errors that occur during streaming
//       } finally {
//         controller.close() // Close the stream when done
//       }
//     },
//   })

//   return new NextResponse(stream) // Return the stream as the response
// }
import { NextResponse } from 'next/server';

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a highly knowledgeable and supportive technical interview preparation assistant. Your role is to help users practice and improve their coding, algorithm, and problem-solving skills for technical interviews, particularly in software engineering and data science roles.",
});

export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request

  const userMessages = data.messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  // Ensure the first message is from the user
  if (userMessages[0].role !== "user") {
    throw new Error("The first message must be from the user.");
  }

  const chatSession = model.startChat({
    generationConfig: {
      temperature: 2,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
    history: userMessages,
  });

  const result = await chatSession.sendMessage(data.messages[data.messages.length - 1].content);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const text = encoder.encode(result.response.text());
        controller.enqueue(text);
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
