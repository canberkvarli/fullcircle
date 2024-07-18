// app/context/UserContext.tsx
import React, { createContext, useState, ReactNode } from "react";

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Fill in the User type with the fields you need from the user object.
interface User {
  userId: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  marketingRequested?: boolean;
  mfaEnabled?: boolean;
  birthdate?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
