/**
 * List of forbidden system paths that should not be indexed
 */
export const FORBIDDEN_SYSTEM_PATHS: Array<RegExp> = [
  /^[a-zA-Z]:\\windows/i,
  /^[a-zA-Z]:\\program files/i,
  /^[a-zA-Z]:\\program files \(x86\)/i,
  /^[a-zA-Z]:\\programdata/i,
  /^[a-zA-Z]:\\system volume information/i,
  /^[a-zA-Z]:\\\$recycle\.bin/i,
  /^[a-zA-Z]:\\boot/i,
  /^[a-zA-Z]:\\recovery/i,
  /^[a-zA-Z]:\\perflogs/i,
  /^[a-zA-Z]:\\users\\[^\\]+\\appdata/i,
];

/**
 * Validates if a path is a valid Windows path and not a system directory
 * @param pathValue - The path to validate
 * @returns Object with validation result and optional error message
 */
export const validatePath = (pathValue: string): { valid: boolean; error?: string } => {
  if (!pathValue.trim()) {
    return { valid: false, error: "Please enter a path to add" };
  }

  // Check if path starts with a drive letter (C:\, D:\, etc.)
  const windowsPathRegex = /^[a-zA-Z]:\\/;
  if (!windowsPathRegex.test(pathValue)) {
    return { 
      valid: false, 
      error: "Path must start with a drive letter (e.g., C:\\, D:\\, G:\\)" 
    };
  }

  // Check if path matches any forbidden patterns
  for (const forbiddenPattern of FORBIDDEN_SYSTEM_PATHS) {
    if (forbiddenPattern.test(pathValue)) {
      return {
        valid: false,
        error: "Cannot index system folders (Windows, Program Files, etc.)"
      };
    }
  }

  return { valid: true };
};