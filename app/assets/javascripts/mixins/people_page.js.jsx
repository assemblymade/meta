(function() {
  var Avatar = require('../components/avatar.js.jsx');
  var PeoplePageMixin = {
    avatar: function(user) {
      if (!user) {
        return;
      }

      return (
        <div className="left mr1">
          <a href={user.url} title={'@' + user.username}>
            <Avatar size="30" user={user} />
          </a>
        </div>
      );
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = PeoplePageMixin;
  }

  window.PeoplePageMixin = PeoplePageMixin;
})();
