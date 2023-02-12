import logo from './logo.svg';
import './App.css';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import { Agenda, FileList, Login } from '@microsoft/mgt-react';
import React, { useState, useEffect } from 'react';
import { Providers, ProviderState } from '@microsoft/mgt-element';

Providers.globalProvider = new Msal2Provider({
  clientId: 'b55064f9-3aaf-4e3b-9812-9f0bded04875',
  scopes: ['calendars.read', 'user.read', 'openid', 'profile', 'people.read', 'user.readbasic.all']
});

const provider = Providers.globalProvider;

function useIsSignedIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const updateState = () => {
      const provider = Providers.globalProvider;
      setIsSignedIn(provider && provider.state === ProviderState.SignedIn);
    };

    Providers.onProviderUpdated(updateState);
    updateState();

    return () => {
      Providers.removeProviderUpdatedListener(updateState);
    }
  }, []);

  return [isSignedIn];
}

const getUserDetails = async (usd, setUsd, path = 'root') => {
  if (provider) {
    let graphClient = provider.graph.client;
    let fds = []
    let userDetails = await graphClient.api('/me/drive/items/' + path + ':/images:/children/').get();
    userDetails?.value?.map(async (it) => {
      if (it.name.indexOf('.info')) {
        let a = await getPicInFolder(it.id);
        // console.log(a)
        a.map((i) => {
          if (i != '') {
            usd.push(i)
            setUsd(usd)
            // console.log(i)
          }
        })
      }
    })
  }
}

const getPicInFolder = async (id) => {
  if (provider) {
    let graphClient = provider.graph.client;
    let picFolder = await graphClient.api('/me/drive/items/' + id + '/children/').get();
    return picFolder?.value?.map((it) => {
      // console.log(it.name)
      let rst = ''
      if ((it.name.indexOf('thumb') === -1) && (it.name.indexOf('png') > 0 || it.name.indexOf('jpg')>0)) {
        // console.log('pass'+it.name)
        rst = it.id
      }
      return rst
    })
  }
}

function App() {
  const [isSignedIn] = useIsSignedIn();
  const [filepath, setFilepath] = useState();  
  const [filename, setFilename] = useState('');  
  const [backpath, setBackpath] = useState([]);  
  const [eagleroot, setEagleroot] = useState('');  
  const [usd, setUsd] = useState([]);  

  return (
    <div className="App">
      <header className="App-header">
        <Login />
        {/* fp {filepath}<br/>
        fn {filename}<br />
        q {'/me/drive/items/' + filepath + '/children'}<br />
        bp {JSON.stringify(backpath)}<br /> */}
        {isSignedIn &&
          <div class="ctn">
            <div
              style={{cursor: 'pointer'}}
              onClick={() => {
              if (backpath.length >= 1) {
                setFilepath(backpath[backpath.length - 1])
                const trail = backpath.pop()
                setBackpath(backpath)
              }
            }}>
              Go Parent
            </div>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setEagleroot(filepath)
                getUserDetails(usd, setUsd, eagleroot)
              }}>
              Set Eagle Root
            </div>
            {/* <Agenda /> */}
            <div class="onedrive">
              <FileList itemClick={(e) => {
                if (e.detail && e.detail.folder) {
                  backpath.push(e.detail.parentReference.id)
                  setBackpath(backpath)
                  const id = e.detail.id;
                  const name = e.detail.name;
                  setFilename(name);
                  setFilepath(id);
                }
              }}
                fileListQuery={filepath ? '/me/drive/items/'+filepath+'/children' : ''}
                itemID={filepath}
              ></FileList>
            </div>
            <div class="eagle">
              {eagleroot ? <div>
                {JSON.stringify(usd)}
              </div> : 'not set'}
            </div>
          </div>}
      </header>
    </div>
  );
}

export default App;
