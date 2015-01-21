var ProposalListItem = require('./proposal_list_item.js.jsx')

var ProposalList = React.createClass({
  displayName: 'ProposalList',

  propTypes: {
    proposals: React.PropTypes.array.isRequired,
    product: React.PropTypes.object
  },

  render: function() {
    return (
      <div className="row mt0">
        <div className="col-xs-10 col-xs-offset-1">
          {this.renderProposals()}
        </div>
      </div>
    );
  },

  renderProposals: function() {
    var proposals = this.props.proposals;

    return _.map(proposals, function(proposal) {
      return <ProposalListItem proposal={proposal} />;
    });
  }

});

module.exports = ProposalList;
