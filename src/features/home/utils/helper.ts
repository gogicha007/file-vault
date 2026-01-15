import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

// Minimal PathItem shape used on the backend side
interface PathItem {
  id?: string;
  path: string;
  description?: string | null;
}

const execAsync = promisify(exec);

// Interface for file search results
interface FileSearchResult {
  name: string;
  path: string;
  size: number;
  modified: Date;
  type: string;
}

// Helper function to search directory recursively
export async function searchDirectory(
  dirPath: string,
  query: string,
  fileTypes: string[],
  maxDepth: number = 3,
  includeFolders: boolean = false
): Promise<FileSearchResult[]> {
  const results: FileSearchResult[] = [];

  if (maxDepth <= 0) return results;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      try {
        const itemPath = path.join(dirPath, item);

        // Check if we can access this item before getting stats
        let stats;
        try {
          stats = fs.statSync(itemPath);
        } catch (statError) {
          console.warn(
            `[searchDirectory] Cannot access item: ${itemPath} - ${(statError as Error).message}`
          );
          continue; // Skip this item if we can't get stats
        }

        if (stats.isDirectory()) {
          // Check if the directory name itself matches the search query (only if includeFolders is true)
          if (includeFolders) {
            const dirName = item.toLowerCase();
            const queryLower = query.toLowerCase();

            const dirMatches =
              dirName.includes(queryLower) ||
              queryLower.split(" ").some((word) => dirName.includes(word));

            // If the directory name matches, add it to results
            if (dirMatches) {
              results.push({
                name: item,
                path: itemPath,
                size: 0, // Directories don't have a meaningful size
                modified: stats.mtime,
                type: "folder", // Mark as folder type
              });
            }
          }

          // Skip system directories and directories with problematic names
          if (
            item.startsWith(".") ||
            [
              "node_modules",
              "System Volume Information",
              "$Recycle.Bin",
              "Моя музыка", // Skip Cyrillic system folders
              "Мои видеозаписи",
              "Мои изображения",
              "AppData",
              "Application Data",
              "Local Settings",
              "Temporary Internet Files",
            ].includes(item)
          ) {
            continue;
          }

          // Check if it's a system/hidden directory by checking attributes
          try {
            fs.accessSync(itemPath, fs.constants.R_OK);
            // Recursively search subdirectories
            const subResults = await searchDirectory(
              itemPath,
              query,
              fileTypes,
              maxDepth - 1,
              includeFolders
            );
            results.push(...subResults);
          } catch {
            console.warn(`[searchDirectory] Skipping inaccessible subdirectory: ${itemPath}`);
            continue; // Skip subdirectories we can't access
          }
        } else if (stats.isFile()) {
          const ext = path.extname(item).toLowerCase().slice(1);
          const fileName = path.basename(item, path.extname(item)).toLowerCase();
          const queryLower = query.toLowerCase();

          // Check if file matches criteria
          const matchesType = fileTypes.length === 0 || fileTypes.includes(ext);
          const matchesName =
            fileName.includes(queryLower) ||
            queryLower.split(" ").some((word) => fileName.includes(word));

          if (matchesType && matchesName) {
            results.push({
              name: item,
              path: itemPath,
              size: stats.size,
              modified: stats.mtime,
              type: ext,
            });
          }
        }
      } catch (itemError) {
        // Log and continue with other items
        console.warn(
          `[searchDirectory] Error processing item "${item}" in ${dirPath}: ${
            (itemError as Error).message
          }`
        );
        continue;
      }
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EPERM") {
      console.warn(`[searchDirectory] Permission denied for directory: ${dirPath}`);
    } else if (err.code === "ENOENT") {
      console.warn(`[searchDirectory] Directory not found: ${dirPath}`);
    } else if (err.code === "EACCES") {
      console.warn(`[searchDirectory] Access denied for directory: ${dirPath}`);
    } else {
      console.error(`[searchDirectory] Error reading directory ${dirPath}:`, error);
    }
  }

  return results;
}

// Function to search for files and folders
export async function searchFiles(query: string, fileTypes: string[] = [], paths: PathItem[]) {
  const foundFiles: Array<{
    name: string;
    path: string;
    size: number;
    modified: Date;
    type: string;
  }> = [];

  // Check if looking for folders
  const searchingForFolders = fileTypes.includes("folder");

  // If searching for folders, filter out "folder" from file types but remember we want folders
  const actualFileTypes = fileTypes.filter((type) => type !== "folder");

  // Default search paths - be more specific and avoid problematic directories
  // const username = process.env.USERNAME || "user";
  const pathsToSearch = paths.map((item) => item.path);
  // const pathsToSearch = [
  //   `C:\\Users\\${username}\\Documents`,
  //   `C:\\Users\\${username}\\Desktop`,
  //   `C:\\Users\\${username}\\Downloads`,
  //   // Add specific subdirectories if they exist and are accessible
  // ];

  console.log(
    `[searchFiles] Starting search for query: "${query}" in paths:`,
    pathsToSearch,
    `(searching for ${searchingForFolders ? "folders and files" : "files only"})`
  );

  for (const searchPath of pathsToSearch) {
    try {
      // Check if path exists and is accessible before searching
      if (!fs.existsSync(searchPath)) {
        console.warn(`[searchFiles] Path does not exist: ${searchPath}`);
        continue;
      }

      try {
        // Test read access before attempting to search
        fs.accessSync(searchPath, fs.constants.R_OK);
        console.log(`[searchFiles] Searching in: ${searchPath}`);

        const files = await searchDirectory(
          searchPath,
          query,
          actualFileTypes,
          3,
          searchingForFolders
        );
        console.log(`[searchFiles] Found ${files.length} items in ${searchPath}`);
        foundFiles.push(...files);
      } catch (accessError) {
        console.warn(
          `[searchFiles] No read access to path: ${searchPath} - ${(accessError as Error).message}`
        );
        continue;
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "EPERM") {
        console.warn(`[searchFiles] Permission denied for path: ${searchPath}`);
      } else if (err.code === "ENOENT") {
        console.warn(`[searchFiles] Path not found: ${searchPath}`);
      } else {
        console.error(`[searchFiles] Error searching path ${searchPath}:`, error);
      }
    }
  }

  console.log(`[searchFiles] Total files found: ${foundFiles.length}`);
  return foundFiles.slice(0, 10); // Limit results
}

