

(function(){
  var AvatarLink = require('./avatar_link.js.jsx')
  var TipsUi = require('./tips_ui.js.jsx')
  var UserLink = require('./user_link.js.jsx')
  var marked = require('marked')

  var ChatMessageStore = require('../stores/chat_message_store')

  var ChatEntry = React.createClass({
    componentDidMount: function() {
      window.app.mountReactComponents(this.getDOMNode())
    },

    render: function() {
      return (
        <div className="activity activity-chat chat-entry" id={"comment-" + this.props.entry.number}>
          <div className="pull-left activity-avatar">
            <AvatarLink size={24} url={this.props.user.url} username={this.props.user.username} avatar_url={this.props.user.avatar_url} />
          </div>
          <div className="activity-body">
            <div className="activity-actions">
              <ul className="list-inline pull-right mb0 hidden-xs">
                <li>
                  <div className="dropdown">
                    <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                      <i className="icon icon-ellipsis" />
                    </a>
                    <ul className="dropdown-menu pull-right text-small" role="menu">
                      <li role="presentation">
                        <a href={"#comment-" + this.props.entry.number} role="menuitem">
                          <i className="icon icon-link dropdown-glyph" />
                          Permalink
                        </a>
                      </li>
                      <li role="presentation">
                        <a className="clickable js-chat-create-wip" role="menuitem">
                          <i className="icon icon-plus-circled dropdown-glyph" />
                          Create bounty
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
              <ul className="list-reset clearfix mb0">
                <li className="left mr1" style={{'line-height': 16}}>
                  <UserLink url={this.props.user.url} username={this.props.user.username} className="chat-actor">
                    {this.props.user.username}
                  </UserLink>
                </li>
              </ul>
            </div>

            {this.body()}
          </div>
        </div>
      );
    },

    body: function() {
      var classes = React.addons.classSet({
        "activity-content markdown markdown-normalized": true,
        "gray-2": (typeof this.props.entry.message_html === 'undefined')
      })

      var message = this.props.entry.message_html || this.props.entry.message

      return <div className={classes} style={{padding: 0}}
        dangerouslySetInnerHTML={{__html: message}} />
    }});

  if (typeof module !== 'undefined') {
    module.exports = ChatEntry
  }

  window.ChatEntry = ChatEntry
})()
