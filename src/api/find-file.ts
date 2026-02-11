import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import i18n from "../utils/i18n/i18n";
import { searchFiles, openFile, openFolder, getRelevantPaths } from "../features/home/utils/helper";

export interface PathItem {
  id?: string;
  path: string;
  description?: string | null;
}

export interface FindFileRequest {
  message?: string;
  action?: "open" | "openFolder" | "search";
  filePath?: string;
  paths?: PathItem[];
}

export interface FindFileResponse {
  intent: "search" | "open";
  response: string;
  files?: Array<{
    name: string;
    path: string;
    size: number;
    modified: Date;
    type: string;
  }>;
  requiresConfirmation: boolean;
}

const tR = (key: string) => i18n.t(`FileSearch.route.${key}`);

export async function handleFindFile({
  message,
  action,
  filePath,
  paths,
}: FindFileRequest): Promise<FindFileResponse> {

  try {
    // Handle direct file opening
    if (action === "open" && filePath) {
      const openResult = await openFile(filePath, "excel");

      return {
        intent: "open",
        response: openResult.success
          ? tR("open_file.success")
          : `${tR("open_file.fail")} ${openResult.error}`,
        requiresConfirmation: false,
      };
    }

    // Handle folder opening
    if (action === "openFolder" && filePath) {
      const openResult = await openFolder(filePath);

      if (!openResult) {
        return {
          intent: "open",
          response: tR("open_folder.no_result"),
          requiresConfirmation: false,
        };
      }

      return {
        intent: "open",
        response: openResult.success
          ? tR("open_folder.success")
          : `${tR("open_folder.fail")} ${openResult.error}`,
        requiresConfirmation: false,
      };
    }

    // For search we need a message and paths
    if (!message || !paths) {
      return {
        intent: "search",
        response: tR("handle_search.error.search_results_response"),
        files: [],
        requiresConfirmation: false,
      };
    }

    // Handle file search using AI to extract parameters
    let aiText: string;
    let aiFallbackNote: string | null = null;
    try {
      const aiResponse = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `
          Analyze this file search request and extract the search parameters:
          User request: "${message}"
          
          Extract:
          1. Keywords to search for in file names AND folder names
          2. File types mentioned (convert to extensions like xlsx, docx, csv, pdf) OR "folder" if searching for directories
          3. Whether this is a search or open request
          
          If the user mentions "folder", "directory", or is looking for a folder name, include "folder" in the TYPES.
          
          Examples:
          - "find awa folder" → TYPES: folder
          - "open excel file" → TYPES: xlsx, xls, csv
          - "find budget folder or spreadsheet" → TYPES: folder, xlsx, xls, csv
          
          Respond in this format:
          KEYWORDS: [comma-separated keywords]
          TYPES: [comma-separated file extensions and/or "folder"]
          INTENT: search|open
        `,
      });
      aiText = aiResponse.text;
      console.log("aiText", aiResponse.content)
    } catch (aiError) {
      const statusCode = (aiError as any)?.statusCode;
      const responseBody = (aiError as any)?.responseBody;
      const errorCode = (aiError as any)?.code ?? (aiError as any)?.error?.code;

      // Avoid dumping massive provider error objects (they can include request metadata).
      // Keep it concise but still useful.
      const errorMessage =
        (aiError as any)?.message ||
        (typeof responseBody === 'string' ? responseBody : 'AI request failed');

      console.warn(`AI unavailable (status=${statusCode ?? 'unknown'}): ${errorMessage}`);

      if (statusCode === 429 || errorCode === 'insufficient_quota') {
        aiFallbackNote =
          'AI quota exceeded; using basic search (check your OpenAI billing/usage).';
      } else {
        aiFallbackNote = 'AI temporarily unavailable; using basic search.';
      }

      // Fallback to basic keyword extraction without AI.
      // IMPORTANT: use the *user* message, not the error message,
      // so we still search for what they actually asked for.
      const userMessage = (message ?? '').toLowerCase();
      const includeFolder =
        userMessage.includes("folder") || userMessage.includes("directory");
      const fallbackTypes = includeFolder
        ? "folder, xlsx, xls, docx, doc, csv, pdf"
        : "xlsx, xls, docx, doc, csv, pdf";
      aiText = `KEYWORDS: ${userMessage
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word: string) => word.length > 2)
        .join(", ")}\nTYPES: ${fallbackTypes}\nINTENT: search`;
    }

    // Parse AI response
    const lines = aiText.split("\n");
    const keywordsLine = lines.find((line) => line.startsWith("KEYWORDS:"));
    const typesLine = lines.find((line) => line.startsWith("TYPES:"));
    // const intentLine = lines.find(line => line.startsWith('INTENT:'));

    const keywords = keywordsLine?.replace("KEYWORDS:", "").trim() || "";
    const keywordsList = keywords.split(",").map((k) => k.trim())

    const candidatePaths = getRelevantPaths(paths, keywordsList)

    const fileTypes =
      typesLine
        ?.replace("TYPES:", "")
        .trim()
        .split(",")
        .map((t) => t.trim()) || [];
    // const intent = intentLine?.replace('INTENT:', '').trim() || 'search';


    // Search for files
    const foundFiles = await searchFiles(keywords, fileTypes, candidatePaths);

    let response = "";
    if (foundFiles.length === 0) {
      response = `${tR("handle_search.not_found")}${message}${tR("handle_search.not_found_ext")}`;
    } else if (foundFiles.length === 1) {
      response = `${tR("handle_search.found_one")}${message}${tR("handle_search.found_one_ext")}`;
    } else {
      response = `${tR("handle_search.found_many")}${foundFiles.length}${tR("handle_search.found_many_ii")}${message}${tR("handle_search.found_many_iii")}`;
    }

    if (aiFallbackNote) {
      response = `${response}\n\n(${aiFallbackNote})`;
    }

    return {
      intent: "search",
      response,
      files: foundFiles,
      requiresConfirmation: foundFiles.length > 0,
    };
  } catch (error) {
    console.error("Error in find-file API:", error);
    return {
      intent: "search",
      response: tR("sorry"),
      files: [],
      requiresConfirmation: false,
    };
  }
}