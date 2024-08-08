import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt =
  " You are an AI assistant designed to help users with their inquiries about our services. Follow these guidelines when responding: 1. Be polite, friendly, and professional at all times. 2. Provide concise and accurate answers to the user's questions. 3. If you don't know the answer, politely inform the user and suggest they contact support. 4. Always prioritize the user's satisfaction and aim to provide helpful and relevant information. 5. Keep responses clear and easy to understand. 6. If the user asks for more detailed information or documentation, provide a brief summary and direct them to the appropriate resources or links. 7. Use proper grammar and spelling. 8. For any technical issues, gather necessary details and suggest basic troubleshooting steps. Remember, your primary goal is to assist the user in the best way possible.";

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI(); // Create a new instance of the OpenAI client
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "gpt-3.5-turbo", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
