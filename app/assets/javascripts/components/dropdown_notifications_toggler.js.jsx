// var Dispatcher = require('../dispatcher');
var DropdownTogglerMixin = require('../mixins/dropdown_toggler.js.jsx');
var LocalStorageMixin = require('../mixins/local_storage');
var NotificationsStore = require('../stores/notifications_store');
var StoryActionCreators = require('../actions/story_action_creators')
var StoryStore = require('../stores/story_store')

var DropdownNotificationsToggler = React.createClass({
  mixins: [DropdownTogglerMixin, LocalStorageMixin],

  acknowledge: function() {
    StoryActionCreators.acknowledge();
  },

  badge: function(total) {
    return <strong className="mr1">{this.state.badgeCount}</strong>;
  },

  badgeCount: function() {
    return this.state.badgeCount
  },

  componentDidMount: function() {
    StoryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    StoryStore.removeChangeListener(this._onChange);
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  getStateFromStore: function() {
    return {
      badgeCount: StoryStore.getUnviewedCount()
    }
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }

});

module.exports = DropdownNotificationsToggler
