var UserPicker = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
    position: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      position: 'top',
      offset: [0,0]
    }
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
      left: (this.props.offset[0])
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
    if (this.props.position == 'top') {
      node.style.top = -node.offsetHeight + (this.props.offset[1]) + 'px'
    } else {
      node.style.top = (this.props.offset[1]) + 'px'
    }
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
        <a className="block clearfix py1 px2" href={'#@' + this.props.user.username} onClick={this.handleUserSelected(this.props.user)}>
          <div className="left mr2">
            <Avatar user={this.props.user} />
          </div>
          <div className="overflow-hidden">
            @{this.props.user.username}
            {' '}
            <span className="gray-2">{this.props.user.name}</span>
          </div>
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

module.exports = window.UserPicker = UserPicker;
