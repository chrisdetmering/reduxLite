class Store { 
  constructor(rootReducer){ 
    this.rootReducer = rootReducer; 
    this.state = this.rootReducer();
    this.subscriptions = [];
    this.getState = this.getState.bind(this);
  }

  getState(){ 
    return Object.assign({}, this.state);  
  }

  dispatch(action) { 
    this.state = this.rootReducer(this.state, action, this.subscriptions);
  }

  subscribe(cb) { 
    this.subscriptions.push(cb);
  }

  
}

const createStore = (...args) => new Store (...args);


const combineReducers = config => {
  return (prevState, action, subscriptions) => {

    const stateManager = new StateManager(config, action, prevState)
    stateManager.handleAction(action);

    if (stateManager.isStateChanged()) { 
      return stateManager.callSubscriptionsAndReturnState(subscriptions)
    }
    return stateManager.getPreviousState();
  }
}


class StateManager { 
  constructor(config = {}, action = {}, prevState = {})  {
    this.config = config;
    this.reducers = Object.keys(config); 
    this.action = action; 
    this.prevState = prevState;
    this.stateChanged = false;  
    this.nextState = {};
  }

  handleAction(action) { 
    this.getReducers().forEach(key => {
      if (!action) {
        this.noAction(key)
      } else {
        this.withAction(key)
      }
    });
  }

  getReducers() { 
    return this.reducers;
  }

  isStateChanged() { 
    return this.stateChanged;
  }

  noAction(key) { 
    var args = [, { type: '__initialize' }];
    this.nextState[key] = this.config[key](...args);
    this.stateChanged = true;
  }

  withAction(key) { 
    let next = this.config[key](this.prevState[key], this.action);

    if (next !== this.prevState[key]) { this.stateChanged = true; }
    this.nextState[key] = next;
  }
  
  getPreviousState() { 
    return this.prevState; 
  }

  getNextState() { 
    return this.nextState;
  }

  callSubscriptionsAndReturnState(subscriptions) {
    if (subscriptions) {
      subscriptions.forEach(cb => cb(this.nextState));
    }
    return this.nextState;
  }

}



const actionCreator1 = value => ({
  type: "add",
  value
});

const actionCreator2 = value => ({
  type: "subtract",
  value
});

const actionCreator3 = value => ({
  type: "no change",
  value
});

const numberReducer = (num = 0, action) => {
  switch (action.type) {
    case "add":
      return num + action.value;
    case "subtract":
      return num - action.value;
    default:
      return num;
  }
}

const rootReducer = combineReducers({
  number: numberReducer
});

const store = new Store(rootReducer);

console.log(store.getState()) // => { number: 0 }

const announceStateChange = nextState => {
  console.log(`That action changed the state! Number is now ${nextState.number}`);
}

store.subscribe(announceStateChange);

store.dispatch(actionCreator1(5)); // => "That action changed the state! Number is now 5"
store.dispatch(actionCreator1(5)); // => "That action changed the state! Number is now 10"
store.dispatch(actionCreator2(7)); // => "That action changed the state! Number is now 3"
store.dispatch(actionCreator3(7)); // => Nothing should happen! The reducer doesn't do anything for type "no change"
store.dispatch(actionCreator1(0)) // => Nothing should happen here either. Even though the reducer checks for the "add" action type, adding 0 to the number won't result in a state change.

store.getState();