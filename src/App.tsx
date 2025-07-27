import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import Loading from '@ui/Loading/Loading';
import '@/utils/i18n';
import { routes } from './routes/routes';

function App() {
  const element = useRoutes(routes);
  
  return (
    <Suspense fallback={<Loading />}>
      {element}
    </Suspense>
  );
}

export default App;