import { tool } from "@langchain/core/tools"; // Import tool decorator/function
import { z } from "zod"; // Import zod
import axios, { isAxiosError } from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const KWRDS_API_KEY = process.env.KWRDS_API_KEY;
const KWRDS_API_URL = "https://keywordresearch.api.kwrds.ai/keywords-with-volumes";

// Define Zod schema for the tool input
const KwrdsSchema = z.object({
  search_question: z.string().describe("The keyword or phrase to research"),
  search_country: z.string().optional().describe("Country code (e.g., en-US, defaults to en-US)"),
  limit: z.number().int().optional().describe("Maximum number of keywords to return"),
});

// Define the type from the Zod schema
type KwrdsInput = z.infer<typeof KwrdsSchema>;

interface KwrdsResponse {
  keyword: { [key: string]: string };
  volume: { [key: string]: number };
  cpc: { [key: string]: number };
  "search-intent"?: { [key: string]: string };
  competition_value?: { [key: string]: string };
}

interface KeywordResult {
  keyword: string;
  volume: number;
  cpc: number;
  searchIntent?: string;
  competition?: string;
}

// Define the core API call logic as a standalone function
async function callKwrdsApi(requestData: KwrdsInput): Promise<string> {
    if (!KWRDS_API_KEY) {
        return "Error: KWRDS_API_KEY not found in environment variables.";
    }
    console.log("Kwrds Tool Input:", requestData);
    try {
        const response = await axios.post<KwrdsResponse>(KWRDS_API_URL, requestData, {
            headers: {
                "X-API-KEY": KWRDS_API_KEY,
                "Content-Type": "application/json",
            },
        });

        console.log("Kwrds Tool: Received API response");
        const results: KeywordResult[] = [];
        const data = response.data;

        if (!data || !data.keyword) {
            console.log("Kwrds Tool: Invalid or empty response data structure.");
            return JSON.stringify([]);
        }

        const indices = Object.keys(data.keyword);
        for (const index of indices) {
            results.push({
                keyword: data.keyword[index],
                volume: data.volume?.[index] ?? 0,
                cpc: data.cpc?.[index] ?? 0.0,
                searchIntent: data["search-intent"]?.[index],
                competition: data.competition_value?.[index],
            });
        }

        console.log(`Kwrds Tool: Parsed ${results.length} results.`);
        return JSON.stringify(results);

    } catch (error) {
        console.error("Kwrds Tool: Error calling API:", error);
        if (isAxiosError(error)) {
            const status = error.response?.status;
            const errorData = error.response?.data;
            return `Error: kwrds.ai API request failed with status ${status}. ${errorData ? JSON.stringify(errorData) : error.message}`;
        } else if (error instanceof Error) {
            return `Error: An unexpected error occurred in the kwrds tool: ${error.message}`;
        } else {
            return "Error: An unknown error occurred in the kwrds tool.";
        }
    }
}

// Create the tool using the 'tool' function/decorator
export const kwrdsKeywordResearchTool = tool(
  callKwrdsApi, // Pass the async function directly
  {
    name: "kwrds_keyword_research",
    description: "Use this tool to get keyword research data (volume, CPC, competition) for a given search query.",
    schema: KwrdsSchema, // Provide the Zod schema for input validation and description
  }
);

export const tools = [kwrdsKeywordResearchTool]; // Export a list containing the new tool
