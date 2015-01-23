var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./tile.js.jsx')
var ProgressBar = require('./progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var Heart = require('./heart.js.jsx')

var Proposal = React.createClass({
  displayName: 'Proposal',
  propTypes: {
    newsFeedItem: React.PropTypes.object,
    user: React.PropTypes.object,
    proposal: React.PropTypes.object,
    user_vote_state: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      approved: this.props.user_vote_state,
      percent: this.props.proposal.status,
      state: this.props.proposal.state
    };
  },

  render: function() {
    return (
      <div>
        {this.renderProposal()}
      </div>
    );
  },

  renderSubmit: function() {
    var text = this.state.approved ? 'Unvote' : 'Approve'
    var css = this.state.approved ? 'btn btn-danger' : 'btn btn-success'

    if (this.props.proposal.state==="open")
      {return (
        <button className = {css} onClick={this.toggle_vote}>
        {text}
      </button>
      )}
    else
      {
        css = 'btn btn-info'
        return (
          <button className = {css} disabled>
            Voting Closed
          </button>
        )
      }
  },

  renderState: function() {
    var state = this.state.state
    var css = ""
    var text = ""
    if (state === "open") {
      css = "btn btn-default center py3"
      text = "Open"
    }
    else if (state === "failed") {
      css = "btn btn-danger center py3"
      text = "Failed"
    }
    else if (state === "passed") {
      css = "btn btn-success center py3"
      text = "Passed"
    }
    return (
      <button className = {css} disabled>
        {text}
      </button>
      )
  },

  renderVestings: function() {
    var table_style = {
      border: '1px solid'
    }
    return (
      <div>
        <h5>Vesting Schedule</h5>
        <table class="table table-responsive table-hover" style={table_style}>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Coins</th>
              <th>Product</th>
              <th>Vesting Date</th>
              <th></th>
            </tr>
          </thead>
          {
            _(this.props.proposal.contracts).map(a=>
              <tbody>
                <td><a href= {a.user.url}>{a.user.username}</a></td>
                <td>{a.coins}</td>
                <td><a href={a.product.url}>{a.product.name}</a></td>
                <td>{a.vesting_date_formatted}</td>
              </tbody>
            )
          }
        </table>
      </div>
    )
  },

  renderAgreements: function() {
    if (this.props.proposal.contracts.length > 0) {
      return (
        this.renderVestings()
      )
    }
    else {
      return (
        <div>
        </div>
      )
    }

    },

  renderProposal: function() {
    var my_style = 'progress-success';
    var progress_style = {
      position: 'relative',
      top: "50%",
      transform: "translateY(120%)"
    }

    return (
      <div>
        <Tile>
          <div className="row">
            <div className="col-md-7">
              <div className="p4">
                <TextPost author={this.props.user} timestamp={this.props.proposal.created} title={this.props.proposal.name} body={this.props.proposal.description} labels={[]} />
              </div>
            </div>

            <div className="col-md-4" style = {progress_style} >
              <div className="row">
                <ProgressBar percent={this.state.percent} style = {my_style} />
              </div>
              <div className = "row">
                <div className = "col-md-offset-3">
                  {this.renderSubmit()}
                </div>
              </div>
              <div className="row col-md-offset-3 py3">
                {this.renderState()}
              </div>
            </div>
          </div>

          <div className="row py3">
            <div className="col-md-6 col-md-offset-1">
              {this.renderAgreements()}
            </div>
          </div>

          <div className="px3 py2 border-top border-bottom">
            <Heart heartable_id={this.props.newsFeedItem.id} heartable_type="NewsFeedItem" size="small"/>
          </div>

          <div className="border-top border-gray-5">
            <NewsFeedItemComments commentable={true} item={this.props.newsFeedItem} showAllComments={true} />
          </div>
        </Tile>
      </div>
    );
  },

    toggle_vote: function(e) {
      e.preventDefault()

      var choicedata = {proposal: this.props.proposal.id}

      var proposalComponent = this
      $.ajax({
        method: 'POST',
        url: "/choices",
        json: true,
        data: choicedata,
      success: function(data) {
        proposalComponent.setState({percent: data.progress, approved: data.approved, state: data.state})
        console.log(data.progress)
      }});


    }

  });

    module.exports = window.Proposal = Proposal;
