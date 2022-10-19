import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.png';

import './index.css';

function App() {
    return (
        <div className='app'>
            <h1>Hi, Vite2</h1>
            <p><img className="app-logo" src={logo} alt="logo" /></p>
        </div>
    );
}
ReactDOM.render(<App />, document.querySelector('#app'));
 
// @ts-ignore
import.meta.hot.accept(() => {
    ReactDOM.render(<App />, document.querySelector('#app'));
});
