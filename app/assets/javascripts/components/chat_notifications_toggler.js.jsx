/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var ChatNotificationsStore = require('../stores/chat_notifications_store');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var LocalStorageMixin = require('../mixins/local_storage');

(function() {
  var CN = CONSTANTS.CHAT_NOTIFICATIONS;

  var ChatNotificationsToggler = React.createClass({
    mixins: [DropdownTogglerMixin, LocalStorageMixin],

    acknowledge: function() {
      var timestamp = moment().unix();

      localStorage.chatAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      Dispatcher.dispatch({
        action: CN.ACTIONS.ACKNOWLEDGE,
        data: timestamp,
        sync: true
      });
    },

    badgeCount: function() {
      return this.shouldRead() ? ChatNotificationsStore.getUnreadCount(this.state.acknowledgedAt) : 0;
    },

    componentDidMount: function() {
      if (_.isEmpty(this.state.data)) {
        this.render = this.renderWithoutChatRooms;
        this.forceUpdate()
      }
    },

    componentWillMount: function() {
      ChatNotificationsStore.addChangeListener(this.getNotifications);
    },

    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    getInitialState: function() {
      return {
        chatRooms: null,
        acknowledgedAt: this.storedAck('chatAck')
      };
    },

    getNotifications: function() {
      this.setState({
        chatRooms: ChatNotificationsStore.getChatRooms()
      });
    },

    renderWithoutChatRooms: function() {
      var badgeClasses = ['badge', 'badge-navbar', 'block'];

      return (
        <a className="block dropdown-toggle py2 px1" href="/general/chat">
          <span className={badgeClasses.join(' ')}>
            <Icon icon={this.props.icon} />
          </span>
          <span className='visible-xs-inline ml2'>
            'Chat notifications'
          </span>
        </a>
      );
    },

    shouldRead: function() {
      var chatRoom = ChatNotificationsStore.mostRecentlyUpdatedChatRoom();

      return chatRoom && chatRoom.updated > chatRoom.last_read_at;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ChatNotificationsToggler;
  }

  window.ChatNotificationsToggler = ChatNotificationsToggler;
})();
