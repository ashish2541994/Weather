import React, { Component } from 'react';
import './App.css';
import Weather from './Components/Weather'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Weather/>
      </div>
    );
  }
}

export default App;
