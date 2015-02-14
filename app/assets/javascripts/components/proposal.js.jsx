var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')
var Tile = require('./ui/tile.js.jsx')
var ProgressBar = require('./ui/progress_bar.js.jsx')
var Button = require('./ui/button.js.jsx')
var Heart = require('./heart.js.jsx')
var ProposalActions = require('../actions/proposal_actions.js')
var ProposalStore = require('../stores/proposal_store')

var Proposal = React.createClass({
  propTypes: {
    newsFeedItem: React.PropTypes.object,
    user: React.PropTypes.object,
    proposal: React.PropTypes.object,
    userVoteState: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      approved: ProposalStore.getApproved(),
      percent: ProposalStore.getPercent(),
      state: ProposalStore.getState()
    };
  },

  componentDidMount: function() {
    ProposalActions.init(this.props.proposal.status, this.props.userVoteState, this.props.proposal.state)
    ProposalStore.addChangeListener(this.onChange)

    this.setState({
      approved: ProposalStore.getApproved(),
      percent: ProposalStore.getPercent(),
      state: ProposalStore.getState()
    })

  },

  onChange: function() {
    this.setState({
      approved: ProposalStore.getApproved(),
      percent: ProposalStore.getPercent(),
      state: ProposalStore.getState()
    })
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

    if (this.props.proposal.state === "open") {
      return (
        <button className={css} onClick={this.toggle_vote}>
          {text}
        </button>
      )
    } else {
      return (
        <button className="btn btn-info py1" disabled>
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
      css = "bg-blue white py1 bold px2 col-4 mx-auto"
      text = "Open"
    }
    else if (state === "failed") {
      css = "bg-red white center py1 bold px2 col-4 mx-auto"
      text = "Failed"
    }
    else if (state === "passed") {
      css = "bg-green white center bold px1 py2 col-4 mx-auto"
      text = "Passed"
    }
    return (
      <div>
        <div className="clearfix center">
          <div className={css}>
            {text}
          </div>
        </div>
        <div className="clearfix mt2 bold gray-2">
          {this.props.proposal.time_left_text}
        </div>
      </div>

      )
  },

  renderVestings: function() {
    var table_style = {
      border: '1px solid'
    }
    return (
      <div>
        <h5>Vesting Schedule</h5>
        <table className="table table-responsive table-hover" style={table_style}>
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
        <div></div>
      )}
    },

    renderProgress: function() {
      var myStyle = "";
      var state = this.state.state
      if (state === "passed"){
        myStyle = "success"
      }
      else if (state === "failed") {
        myStyle = "danger"
      }
      else if (state === "closed") {
        myStyle = "success";
      }
      else if(state === "expired") {
        myStyle = "gray"
      }
      else if (state === "open") {
        myStyle = "primary"
      }
      return (
        <ProgressBar progress={this.state.percent} threshold = {50} type = {myStyle} />
      )
    },

  renderProposal: function() {
    return (
      <div>
        <Tile>
          <div className="clearfix">
            <div className="col col-7">
              <div className="p4">
                <TextPost author={this.props.user} timestamp={this.props.proposal.created} title={this.props.proposal.name} body={this.props.proposal.description} labels={[]} />
              </div>
            </div>
            <div className="col col-4 mx-auto">
              <div className="clearfix py3">
              </div>
              <div className="clearfix py3">
                {this.renderProgress()}
              </div>
              <div className="clearfix py2">
                <div className="col-4 mx-auto">
                  {this.renderSubmit()}
                </div>
              </div>
              <div className="clearfix py2 center">
                <div className="center">
                  {this.renderState()}
                </div>
              </div>
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
      ProposalActions.vote(this.props.proposal.id)
    }

  });

    module.exports = window.Proposal = Proposal;
