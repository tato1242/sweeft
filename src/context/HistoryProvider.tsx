import { createContext, useState, ReactNode, useRef } from "react";

interface HistoryContextProps {
  history: string[];
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  cache: { [key: string]: Photo[] };
  [index: string]: any;
}

interface Photo {
  id: string;
  urls: {
    small: string;
  };
  alt_description?: string;
  description?: string;
  likes?: number;
  downloads?: number;
  views?: number;
}

const historyContext = createContext<HistoryContextProps>({
  history: [],
  setHistory: () => {},
  cache: {},
});

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<string[]>([]);
  const cache = useRef<{ [key: string]: Photo[] }>({});

  return (
    <historyContext.Provider value={{ history, setHistory, cache: cache.current as { [key: string]: Photo[] } }}>
      {children}
    </historyContext.Provider>
  );
};

export default historyContext;
