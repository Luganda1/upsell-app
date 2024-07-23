import Groq from "groq-sdk";

const GROQ_API_KEY='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';
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function LlamaModel() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  const returnedInfo = chatCompletion.choices[0]?.message?.content || ""
  console.log(chatCompletion.choices[0]?.message?.content || "");
  return returnedInfo
}

async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "List all the presidents of america",
      },
    ],
    model: "llama3-8b-8192",
  });
}
