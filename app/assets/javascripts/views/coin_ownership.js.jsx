/** @jsx React.DOM */

(function() {

function dot(prop) {
  return function(object) {
    return object[prop]
  }
}

function preventDefault(fn) {
  return function(e) {
    e.preventDefault()
    fn(e)
  }
}

window.CoinOwnership = React.createClass({
  getDefaultProps: function() {
    return { totalCoins: 6000 }
  },

  componentDidMount: function() {

  },

  getInitialState: function() {
    return {
      creator: _.extend(app.currentUser().attributes, { coins: this.props.totalCoins }),
      sharers: [],
      potentialUser: null
    }
  },

  ownership: function(user) {
    return Math.max(
      0, Math.min(
        100, this.totalCoins() / user.coins * 100
      )
    )
  },

  totalCoins: function() {
    var sharerCoins = _.reduce(_.map(this.state.sharers, dot('coins')), function(memo, num){ return memo + num; }, 0)
    console.log(sharerCoins, this.state.creator.coins)
    return sharerCoins + this.state.creator.coins
  },

  render: function() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th colSpan="2">Partner</th>
            <th className="text-right" style={{width: 130}}>Ownership</th>
            <th className="text-right">Coins</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr className="active">
            <td><Avatar user={this.state.creator} /></td>
            <td>
              @{this.state.creator.username}
            </td>
            <td className="text-right">
              <strong>{this.ownership(this.state.creator)}%</strong>
            </td>
            <td className="text-right">
              <span className="text-coins" style={{"white-space":"nowrap"}}>
                <span className="icon icon-app-coin"></span>
                {this.state.creator.coins}
              </span>
            </td>
            <td className="text-right">
              <span className="text-muted">(you)</span>
            </td>
          </tr>

          {this.rows()}

          <tr>
            <td><Avatar user={this.state.potentialUser} /></td>
            <td>
              <PersonPicker ref="picker" url="/_es"
                            onUserSelected={this.handleUserSelected}
                            onValidUserChanged={this.handleValidUserChanged} />
            </td>
            <td>
              <div className="input-group input-group-sm">

                <input className="form-control text-right" type="number" value={this.state} onChange={this.handleChange} />
                <div className="input-group-addon">%</div>
              </div>
            </td>
            <td>
              <span className="text-coins" style={{'white-space':"nowrap"}}>
                <span className="icon icon-app-coin"></span>
                0
              </span>
            </td>
            <td className="text-right">
              {this.addButton()}
            </td>
          </tr>
        </tbody>
      </table>
    )
  },

  addButton: function() {
    return (
      <a className="text-success"
          style={{cursor: 'pointer'}}
          onClick={this.state.potentialUser ? this.addUserClicked : ''}>
        <span className="icon icon-plus-circled"></span>
        <span className="sr-only">Add</span>
      </a>
    );
  },

  handleChange: function(e) {

  },

  handleUserSelected: function(user) {
    this.addUser(user)
  },

  handleValidUserChanged: function(user) {
    this.setState({potentialUser: user})
  },

  addUserClicked: function(e) {
    e.preventDefault()
    this.addUser(this.state.potentialUser)
    this.refs.picker.clearText()
  },

  addUser: function(user) {
    var user = _.extend(user, {coins: 0})
    this.setState(React.addons.update(this.state, {
      potentialUser: {$set: null},
      sharers: { $push: [user] }
    }))
  },

  rows: function() {
    return _.map(this.state.sharers, function(user) {
      return <OwnershipRow
        user={user}
        ownership={this.ownership(user)}
        onRemove={this.handleUserRemoved(user)} key={user.id || user.email}
        onOwnershipChanged={this.handleOwnershipChanged(user)} />
    }.bind(this))
  },

  handleUserRemoved: function(user) {
    return function() {
      var users = _.reject(this.state.sharers, function(u){
        if (u.id) {
          return u.id == user.id
        } else if (u.email) {
          return u.email == user.email
        }
      })

      this.setState({sharers: users})
    }.bind(this)
  },

  handleOwnershipChanged: function(user) {
    return function(ownership) {
      user.coins = Math.floor((ownership / 100) * this.props.totalCoins)
      this.setState({sharers: this.state.sharers})
    }.bind(this)
  }
})


var OwnershipRow = React.createClass({
  render: function() {
    var user = this.props.user
    return (
      <tr>
        <td><Avatar user={user} /></td>
        <td>
          @{user.username}
        </td>
        <td>
          <div className="input-group input-group-sm">

            <input ref="ownership" className="form-control text-right" type="number"
                   value={this.props.ownership}
                   onChange={this.handleOwnershipChanged} />
            <div className="input-group-addon">%</div>
          </div>
        </td>
        <td className="text-right">
          <span className="text-coins" style={{'white-space':"nowrap"}}>
            <span className="icon icon-app-coin"></span>
            {user.coins}
          </span>
        </td>
        <td className="text-right">
          <a href="#" onClick={preventDefault(this.props.onRemove)} className="text-muted link-hover-danger">
            <span className="icon icon-close"></span>
            <span className="sr-only">Remove</span>
          </a>
        </td>
      </tr>
    )
  },

  handleOwnershipChanged: function() {
    var val = this.refs.ownership.getDOMNode().value
    this.props.onOwnershipChanged(val)
  }
})


})();
