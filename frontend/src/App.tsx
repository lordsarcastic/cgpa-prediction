import { Dispatch, SetStateAction, createContext, useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Error, ErrorProps } from './Error';
import { DatasetDetail } from './pages/DatasetDetail';
import { ListingPage } from './pages/DatasetList';

export type ErrorContextProps = {
    error?: ErrorProps,
    setError: Dispatch<SetStateAction<ErrorProps | undefined>>
}

export const ErrorContext = createContext<ErrorContextProps>({} as ErrorContextProps);

function App() {
  const [error, setError] = useState<ErrorProps | undefined>(undefined);
  const { pathname } = window.location;

  useEffect(() => {
    setError(undefined);
    window.scrollTo(0, 0)

  }, [pathname]);

  const errorValue = useMemo(() => ({
    error,
    setError
  }), [error, setError]);

  return (
    <BrowserRouter>
      <ErrorContext.Provider value={errorValue}>
        <header>

        </header>
        <main className="py-16 px-16 bg-gray-800 relative">
          {error && <Error {...error} />}
          <Switch>
            <Route exact={DatasetDetail.exact} path={DatasetDetail.route}>
              <DatasetDetail.Component />
            </Route>
            <Route exact={ListingPage.exact} path={ListingPage.route}>
              <ListingPage.Component />
            </Route>
          </Switch>
        </main>
        <footer>

        </footer>
      </ErrorContext.Provider>
    </BrowserRouter>
  );
}

export default App;
