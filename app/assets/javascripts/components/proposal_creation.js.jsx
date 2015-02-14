var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./ui/tile.js.jsx')
var ProgressBar = require('./ui/progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var MarkdownEditor = require('./markdown_editor.js.jsx');
var NewComment = require('./news_feed/new_comment.js.jsx');
var NewCommentStore = require('../stores/new_comment_store');

var ProposalCreation = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    product: React.PropTypes.object,
    contract_type: React.PropTypes.string,
    url: React.PropTypes.string
  },

  componentDidMount() {
    NewCommentStore.addChangeListener(this.descriptionUpdate);
  },

  componentWillUnmount() {
    NewCommentStore.removeChangeListener(this.descriptionUpdate);
  },

  descriptionUpdate: function() {
    var description = NewCommentStore.getComment("ProposalDescription")
    this.setState({description: description})
  },

  getInitialState: function() {
    return {
      approved: true,
      name: "",
      description: "",
      recipient: "",
      coins: 1000,
      date: "",
      contractType: "vesting"
    };
  },

  introText: function() {
    if (this.props.contract_type === "vesting")
      return (
        <div className = "py3">
          <Tile>
            <div className = "py2 px3">
              <div className="row">
                <div className = "col-md-10 col-md-offset-1">
                  Proposals are forums for product owners to make decisions governing the fate of the product as a whole.
                  Inside each proposal is one or more contracts: self-executing decisions on a product.  There are many different
                  kinds of potential contracts; we'll be rolling out more contract types in the near future.
                </div>
              </div>

              <div className = "row mt1">
                <div  className = "col-md-10 col-md-offset-1">
                  Each proposal must meet a high bar before it is enacted; More than 50% of participants, weighted by ownership,
                  must sign-off on any given proposal.  We think a high threshold should protect owners from abuse.
                </div>
              </div>
            </div>
          </Tile>
        </div>
      )

  },

  renderTitle: function() {
    return (
      <div>
        <h1 className="mt0">Propose a Contract</h1>
        {this.introText()}
      </div>
    )
  },

  renderHelp: function() {
    return (
      <div className = "py1 px1 rounded shadow gray-2">

          <h5>Existing Contract Types</h5>
          <ul>
            <li>
              <span className="bold">Payment Schedule</span>
            </li>
            <p>
              Pay a contributor on a regular basis for recurring work.
              For example, someone doing support could be paid regularly by a Payment Schedule Contract
              without having to create and award numerous small bounties.
            </p>
          </ul>
          <h4>Upcoming Contract Types</h4>
          <ul>
            <li className="bold">Elect Core Team Member</li>
            <li className="bold">Remove Core Team Member</li>
            <li className="bold">Mint New Coins</li>
            <li className="bold">Pivot the Product</li>
          </ul>


      </div>
    )
  },

  handleTextChange: function(stateProp) {
    return function(event) {
      var state = {};
      state[stateProp] = event.target.value;
      this.setState(state);
    }.bind(this);
  },

  handleUsernameSelection: function(username) {
    this.setState({
      recipient: username
    });
  },

  renderUserPicker: function() {
    return (
      <TypeaheadUserInput autofocus="autofocus"
          className="form-control"
          data-validate-length="2"
          type="text"
          required="true"
          onTextChange={this.handleUsernameSelection} />
    )
  },

  renderDescriptionBox: function() {
    return (
      <div>
        <NewComment canContainWork={false}
          dropzoneInnerText={false}
          hideAvatar={true}
          hideButtons={true}
          placeholder={''}
          thread="ProposalDescription"
          url="/proposals/not-applicable" />
      </div>
    )
  },

  renderDatePicker: function(){
    return (
      <div>
        <input type="date" onChange={this.handleTextChange('date')}/>
      </div>
    )
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
              {this.renderDescriptionBox()}
            </div>
          </fieldset>
        </form>

        <div>
          {this.renderContractLogic()}
        </div>

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

  renderContractOptions: function() {
    if (this.state.contractType === "vesting") {
      return (
        <div>
          <div className="clearfix">
            <div className="col col-5 mt2">
              <label className="control-label">
                Recipient Username
              </label>
            </div>
            <div className="col col-5 py1">
             {this.renderUserPicker()}
            </div>
          </div>

          <div className="clearfix mt3">
            <div className="col-5 col mt1">
              <label className="control-label">
                Coins to Award
              </label>
            </div>
            <div className="col col-5">
              <input className="form-control" value={this.state.coins} type="number" onChange={this.handleTextChange('coins')}></input>
            </div>
        </div>

        <div className="clearfix mt3">
          <div className="col col-5 mt1">
              <label className="control-label">
                Payment Date
              </label>
          </div>

          <div className="col col-5">
            {this.renderDatePicker()}
          </div>
        </div>

        <div className="clearfix py2">
          <div className="center py2 mb2">
            {this.acceptButton()}
          </div>
        </div>

      </div>

      )
    }
  },

  setVesting: function() {

  },

  renderContractLogic: function() {
    return (
      <Tile>
        <div className="px2 mb1">
          <div>
            <h3 className="center py2">Contract Logic</h3>
          </div>
          <div>
            <span className="bold px2 py1">Type</span>
            <form className = "px2 py1" action="">
              <input type="radio" name="contractType" value="payment" action={this.setVesting()} checked="checked">  Payment Schedule</input>
            </form>
          </div>
          <div className="mt2">
            {this.renderContractOptions()}
          </div>
        </div>
      </Tile>
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
        <div className="col-md-3 col-md-offset-1 mt3">
          <div className = "row">
            {this.renderHelp()}
          </div>
        </div>
      </div>
    );
  },

  toggle_create: function(e) {
    e.preventDefault()
    newurl = this.props.product.url
    var proposaldata = {name: this.state.name, description: this.state.description, recipient: this.state.recipient, coins: this.state.coins, date: this.state.date}
    the_url = this.props.url

    var proposalComponent = this
    $.ajax({
      method: 'POST',
      url: the_url,
      json: true,
      data: proposaldata,
      success: function() {
        window.location = newurl
      }
      });

    }
});

module.exports = window.ProposalCreation = ProposalCreation;
