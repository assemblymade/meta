/** @jsx React.DOM */

//= require dispatcher
//= require stores/notification_preferences_dropdown_store
//= require constants

(function() {
  var D = CONSTANTS.NOTIFICATION_PREFERENCES_DROPDOWN;

  window.NotificationPreferencesDropdown = React.createClass({
    getInitialState: function() {
      return {
        productWatchersCount: this.props.productWatchersCount,
        selected: this.props.watchingState
      };
    },

    componentWillMount: function() {
      NotificationPreferencesDropdownStore.addChangeListener(D.EVENTS.SELECTED_UPDATED, this.handleUpdate);
    },

    render: function() {
      return (
        <div className="toggler toggler-sm btn-group">
          <a
              className="btn btn-primary btn-sm dropdown-toggle"
              data-toggle="dropdown"
              style={{ 'margin-bottom': '13px' }}>
            {this.buttonState()}
            <span className="icon icon-chevron-down"></span>
          </a>
          <a
              className="btn btn-primary btn-sm"
              type="button"
              href={this.props.productWatchersPath}
              style={{ opacity: '0.5', 'border-top-right-radius': '2px', 'border-bottom-right-radius': '2px' }}>
            {this.state.productWatchersCount}
          </a>
          <ul
              className="dropdown-menu dropdown-menu-right"
              role="menu"
              style={{ width: 'auto', position: 'absolute', top: '35px', 'padding-top': 0 }}>
            <li
                role="presentation"
                className="dropdown-header"
                style={{ color: '#a6a6a6', 'background-color': '#f3f3f3' }}>
              <strong>Notifications</strong>
            </li>
            <li role="presentation" style={{ cursor: 'pointer' }}>
              <a role="menuitem" tabindex="-1" onClick={this.updatePreference.bind(this, 'not watching', this.props.productUnfollowPath)}>
                <p style={{ 'margin-bottom': '0', 'font-size': '14px' }}>
                  <strong>Not following</strong>
                  {this.selected('not watching')}
                </p>
                <span className="text-muted" style={{ 'font-size': '14px' }}>
                  Only notified when participating or @mentioned
                </span>
              </a>
            </li>

            <li role="presentation" style={{ cursor: 'pointer' }}>
              <a role="menuitem" tabindex="-1" onClick={this.updatePreference.bind(this, 'watching', this.props.productFollowPath)}>
                <p style={{ 'margin-bottom': 0, 'font-size': '14px' }}>
                  <strong>Follow updates</strong>
                  {this.selected('watching')}
                </p>
                <span className="text-muted" style={{ 'font-size': '14px' }}>
                  Be notified of business updates, and when participating or @mentioned
                </span>
              </a>
            </li>

            <li role="presentation" style={{ cursor: 'pointer' }}>
              <a role="menuitem" tabindex="-1" onClick={this.updatePreference.bind(this, 'subscribed', this.props.productSubscribePath)}>
                <p style={{ 'margin-bottom': 0, 'font-size': '14px' }}>
                  <strong>Follow everything</strong>
                  {this.selected('subscribed')}
                </p>
                <span className="text-muted" style={{ 'font-size': '14px' }}>
                  Be notified of all discussions, business updates, and when participating or @mentioned
                </span>
              </a>
            </li>
          </ul>
        </div>
      );
    },

    handleUpdate: function() {
      this.setState({
        selected: NotificationPreferencesDropdownStore.getSelected()
      });
    },

    buttonState: function() {
      switch (this.state.selected) {
        case 'subscribed':
          return 'Following everything';
        case 'watching':
          return 'Following announcements';
        case 'not watching':
          return 'Follow';
      }
    },

    selected: function(option) {
      if (this.state.selected === option) {
        return <span className="indicator indicator-success" style={{ 'margin-left': '5px' }}></span>
      }
    },

    updatePreference: function(item, path) {
      Dispatcher.dispatch({
        event: D.EVENTS.SELECTED_UPDATED,
        action: D.ACTIONS.UPDATE_SELECTED,
        data: { item: item, path: path }
      });
    }
  });
})();
