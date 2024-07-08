import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import HistoryPage from './components/HistoryPage';
import EntryDetails from './components/EntryDetails';
import NewEntryPage from './components/NewEntryPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/new-entry" element={<NewEntryPage />} />
        <Route path="/entry-details" element={<EntryDetails />} />
        
      </Routes>
    </Router>
  );
}

export default App;