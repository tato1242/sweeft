import { useContext } from "react";
import historyContext from "../context/HistoryProvider";
const useHistory = () => {
    return useContext(historyContext);
}

export default useHistory;