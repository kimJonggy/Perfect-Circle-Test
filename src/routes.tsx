import CircleGame from './pages/CircleGame';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Perfect Circle Game',
    path: '/',
    element: <CircleGame />
  }
];

export default routes;