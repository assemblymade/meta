(function() {
  var Avatar = require('../components/avatar.js.jsx');
  var PeoplePageMixin = {
    avatar: function(user) {
      if (!user) {
        return;
      }

      // Use <Avatar></Avatar> below; otherwise
      // React will nest the tags incorrectly
      // and throw an invariant violation
      return (
        <div className="col col-1">
          <a href={user.url} title={'@' + user.username}>
            <Avatar size="30" user={user}></Avatar>
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
