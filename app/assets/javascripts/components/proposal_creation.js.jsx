var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./tile.js.jsx')
var ProgressBar = require('./ui/progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var MarkdownEditor = require('./markdown_editor.js.jsx');
var DatePicker = require('react-datepicker-component/DatePicker.jsx')
var DatePickerInput = require('react-datepicker-component/DatePickerInput.jsx')
var NewComment = require('./news_feed/new_comment.js.jsx');
var NewCommentStore = require('../stores/new_comment_store');

var ProposalCreation = React.createClass({
  displayName: 'ProposalCreation',
  propTypes: {
    user: React.PropTypes.object,
    product: React.PropTypes.object,
    contract_type: React.PropTypes.string
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
      date: ""
    };
  },

  introText: function() {
    if (this.props.contract_type === "vesting")
      return (
        <div className = "py3">
          <Tile>
            <div className = "py2 px3">
              <h4>Vesting Contract</h4>
              <div className="row">
                <div className = "col-md-10 col-md-offset-1">
                  Schedule a payment of coins to a specific user for a specific purpose.  As an example, a user
                  could be paid for recurring support with a vesting schedule of coins.  Instead of separate bounties
                  for each task, a vesting schedule can capture a broad range of small activities.
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
        <h1 className="mt0">Create a new Proposal</h1>
        {this.introText()}
      </div>
    )
  },

  renderHelp: function() {
    return (
      <div className = "py1 px3 bg-white rounded shadow">
        <Tile>
          <h4>Propose a Resolution</h4>
          Owners can vote on new product initiatives.  Their votes are weighted by ownership.
        </Tile>
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
      <div>
        <TypeaheadUserInput autofocus="autofocus"
          className="form-control"
          data-validate-length="2"
          type="text"
          required="true"
          onTextChange={this.handleUsernameSelection} />
      </div>
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
        <input type="date" onChange = {this.handleTextChange('date')}/>
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

            <div className="form-group form-group-lg">
              <label className="control-label">
                Vesting Recipient Username
              </label>
              <div>
               {this.renderUserPicker()}
              </div>
            </div>

            <div className="form-group form-group-lg">
              <label className="control-label">
                Coins to Award
              </label>
              <div><input className="form-control" value={this.state.coins} type="number" onChange={this.handleTextChange('coins')}></input></div>
            </div>

            <div className="form-group form-group-lg">
              <label className="control-label">
                Award in X Days
              </label>
              <div>
                {this.renderDatePicker()}
              </div>
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
    var the_url = ""
    var proposaldata = {name: this.state.name, description: this.state.description, recipient: this.state.recipient, coins: this.state.coins, date: this.state.date}

    var proposalComponent = this
    $.ajax({
      method: 'POST',
      url: the_url,
      json: true,
      data: proposaldata,
      });
    }
});

module.exports = window.ProposalCreation = ProposalCreation;
