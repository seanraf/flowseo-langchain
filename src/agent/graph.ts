import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
// Remove CompiledStateGraph import if not needed
import { tools } from "./tools.js"; // Import the tools we defined
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Instantiate the Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-001", // Use the confirmed working model name
  apiKey: process.env.GOOGLE_API_KEY,
});

// Instantiate memory
const memory = new MemorySaver();

// Create the ReAct agent using the helper
const agentExecutor = createReactAgent({
  llm: model, // Use 'llm' key
  tools,
  checkpointer: memory,
});

// Export the agent executor graph
export const graph = agentExecutor;

// Optional: Set a name for display in LangSmith/Studio if needed
// graph.name = "SEO Research ReAct Agent"; // createReactAgent might set a default name

console.log("ReAct Agent Executor created using createReactAgent.");

// Note: The actual execution loop (getting user input, calling agentExecutor.stream)
// would typically be in a separate application file or handled by the LangGraph Studio UI/API.
// This file defines and exports the runnable agent graph.
