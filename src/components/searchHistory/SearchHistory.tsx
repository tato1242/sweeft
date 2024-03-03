import React from 'react';
import { Link } from 'react-router-dom';
import "./SearchHistory.css"
import useHistory from '../../hooks/useHistory';
interface SearchHistoryProps {
  history: string[];
}
const SearchHistory = () => {
  const { history }: { history?: string[] } = useHistory() || {};



  return (
    <div>
      <h2>Search History</h2>
      <ul>
        {history.map((term:string, index:number) => (
          <li key={index}>
            <Link to={`/?search=${term}`}>{term}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SearchHistory;