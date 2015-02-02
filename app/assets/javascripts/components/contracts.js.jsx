var Spinner = require('./spinner.js.jsx');
var TextPost = require('./ui/text_post.js.jsx')
var Tile = require('./ui/tile.js.jsx')

var Contracts = React.createClass({
  displayName: 'Contracts',
  propTypes: {
    proposals: React.PropTypes.array,
    activeTipContracts: React.PropTypes.array,
    closedTipContracts: React.PropTypes.array
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
              this.renderActiveTipContracts()
            }
          </tbody>
        </table>
      </div>
    )
  },

  renderActiveTipContracts: function() {
    return (
      <div>
        {
          _(this.props.activeTipContracts).map(a=>
            <tr>
              <td><a href={a.username_link}>{a.username}</a></td>
              <td>Tip Contract</td>
              <td>{a.created_on}</td>
              <td>TBD</td>
              <td>Receives <b>{a.amount*100}%</b> of Coins awarded</td>
              <td>Grandfathered</td>
            </tr>
          )
        }
      </div>
    )
  },

  renderClosedTipContracts: function() {
    return (
      <div>
        {
          _(this.props.closedTipContracts).map(a=>
            <tr>
              <td><a href={a.username_link}>{a.username}</a></td>
              <td>Tip Contract</td>
              <td>{a.created_on}</td>
              <td>Expired</td>
              <td>Received <b>{a.amount*100}%</b> of Coins awarded</td>
              <td>Grandfathered</td>
            </tr>
          )
        }
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
            {
              this.renderClosedTipContracts()
            }
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
          <div className="col-12">
            <h4>Active Contracts</h4>
            {this.renderActiveContracts()}
          </div>
        </div>
      </Tile>
      <div className="clearfix py3 mt3"></div>
      <Tile>
        <div className="clearfix px2 py2">
          <div className="col-12">
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
