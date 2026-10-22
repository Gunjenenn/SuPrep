import { useStore } from './lib/store';
import Shell from './components/Shell';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journey from './pages/Journey';
import Lesson from './pages/Lesson';
import DesmosPage from './pages/Desmos';
import Bank from './pages/Bank';
import Practice from './pages/Practice';
import Tutor from './pages/Tutor';
import Progress from './pages/Progress';
import Mistakes from './pages/Mistakes';
import { Achievements, Vocab } from './pages/Collections';
import Mock from './pages/Mock';
import Cards from './pages/Cards';
import { Formulas, Help, League, Planner } from './pages/Materials';

export default function App() {
  const { route } = useStore();
  if (route.name === 'landing') return <Landing />;
  if (route.name === 'onboarding') return <Onboarding />;
  if (route.name === 'mock') return <Mock />;
  return (
    <Shell>
      {route.name === 'dashboard' && <Dashboard />}
      {route.name === 'journey' && <Journey />}
      {route.name === 'lesson' && <Lesson key={route.id} id={route.id} />}
      {route.name === 'desmos' && <DesmosPage id={route.id} />}
      {route.name === 'bank' && <Bank key="bank" />}
      {route.name === 'hard' && <Bank key="hard" hard />}
      {route.name === 'formulas' && <Cards key="f" initial="formula" />}
      {route.name === 'league' && <League />}
      {route.name === 'help' && <Help />}
      {route.name === 'planner' && <Planner />}
      {route.name === 'practice' && <Practice key={route.ids.join(',') + (route.timed || '')} {...route} />}
      {route.name === 'tutor' && <Tutor />}
      {route.name === 'progress' && <Progress />}
      {route.name === 'mistakes' && <Mistakes />}
      {route.name === 'achievements' && <Achievements />}
      {route.name === 'vocab' && <Cards key="w" initial="word" />}
    </Shell>
  );
}
