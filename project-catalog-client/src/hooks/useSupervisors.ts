// src/hooks/useSupervisors.ts

import { useQuery } from "@tanstack/react-query";

import api from "@/config/api";
import { User } from "@/types";

export const useSupervisors = () => {
  return useQuery({
    queryKey: ["supervisors"],
    queryFn: async () => {
      // Because the backend returns List<User>, the axios response.data will be the array.
      const { data } = await api.get("users/supervisors");

      console.table(data);

      return data as User[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
