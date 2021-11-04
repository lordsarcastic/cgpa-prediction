import React, { createContext, Dispatch, ReactNode, SetStateAction, useMemo, useState } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Modal from './Modal';
import { ListingPage } from './pages/DatasetList';

export type ModalChildType = ReactNode | undefined

export type ModalContextType = {
  visible: boolean,
  setVisible: Dispatch<SetStateAction<boolean>>,
  children: ModalChildType,
  setChildren: Dispatch<ModalChildType>
}

export const ModalContext = createContext<ModalContextType>({} as ModalContextType)

function App() {
  const [visible, setVisible] = useState<boolean>(false);
  const [children, setChildren] = useState<ModalChildType>(undefined)

  const memoedValue = useMemo(() => ({
    visible,
    setVisible,
    children,
    setChildren
  }), [visible, setVisible, children, setChildren])

  return (
    <BrowserRouter>
      <ModalContext.Provider value={memoedValue}>
        <header>

        </header>
        <main className="flex justify-center items-center py-16 px-16 bg-blue-50">
          <Modal />
          <Switch>
            <Route exact={ListingPage.exact} path={ListingPage.route}>
              <ListingPage.Component />
            </Route>
          </Switch>
        </main>
        <footer>

        </footer>
      </ModalContext.Provider>
    </BrowserRouter>
  );
}

export default App;
