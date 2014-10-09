/** @jsx React.DOM */

(function() {

  var UserPicker = React.createClass({
    propTypes: {
      style: React.PropTypes.object
    },

    componentWillUpdate: function() {
      this.updatePositionRelativeToHeight()
    },

    componentDidUpdate: function() {
      this.updatePositionRelativeToHeight()
    },

    render: function() {
      var style = _.extend({
        position: 'absolute',
        zIndex: 100,
        display: 'block',
        left: 0
      }, this.props.style)

      return (
        <ul className="dropdown-menu" style={style}>
          {this.rows()}
        </ul>
      )
    },

    rows: function() {
      var i = -1
      return _.map(this.props.users, function(user){
        i += 1
        return <UserPickerEntry key={user.id} user={user} selected={i === this.props.highlightIndex} onUserSelected={this.props.onUserSelected} />
      }.bind(this))
    },

    updatePositionRelativeToHeight: function() {
      var node = this.getDOMNode()
      node.style.top = -node.offsetHeight + 'px'
    }
  })

  var UserPickerEntry = React.createClass({
    render: function() {
      var className = 'textcomplete-item'
      if (this.props.selected) {
        className += ' active'
      }

      return (
        <li className={className}>
          <a href={'#@' + this.props.user.username} onClick={this.handleUserSelected(this.props.user)}>
            <Avatar user={this.props.user}
                style={{'margin-right': '10px'}} />
            <span> @{this.props.user.username} <span className="text-muted">{this.props.user.name}</span></span>
          </a>
        </li>
      )
    },

    handleUserSelected: function(user) {
      return function() {
        this.props.onUserSelected(user)
      }.bind(this)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = UserPicker
  }

  window.UserPicker = UserPicker
})()
