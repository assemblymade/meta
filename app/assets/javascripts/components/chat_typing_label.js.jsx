

(function(){
  var ChatTypingLabel = React.createClass({
    propTypes: {
      usernames: React.PropTypes.array
    },

    render: function() {
      return <div>
        <span className="text-small gray-2">{this.message()}</span>
      </div>
    },

    message: function() {
      var len = this.props.usernames.length
      if (len == 1) {
        return <span><strong>{this.props.usernames[0]}</strong> is typing</span>
      } else if (len == 2) {
        return <span>
          <strong>{this.props.usernames[0]}</strong>&nbsp;and&nbsp;
          <strong>{this.props.usernames[1]}</strong>&nbsp;are typing
        </span>
      } else if (len > 2) {
        return <span>several people are typing</span>
      }

      return <span>&nbsp;</span>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = ChatTypingLabel
  }

  window.ChatTypingLabel = ChatTypingLabel
})()