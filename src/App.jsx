import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import CarDetail from './pages/CarDetail.jsx';
import { CountryProvider } from './contexts/CountryContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './index.css';

// Force CarDetail to fully remount when the car ID changes so useState resets correctly
function CarDetailMounted() {
  const { id } = useParams();
  return <CarDetail key={id} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <CountryProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-page text-primary">
            <Header />
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/car/:id" element={<CarDetailMounted />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CountryProvider>
    </ThemeProvider>
  );
}
