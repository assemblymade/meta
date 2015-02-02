var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var Tile = require('./ui/tile.js.jsx')

var Contracts = React.createClass({
  displayName: 'Contracts',
  propTypes: {
    proposals: React.PropTypes.array
  },

  renderActiveContracts: function() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Created on</th>
              <th>Expires on</th>
              <th>Terms</th>
              <th>Vote</th>
            </tr>
          </thead>
          <tbody>
            {
            console.log(this.props.proposals)
            }
          </tbody>
        </table>
      </div>
    )
  },

  renderExpiredContracts: function() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Created on</th>
              <th>Expires on</th>
              <th>Terms</th>
              <th>Vote</th>
            </tr>
          </thead>
          <tbody>

          </tbody>
        </table>
      </div>
    )
  },

  render: function() {
    return (
      <div>
        <Tile>
        <div className="clearfix px2 py2">
          <div className="col-10">
            <h4>Active Contracts</h4>
            {this.renderActiveContracts()}
          </div>
        </div>
      </Tile>
      <div className="clearfix py3 mt3"></div>
      <Tile>
        <div className="clearfix px2 py2">
          <div className="col-10">
            <h4>Expired Contracts</h4>
              {this.renderExpiredContracts()}
          </div>
        </div>
      </Tile>
      </div>
    )
  }
})

module.exports = window.Contracts = Contracts;
