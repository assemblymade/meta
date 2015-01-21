var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./tile.js.jsx')
var ProgressBar = require('./progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var MarkdownEditor = require('./markdown_editor.js.jsx');

var ProposalEdit = React.createClass({
  displayName: 'ProposalEdit',
  propTypes: {
    newsFeedItem: React.PropTypes.object,
    user: React.PropTypes.object,
    proposal: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      approved: true
    };
  },

  renderTitle: function() {
    return (

      <h1 class="mt0">Create a new Proposal</h1>

    )
  },

  renderBoxes: function() {
    return (
      <div>
        <form>
          <div className="form-group form-group-lg">
            <label class="control-label">
              Proposal Name
            </label>
            <div><input class="form-control" type="text"></input></div>
          </div>

          <div className="form-group">
            <label className="control-label">
              Proposal Description
            </label>
            <MarkdownEditor />
          </div>

          <div className="form-group form-group-lg">
            <label class="control-label">
              Vesting Recipient Username
            </label>
            <div><input class="form-control" type="text"></input></div>
          </div>

          <div className="form-group form-group-lg">
            <label class="control-label">
              Coins to Award
            </label>
            <div><input class="form-control" type="text"></input></div>
          </div>

        </form>
      </div>
    )
  },

  acceptButton: function() {
    var text="Create Proposal"
    var css = "btn btn-info"


    return (
      <div className="center">
        <button className = {css} onClick={this.submitProposal()}>
          {text}
        </button>
      </div>
    )
  },

  submitProposal: function() {
      var proposaldata = {}
    $.ajax({
      method: 'POST',
      url: "/choices",
      json: true,
      data: { body: proposaldata }
    });
  },

  render: function() {
    return (

      <div className="col-md-8">
        {this.renderTitle()}
        <div class="clearfix mxn2">
          <div class="col col-9 px2">
            {this.renderBoxes()}
            {this.acceptButton()}
          </div>
        </div>
      </div>
    );
  }


});

module.exports = window.ProposalEdit = ProposalEdit;
