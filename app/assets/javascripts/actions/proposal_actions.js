var ActionTypes = require('../constants').ActionTypes;
var Dispatcher = require('../dispatcher');
var ProductStore = require('../stores/product_store.js')

var ProposalActions = {

  vote: function(proposal_id) {
    var product_slug = ProductStore.getSlug()
    var choicedata = {proposal_id: proposal_id}

    var proposalComponent = this
    $.ajax({
      method: 'POST',
      url: "/choices",
      json: true,
      data: choicedata,
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.PROPOSAL_VOTE,
          percent: data.progress,
          approved: data.approved,
          state: data.state
        });
      }
    });
  },

  init: function(percent, approved, state) {
    Dispatcher.dispatch({
      type: ActionTypes.PROPOSAL_INIT,
      percent: percent,
      approved: approved,
      state: state
    })
  }

};

module.exports = ProposalActions;
