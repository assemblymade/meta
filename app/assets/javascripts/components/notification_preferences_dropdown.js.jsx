/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');
var NotificationPreferencesDropdownStore = require('../stores/notification_preferences_dropdown_store');
var Avatar = require('./avatar.js.jsx');

(function() {
  var D = CONSTANTS.NOTIFICATION_PREFERENCES_DROPDOWN;

  var NotificationPreferencesDropdown = React.createClass({
    chevron: function() {
      if (this.state.chevron) {
        return <span className="icon icon-chevron-down"></span>;
      }

      return <span style={{ 'margin-right': '7px', 'margin-left': '7px' }} />
    },

    componentWillMount: function() {
      NotificationPreferencesDropdownStore.addChangeListener(this.handleUpdate);
    },

    getInitialState: function() {
      return {
        productWatchersCount: this.props.productWatchersCount,
        selected: this.props.watchingState,
        chevron: false
      };
    },

    hideChevron: function() {
      this.setState({
        chevron: false
      });
    },

    render: function() {
      return (
        <div className="toggler toggler-sm btn-group" onMouseOver={this.showChevron} onMouseOut={this.hideChevron}>
          <a
              className={this.buttonClasses(true)}
              data-toggle="dropdown"
              style={{ 'margin-bottom': '13px' }}>
            {this.buttonState()}
            {this.chevron()}
          </a>
          <div className="toggler-badge">
            <a
                type="button"
                href={this.props.productWatchersPath}
                style={{ opacity: '0.5', 'border-top-right-radius': '2px', 'border-bottom-right-radius': '2px' }}>
              {this.state.productWatchersCount}
            </a>
          </div>
          <ul
              className="dropdown-menu dropdown-menu-right"
              role="menu"
              style={{ width: 'auto', position: 'absolute', top: '35px', 'padding-top': 0 }}>
            <li
                role="presentation"
                className="dropdown-header"
                style={{ color: '#a6a6a6', 'background-color': '#f3f3f3' }}>
              <strong>Following Preferences</strong>
            </li>

            <li role="presentation" style={{ cursor: 'pointer' }} className={this.selectedClass('not watching')}>
              <a role="menuitem" tabIndex="-1" onClick={this.updatePreference.bind(this, 'not watching', this.props.productUnfollowPath)}>
                <div>
                  <strong>Not following</strong>
                </div>
                <span className="text-muted">
                  Receive notifications when you are @mentioned
                </span>
              </a>
            </li>

            <li role="presentation" style={{ cursor: 'pointer' }} className={this.selectedClass('announcements')}>
              <a role="menuitem" tabIndex="-1" onClick={this.updatePreference.bind(this, 'announcements', this.props.productAnnouncementsPath)}>
                <div>
                  <strong>Follow announcements only</strong>
                </div>
                <div className="text-muted">
                  Receive notifications when there are new blog posts
                </div>
              </a>
            </li>

            <li role="presentation" style={{ cursor: 'pointer' }} className={this.selectedClass('following')}>
              <a role="menuitem" tabIndex="-1" onClick={this.updatePreference.bind(this, 'following', this.props.productFollowPath)}>
                <div>
                  <strong>Follow</strong>
                </div>
                <div className="text-muted">
                  Receive notifications when there are new blog posts, discussions, and chat messages
                </div>
              </a>
            </li>
          </ul>
        </div>
      );
    },

    showChevron: function() {
      this.setState({
        chevron: true
      });
    },

    handleUpdate: function() {
      this.setState({
        selected: NotificationPreferencesDropdownStore.getSelected()
      });
    },

    buttonState: function() {
      switch (this.state.selected) {
        case 'following':
          return 'Following';
        case 'announcements':
          return 'Following announcements only';
        case 'not watching':
          return 'Follow';
      }
    },

    buttonClasses: function(dropdownToggle) {
      return React.addons.classSet({
        'btn': true,
        'btn-primary': (this.state.selected === 'not watching'),
        'btn-default': (this.state.selected !== 'not watching'),
        'btn-sm': true,
        'dropdown-toggle': dropdownToggle
      })
    },

    selectedClass: function(option) {
      if (this.state.selected === option) {
        return "active";
      }
    },

    updatePreference: function(item, path) {
      Dispatcher.dispatch({
        action: D.ACTIONS.UPDATE_SELECTED,
        data: {
          item: item,
          path: path,
          redirectTo: (item === 'following' ? this.props.afterFollowPath : null)
        }
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NotificationPreferencesDropdown;
  }

  window.NotificationPreferencesDropdown = NotificationPreferencesDropdown;
})();
