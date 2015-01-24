var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./tile.js.jsx')
var ProgressBar = require('./progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var MarkdownEditor = require('./markdown_editor.js.jsx');

var ProposalMake = React.createClass({
  displayName: 'ProposalMake',
  propTypes: {
    user: React.PropTypes.object,
    product: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      approved: true,
      name: "",
      description: "",
      recipient: "",
      coins: "",
      date: ""
    };
  },

  renderTitle: function() {
    return (
      <h1 className="mt0">Create a new Proposal</h1>
    )
  },

  renderHelp: function() {
    return (
      <div className = "py2 bg-white rounded shadow mb2">
        <Tile>
          <h4>Propose a resolution for the product</h4>
          Owners can vote on new product initiatives.
        </Tile>
      </div>
    )
  },

  handleTextChange: function(stateProp) {
    return function(event) {
      var state = {};

      console.log(state)
      state[stateProp] = event.target.value;
      this.setState(state);
      console.log(this.state)
    }.bind(this);
  },

  renderBoxes: function() {
    return (
      <div>
        <form>
            <fieldset>
            <div className="form-group form-group-lg">
              <label className="control-label">
                Proposal Name
              </label>
              <div><input className="form-control" type="text" onChange={this.handleTextChange('name')}></input></div>
            </div>

            <div className="form-group">
              <label className="control-label">
                Proposal Description
              </label>
              <input className="form-control" type="text" onChange={this.handleTextChange('description')}></input>
            </div>

            <div className="form-group form-group-lg">
              <label className="control-label">
                Vesting Recipient Username
              </label>
              <div>
                <input className="form-control" type="text" onChange={this.handleTextChange('recipient')}></input>
              </div>
            </div>

            <div className="form-group form-group-lg">
              <label className="control-label">
                Coins to Award
              </label>
              <div><input className="form-control" type="text" onChange={this.handleTextChange('coins')}></input></div>
            </div>

            <div className="form-group form-group-lg">
              <label className="control-label">
                Award in X Days
              </label>
              <div><input className="form-control" type="text" onChange={this.handleTextChange('date')}></input></div>
            </div>

            {this.acceptButton()}
          </fieldset>
        </form>
      </div>
    )
  },

  acceptButton: function() {
    var text="Create Proposal"
    var css = "btn btn-info"

    return (
      <button className = {css} onClick={this.toggle_create}>
        {text}
      </button>
    )
  },

  render: function() {
    return (
      <div className="row">
        <div className="col-md-8">
          {this.renderTitle()}
          <div className="row">
            <div className="px2">
              {this.renderBoxes()}
            </div>
          </div>
        </div>

        <div className="col-md-3 col-md-offset-1">
          {this.renderHelp()}
        </div>
      </div>
    );
  },

  toggle_create: function(e) {
    e.preventDefault()
    var the_url = ""
    console.log(the_url)
    var proposaldata = {name: this.state.name, description: this.state.description, recipient: this.state.recipient, coins: this.state.coins, date: this.state.date}

    var proposalComponent = this
    $.ajax({
      method: 'POST',
      url: the_url,
      json: true,
      data: proposaldata,
      success: function(data) {
        console.log(proposaldata)
      }});
    }


});

module.exports = window.ProposalMake = ProposalMake;
