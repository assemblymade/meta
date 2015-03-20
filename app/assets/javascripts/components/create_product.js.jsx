const Avatar = require('./ui/avatar.js.jsx');
const CONSTANTS = require('../constants');
const Dispatcher = require('../dispatcher');
const PersonPicker = require('./person_picker.js.jsx');

const CreateProduct = React.createClass({

  getInitialState: function() {
    var partners = this.props.participants || []
    return {
      creator: app.currentUser().attributes,
      partners: partners,
      potentialPartner: null
    }
  },

  renderPartners: function() {

    var pairs = _.chain(this.state.partners).groupBy(
                    function(element, index){
                      return Math.floor(index/2);
                    }).toArray().value();

    return _.map(pairs, function(pair, index) {
      var first = pair[0]
      var second = pair[1]

      if (second) {
        return (
          <tr key={index}>
            <td><Avatar user={first} /></td>
            <td>
              @{first.username}
            </td>
            <td>
              {this.removeButton(first)}
            </td>
            <td><Avatar user={second} /></td>
            <td>
              @{second.username}
            </td>
            <td>
              {this.removeButton(second)}
            </td>
          </tr>
        )
      } else {
        return (
          <tr key={index}>
            <td><Avatar user={first} /></td>
            <td>
              @{first.username}
            </td>
            <td>
              {this.removeButton(first)}
            </td>
            <td colSpan="3"></td>
          </tr>
        )
      }
    }.bind(this))
  },

  renderAddNewPartnerRow: function() {
    return (
      <tr>
        <td><Avatar user={this.state.potentialPartner} /></td>
        <td colSpan="5">
          <PersonPicker ref="picker" url="/_es"
                        onUserSelected={this.handleUserSelected}
                        onValidUserChanged={this.handleValidUserChanged}
                        placeholder="Enter an Assembly username" />
        </td>
      </tr>
    )
  },

  render: function() {
    var creator = this.state.creator;

    return (
      <div>
        <table className="table">
          <tbody>
            {this.renderAddNewPartnerRow()}
            <tr className="">
              <td><Avatar user={creator} /></td>
              <td colSpan="5">
                @{creator.username}&nbsp;
                <span className="gray-2">(you)</span>
              </td>
            </tr>
            {this.renderPartners()}
          </tbody>
        </table>
      </div>
    )
  },

  addUser: function(user) {
    this.setState(React.addons.update(this.state, {
      potentialPartner: {$set: null},
      partners: { $push: [user] }
    }))
  },

  handleUserSelected: function(user) {
    if (user.id !== this.state.creator.id && !_.where(this.state.partners, user).length && user.id !== undefined) {
      this.addUser(user)
    } else {
      this.setState({
        potentialPartner: null
      })
    }
  },

  handleValidUserChanged: function(user) {
    this.setState({
      potentialPartner: user
    })
  },

  removeUserClicked: function(user) {
    this.setState(
      {partners: _.reject(this.state.partners, function(p){return p.id === user.id})}
    )
  },

  removeButton: function(user) {
    return (
      <a className="gray-2 red-hover"
          style={{cursor: 'pointer'}}
          onClick={this.removeUserClicked.bind(null, user)}>
        <Icon icon="trash-o" />
        <span className="sr-only">Remove</span>
      </a>
    )
  }

})

module.exports = window.CreateProduct = CreateProduct;

