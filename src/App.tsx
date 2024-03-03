import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Fetch from './components/fetchImages/Fetch';
import SearchHistory from './components/searchHistory/SearchHistory';
const App: React.FC = () => {
  return (
<Router>
      <Routes>
        <Route path="/" element={<Fetch />} />
        <Route path="/search-history" element={<SearchHistory />} />
      </Routes>
    </Router>
  );
};
export default App;