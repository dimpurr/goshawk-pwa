import logo from './logo.svg';
import './App.css';
import { Providers } from '@microsoft/mgt-element';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import { Login } from '@microsoft/mgt-react';


Providers.globalProvider = new Msal2Provider({
  clientId: 'b55064f9-3aaf-4e3b-9812-9f0bded04875'
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Login />
      </header>
    </div>
  );
}

export default App;
