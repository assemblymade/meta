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
        <div className="col-xs-12 col-sm-8 r768_pr0">
          <ProposalList proposals={this.props.product.proposals} product={this.props.product} />
        </div>
      </div>
    );
  },

});

module.exports = window.Governance = Governance;