// Function to open file
export async function openFile(filePath: string, application?: string) {
  try {
    // Determine command based on file type and requested application
    let command = "";
    const ext = path.extname(filePath).toLowerCase();

    if (application === "excel" || [".xlsx", ".xls", ".csv"].includes(ext)) {
      command = `start excel "${filePath}"`;
    } else if (application === "word" || [".docx", ".doc"].includes(ext)) {
      command = `start winword "${filePath}"`;
    } else if ([".pdf"].includes(ext)) {
      command = `start "" "${filePath}"`;
    } else {
      command = `start "" "${filePath}"`; // Default system association
    }

    await execAsync(command);
    return {
      success: true,
      message: `File opened successfully with ${application || "default application"}`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Function to open folder containing the file OR open the folder directly
export async function openFolder(filePath: string) {
  try {
    console.log(`[openFolder] Attempting to open folder for path: ${filePath}`);

    // Check if path exists first
    if (!fs.existsSync(filePath)) {
      console.error(`[openFolder] Path does not exist: ${filePath}`);
      return { success: false, error: `Path does not exist: ${filePath}` };
    }

    // Check if the path is a directory or a file
    const stats = fs.statSync(filePath);
    const normalizedPath = path.normalize(filePath);

    if (stats.isDirectory()) {
      // If it's a directory, open the directory directly
      console.log(`[openFolder] Opening directory: ${normalizedPath}`);

      const commands = [
        `explorer "${normalizedPath}"`,
        `start "" explorer "${normalizedPath}"`,
        `powershell -Command "& {explorer '${normalizedPath.replace(/\\/g, "\\\\")}'}}"`,
      ];

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        console.log(`[openFolder] Trying directory command ${i + 1}: ${command}`);

        try {
          const result = await execAsync(command, { timeout: 5000 });
          console.log(`[openFolder] Directory command ${i + 1} executed successfully:`, result);
          return {
            success: true,
            message: `Folder opened successfully (method ${i + 1})`,
          };
        } catch (cmdError) {
          console.log(`[openFolder] Directory command ${i + 1} failed:`, cmdError);
          if (i === commands.length - 1) {
            throw cmdError; // Throw on last attempt
          }
        }
      }
    } else {
      // If it's a file, open folder and select the file
      console.log(`[openFolder] Opening folder and selecting file: ${normalizedPath}`);

      const commands = [
        `explorer /select,"${normalizedPath}"`,
        `powershell -Command "& {explorer '/select,${normalizedPath.replace(/\\/g, "\\\\")}'}}"`,
        `start "" explorer /select,"${normalizedPath}"`,
      ];

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        console.log(`[openFolder] Trying file command ${i + 1}: ${command}`);

        try {
          const result = await execAsync(command, { timeout: 5000 });
          console.log(`[openFolder] File command ${i + 1} executed successfully:`, result);
          return {
            success: true,
            message: `Folder opened and file selected in Explorer (method ${i + 1})`,
          };
        } catch (cmdError) {
          console.log(`[openFolder] File command ${i + 1} failed:`, cmdError);
          if (i === commands.length - 1) {
            throw cmdError; // Throw on last attempt
          }
        }
      }
    }
  } catch (error) {
    console.error(`[openFolder] All methods failed:`, error);

    // Try fallback approach - just open the parent folder
    try {
      console.log(`[openFolder] Trying fallback: open parent folder...`);
      const parentPath = path.dirname(filePath);
      const fallbackCommand = `explorer "${parentPath}"`;
      console.log(`[openFolder] Fallback command: ${fallbackCommand}`);

      await execAsync(fallbackCommand, { timeout: 5000 });
      console.log(`[openFolder] Fallback command succeeded`);

      return {
        success: true,
        message: `Parent folder opened successfully (fallback method)`,
      };
    } catch (fallbackError) {
      console.error(`[openFolder] Fallback method also failed:`, fallbackError);
      return {
        success: false,
        error: `Failed to open folder. Primary error: ${
          (error as Error).message
        }. Fallback error: ${(fallbackError as Error).message}`,
      };
    }
  }
}