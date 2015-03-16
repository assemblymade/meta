var Accordion = require('../ui/accordion.js.jsx');
var Spinner = require('../spinner.js.jsx');
var TextPost = require('../ui/text_post.js.jsx')
var Tile = require('../ui/tile.js.jsx')
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
          <div className="row">
            <div className="py2 col-md-8">
              <ProposalList proposals={this.props.product.proposals} />
            </div>
            <div className = "py2 col-md-4">
              <Tile>
                {this.renderText()}
              </Tile>
              <div className = "mt3">
                <Tile>
                  {this.renderExplanation()}
                </Tile>
              </div>
            </div>
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
            <div className = "col-md-4">
              <Tile>
                {this.renderText()}
              </Tile>
              <Tile>
                {this.renderExplanation()}
              </Tile>
            </div>
          </div>
        </div>
      );
    }
  },

  renderText: function() {
    var link = "/"+this.props.product.slug + "/proposals/"

    return (
      <div className="h4 center px3 py3" style={{ paddingTop: '1rem' }}>
        <div className="black">
          Propose a New Product Contract
        </div>
        <div className="px2 py3">
          <form action={link}>
            <input type="submit" className = "btn btn-info" value="Create Proposal"></input>
          </form>
        </div>
      </div>
    );
  },

  renderExplanation: function() {
    return (
      <div className="h4 center px3 py3" style={{ paddingTop: '1rem' }}>
        <div className = "black">
          <p>
            Product Contracts are binding collective agreements specific to each product.
            Use them to decide initiatives across the whole team. </p>
          <p>Every owner gets a say
            because contracts can affect the whole product.
          </p>
        </div>
      </div>
    )
  },

});

module.exports = window.Governance = Governance;
