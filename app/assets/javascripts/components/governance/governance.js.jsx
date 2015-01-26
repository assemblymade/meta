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
    if (this.props.product.proposals.length > 0) {
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
    }
    else {
      return (
        <div>
          <div className = "py2 col-md-12 ">
            <div className = "col-md-8">
              <h3>There are no proposals yet for this product</h3>
            </div>
            <div className = "col-md-3 col-md-offset-1">
              <Tile>
                {this.renderText()}
              </Tile>
            </div>
          </div>
        </div>
      );
    }
  },

  renderText: function() {
    var link = "/"+this.props.product.slug + "/proposals/"
    console.log(link)

    return (
      <div className="h4 center px3 py3" style={{ paddingTop: '1rem' }}>
        <div className="black">
          Create a New Proposal
        </div>
        <div className="px2 mb2">
          <form action={link}>
            <input type="submit" className = "btn btn-info" value="Vesting Contract"></input>
          </form>

        </div>
        <label className="h6 py2 center">
          Pay someone on a schedule for miscellaneous work.
        </label>
        <div className="px2 py2">
          <button className = "btn">Others Coming Soon</button>
        </div>
      </div>
    );
  },

});

module.exports = window.Governance = Governance;
