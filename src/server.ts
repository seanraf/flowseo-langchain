import express, { Request, Response } from 'express';
import { graph } from './agent/graph.js'; // Import the agent executor graph (Runnable)
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the port, defaulting to 8080 if PORT is not set
const PORT = process.env.PORT || 8080;

// Define a POST endpoint for invoking the agent
app.post('/invoke', async (req: Request, res: Response) => {
  try {
    // Extract input and config from the request body
    // Adjust the structure based on how you expect clients to send data
    const { input, config } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Missing "input" field in request body' });
    }

    console.log(`Invoking agent with input:`, input);
    // Invoke the LangGraph runnable
    const result = await graph.invoke(input, config); // Pass config if provided
    console.log(`Agent invocation result:`, result);

    // Send the result back as JSON
    res.status(200).json({ output: result });

  } catch (error: unknown) {
    console.error("Error invoking agent:", error);
    // Basic error handling
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to invoke agent', details: errorMessage });
  }
});

// Basic root endpoint (optional)
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('LangGraph agent server is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
  console.log(`Agent invoke endpoint available at POST /invoke`);
});
