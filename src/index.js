import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import SoloMode from './SoloMode'
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route } from 'react-router-dom'



ReactDOM.render(
  <Router>
    <Route path='/' component={SoloMode}/>
  </Router>
, document.getElementById('root'));
registerServiceWorker();
