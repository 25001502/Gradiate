import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './AuthForm';
import Application from './pages/Aplication';
import Startup from './pages/Startup';
import Bursaryguest from './pages/Bursaryguest';
import ProgramsGuest from './pages/Programsguest';
import How from './pages/How';
import About from './pages/About';
import Practise from './pages/Practise';
import Profile from './pages/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startup />} />
        <Route path="/AuthForm" element={<AuthForm />} />
        <Route path="/Aplication" element={<Application />} />
        <Route path="/Bursaryguest" element={<Bursaryguest />} />
        <Route path="/Programsguest" element={<ProgramsGuest />} />
        <Route path="/How" element={<How />} />
        <Route path="/About" element={<About />} />
        <Route path="/Practise" element={<Practise />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
