import { createContext, useContext } from "react";
export type StaffRole = "proprietario" | "titolare";
export const RoleContext = createContext<StaffRole>("titolare");
export const useStaffRole = () => useContext(RoleContext);
