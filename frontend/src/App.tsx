import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { ListingPage } from './pages/DatasetList';



function App() {

  return (
    <BrowserRouter>
        <header>

        </header>
        <main className="py-16 px-16 bg-blue-50 h-screen">
          <Switch>
            <Route exact={ListingPage.exact} path={ListingPage.route}>
              <ListingPage.Component />
            </Route>
          </Switch>
        </main>
        <footer>

        </footer>
    </BrowserRouter>
  );
}

export default App;
