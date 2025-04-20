import { serve } from "langserve";
import { graph } from "./agent/graph.js"; // Import the agent executor graph
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define the port, defaulting to 8080 if PORT is not set
const PORT = process.env.PORT || 8080;

console.log(`Attempting to serve agent graph on port ${PORT}...`);

// Start the LangServe server
serve({
  app: graph, // Pass the agent executor graph to LangServe
  port: Number(PORT), // Ensure port is a number
  // Optional: Add other LangServe configurations if needed
  // e.g., path: "/api" to serve under a specific path
}).then(() => {
  console.log(`LangServe server running successfully on port ${PORT}`);
}).catch((error: unknown) => {
  console.error("Failed to start LangServe server:", error);
  process.exit(1); // Exit if the server fails to start
});
