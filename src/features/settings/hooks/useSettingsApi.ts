import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PathItem } from "../Settings";
import { settingsApi } from "../api/settingsApi";

export const useSettingsApi = () => {
  const queryClient = useQueryClient();
  const userId = "0ec97245-f7ab-472e-bd19-52ca30c72fb9";

  const { mutate: addPath, isPending: isAdding } = useMutation({
    mutationKey: ["createPath"],
    mutationFn: (data: PathItem) => settingsApi.addPath(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllPaths"] });
      console.log("Path created successfully");
    },
    onError: () => {
      console.log("Failed to create path");
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
    isGetPathsError,
    getPathsError,
  };
};