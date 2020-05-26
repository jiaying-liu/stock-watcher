import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import reducers from './reducers'

import { Container } from '@material-ui/core'
import Header from './components/Header'
import Login from './components/Login'
import Home from './components/Home'
import StockDetail from './components/StockDetail'

import './App.css'

const store = createStore(reducers, {}, applyMiddleware(reduxThunk))

function App () {
  return (
    <Provider store={store}>
      <div className="stock-watcher-root">
        <Router>
          <Header />
          <Container className="stock-watcher-root">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path='/stocks/:symbol' component={StockDetail} />
              <Route exact path="/login" component={Login} />
            </Switch>
          </Container>
        </Router>
      </div>
    </Provider>
  )
}

export default App;
