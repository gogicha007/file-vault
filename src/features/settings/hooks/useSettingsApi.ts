import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settingsApi";
import type { PathItem } from "../Settings";
import { useAuth } from "@/context/AuthContext";

export const useSettingsApi = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const { mutate: addPath, isPending: isAdding, isError: isAddPathError, error: addPathError } = useMutation({
    mutationKey: ["createPath"],
    mutationFn: (data: PathItem) => {
      if (!userId) {
        throw new Error("User must be logged in to add a path")
      }
      return settingsApi.addPath(data, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllPaths"] });
      console.log("Path created successfully");
    },
    onError: (error) => {
      console.error("Failed to create path", error.message);
    },
  });

  const { mutate: updatePath, isPending: isUpdating } = useMutation({
    mutationKey: ["updatePath"],
    mutationFn: (data: Partial<PathItem>) => settingsApi.updatePath(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllPaths"] });
      console.log("Path updated successfully");
    },
    onError: () => {
      console.log("Failed to update path");
    },
  });

  const { mutate: deletePath, isPending: isDeleting } = useMutation({
    mutationKey: ["deletePath"],
    mutationFn: (id: string) => settingsApi.deletePath(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllPaths"] });
      console.log("Path removed successfully");
    },
    onError: () => {
      console.log("Failed to remove path");
    },
  });

  const {
    isPending: isGetting,
    data: pathsData,
    isError: isGetPathsError,
    error: getPathsError,
  } = useQuery({
    queryKey: ["AllPaths"],
    queryFn: settingsApi.getPaths,
  });

  return {
    addPath,
    updatePath,
    deletePath,
    pathsData,
    isPending: isAdding || isUpdating || isDeleting || isGetting,
    isError: isAddPathError,
    addPathError,
    isGetPathsError,
    getPathsError,
  };
};