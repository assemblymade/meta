var Accordion = require('./accordion.js.jsx');
var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var UserStore = require('../stores/user_store')

var Proposal = React.createClass({
  displayName: 'Proposal',
  propTypes: {
    newsFeedItem: React.PropTypes.object,
    user: React.PropTypes.object,
    proposal: React.PropTypes.object
  },

  render: function() {
    return (
      <div>
        {this.renderProposal()}
      </div>
    );
  },

  renderProposal: function() {


    return (
      <div>

        <div className="p4">
          <TextPost author={this.props.user} timestamp={this.props.newsFeedItem.created} title={this.props.proposal.name} body={this.props.proposal.description} labels={[]} />
        </div>

        <div className="px3 py2 border-top border-bottom">
          <Love heartable_id={this.props.newsFeedItem.id} heartable_type="NewsFeedItem" />
        </div>


        {this.renderFooter()}

      </div>

    );
  },


  renderFooter: function() {
    return (
      <div className="card-footer px3 py2 clearfix">
        <ul className="list-inline mt0 mb0 py1 right">
        
        </ul>
      </div>
    )
  }


});

module.exports = window.Proposal = Proposal;
