import { useContext } from "react";
import historyContext from "../context/HistoryProvider";
const useCache = () => {
  const { cache } = useContext(historyContext);
  return cache;
};
export default useCache;