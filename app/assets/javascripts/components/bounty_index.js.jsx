/** @jsx React.DOM */

(function() {
  var BountyFilter = require('./bounty_filter.js.jsx')
  var BountyList = require('./bounty_list.js.jsx')

  var BountyIndex = React.createClass({
    getInitialState: function() {
      return {
        bounties: []
      }
    },

    render: function() {
      bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

      return (
        <div>
          <BountyFilter {...bountyFilterProps} />

          <div className="border-top mt2 mb2"></div>
          
          <BountyList bounties={this.props.bounties} />
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyIndex
  }

  window.BountyIndex = BountyIndex
})();
