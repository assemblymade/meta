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
                iconClass='icon icon-bell'
                href='#stories'
                store='NEWS_FEED'
                event='STORIES_FETCHED' />
            <NewsFeed url={this.props.newsFeedPath} />
          </li>

          <li>
            <DropdownToggler
              iconClass='icon icon-bubble'
              href='#notifications'
              store='NOTIFICATIONS' />
            <Notifications
                url={this.props.chatPath}
                username={this.props.user.username}
                type='chat'
            />
          </li>

          <li className='dropdown'>
            <a href='#' className='dropdown-toggle' data-toggle='dropdown'>
              <Avatar user={this.props.user} />
            </a>

            {this.transferPropsTo(<UserNavbarDropdown />)}
          </li>
        </ul>
      );
    }
  });
})();
