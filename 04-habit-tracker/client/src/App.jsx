import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import HabitDetail from './pages/HabitDetail';
import Statistics from './pages/Statistics';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
