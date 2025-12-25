import { PathItem } from "../Settings";

export const settingsApi = {
  getPaths: async () => {
    try {
      const res = await fetch("/api/paths", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch paths");
      }
      
      const result = await res.json();
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },

  addPath: async (data: PathItem, userId: string) => {
    try {
      const res = await fetch("/api/paths", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: data.path,
          name: data.path.split("\\").pop() || "Unnamed",
          description: data.description,
          userId,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create path");
      }
      
      const result = await res.json();
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },

  updatePath: async (data: Partial<PathItem>) => {
    try {
      const res = await fetch("/api/paths", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update path");
      }
      
      const result = await res.json();
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },

  deletePath: async (id: string) => {
    try {
      const res = await fetch(`/api/paths?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete path");
      }
      
      const result = await res.json();
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  },
};