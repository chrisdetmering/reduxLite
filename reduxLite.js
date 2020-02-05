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
    const nextState = {};
    let stateChanged = false; 
    
    Object.keys(config).forEach(k => {
      if (!action) {
        var args = [, { type: '__initialize' }];
        nextState[k] = config[k](...args);
      } else {
        nextState[k] = config[k](prevState[k], action);

        if (nextState[k] != prevState[k]) { 
          triggerCallBacks(subscriptions, nextState)
        }

      }
    });
    
    return nextState;
  }
}


function triggerCallBacks(subscriptions, nextState) {
  subscriptions.forEach(cb => cb(nextState));
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

store.getState() // => { number: 0 }

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