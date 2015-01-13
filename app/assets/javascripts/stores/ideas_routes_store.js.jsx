var CONSTANTS = window.CONSTANTS // require('../constants')
var ActionTypes = CONSTANTS.ActionTypes
var Store = require('./es6_store')

var currentComponent = null
var currentContext = {}

class IdeasRoutesStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.IDEAS_ROUTE_CHANGED:
          _setData(action)
          this.emitChange()
          break
        case ActionTypes.IDEAS_ROUTE_CHANGING:
          _setScrim(action)
          this.emitChange()
          break
      }
    })
  }

  getComponent() {
    return currentComponent
  }

  getContext() {
    return currentContext
  }
}

module.exports = new IdeasRoutesStore()

function _setData(action) {
  currentComponent = action.component || currentComponent
  currentContext = action.context || currentContext
}

function _setScrim(action) {
  var Scrim = action.component
  var Component = currentComponent

  currentComponent = React.createClass({
    displayName: 'TempComponent',
    render() {
      return (
        <Scrim>
          {Component ? <Component {...this.props} /> : null}
        </Scrim>
      );
    }
  })
}
