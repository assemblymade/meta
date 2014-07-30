/** @jsx React.DOM */

(function() {
  window.Navbar = React.createClass({
    getDefaultProps: function() {
      return {
        user: app.currentUser().attributes
      };
    },

    render: function() {
      var user = this.props.currentUser;

      return (
        <ul className='nav navbar-nav'>
          <li>
            <DropdownToggler
                iconClass='icon-bell'
                href='#stories'
                store='DROPDOWN_NEWS_FEED'
                label='Notifications'
                event='STORIES_FETCHED' />

            <DropdownNewsFeed url={this.props.newsFeedPath} />
          </li>

          <li>
            <ChatNotificationsToggler
              iconClass='icon-bubbles'
              href='#notifications'
              label='Chat'
              store='CHAT_NOTIFICATIONS'
              event='STORIES_FETCHED' />

            <ChatNotifications
                url={this.props.chatPath}
                username={this.props.user.username}
            />
          </li>

          <li className='dropdown'>
            <a href='#' className='dropdown-toggle' data-toggle='dropdown'>
              <Avatar user={this.props.user} />
              <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
                {this.props.user.username}
              </span>
            </a>

            {this.transferPropsTo(<UserNavbarDropdown />)}
          </li>
        </ul>
      );
    }
  });
})();
