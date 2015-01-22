var Accordion = require('../accordion.js.jsx');
var Spinner = require('../spinner.js.jsx');
var TextPost = require('../ui/text_post.js.jsx')
var Tile = require('../tile.js.jsx')
var ProgressBar = require('../progress_bar.js.jsx')
var Button = require('../ui/button.js.jsx')
var ProposalList = require('./proposal_list.js.jsx')


var Governance = React.createClass({
  displayName: 'Governance',
  propTypes: {
    product: React.PropTypes.object
  },

  render: function() {
    return (
      <div>
        <div className="py2 col-xs-8 r768_pr0">
          <ProposalList proposals={this.props.product.proposals} product={this.props.product} />
        </div>

        <div className = "col-xs-4 r768_pr0">
          <Tile>
            {this.renderText()}
          </Tile>
        </div>

      </div>
    );
  },

  renderText: function() {
    return (
      <div className="h4 center px3 py3" style={{ paddingTop: '1rem' }}>
        <div className="black">
          Create a New Proposal
        </div>
        <div className="px3 py3">
          <button className = "btn btn-info">Vesting Contract</button>
        </div>
        <div className="px3 py3">
          <button className = "btn">Others Coming Soon</button>
        </div>
      </div>
    );
  },

});

module.exports = window.Governance = Governance;
