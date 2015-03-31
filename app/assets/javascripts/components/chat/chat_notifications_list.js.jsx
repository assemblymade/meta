'use strict';

const { List } = require('immutable');

const renderRooms = (room) => {
  let badge;
  if (room.unread) {
    badge = <span
        className="indicator indicator-danger pull-right"
        style={{ 'position': 'relative', 'top': '10px' }} />;
  }

  return (
    <a href={room.url}
        key={room.slug}
        className="list-group-item"
        style={{ border: 'none' }}>
      {badge} #{room.slug}
    </a>
  );
};

const ChatNotificationsList = React.createClass({
  propTypes: {
    chatRooms: React.PropTypes.array
  },

  getDefaultProps() {
    return {
      chatRooms: List()
    };
  },

  render() {
    let { chatRooms } = this.props;
    let style = {
      maxHeight: 400,
      overflowY: 'scroll'
    };

    let entries = chatRooms.map(renderRooms).toJS();

    return (
      <div style={style}>
        {entries}
      </div>
    );
  }
});

module.exports = ChatNotificationsList;
