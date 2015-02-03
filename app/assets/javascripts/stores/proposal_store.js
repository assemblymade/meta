var ActionTypes = window.CONSTANTS.ActionTypes
var Store = require('./es6_store')

var _percent = 0
var _approved = null
var _state = null

class ProposalStore extends Store {
  constructor() {

    Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PROPOSAL_VOTE:
          _percent = action.percent
          _approved = action.approved
          _state = action.state
          this.emitChange()
          break
        case ActionTypes.PROPOSAL_INIT:
          _percent = action.percent
          _approved = action.approved
          _state = action.state
          this.emitChange()
          break
      }
    })
  }

  getPercent() {
    return _percent
  }

  getApproved() {
    return _approved
  }

  getState() {
    return _state
  }
}

// var dataTag = document.getElementById('ProposalStore')
// if (dataTag) {
//   Dispatcher.dispatch({
//     type: ActionTypes.APPS_RECEIVE,
//     apps: JSON.parse(dataTag.innerHTML)
//   })
// }

module.exports = new ProposalStore()
