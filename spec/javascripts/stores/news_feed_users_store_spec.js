//= require spec_helper
//= require underscore
//= require react
//= require components

describe('NewsFeedUsersStore', function() {
  describe('setUsers', function() {
    before(function() {
      NewsFeedUsersStore.removeAllUsers();
    });

    after(function() {
      NewsFeedUsersStore.removeAllUsers();
    });


    it('sets the users', function() {
      NewsFeedUsersStore.setUsers({
        doorknob: {
          open: true
        },
        table: {
          mahogany: false
        }
      });

      expect(NewsFeedUsersStore.getUsers()).to.eql({
        doorknob: {
          open: true
        },
        table: {
          mahogany: false
        }
      });
    });
  });

  describe('addUsers', function() {
    before(function() {
      NewsFeedUsersStore.removeAllUsers();
    });

    after(function() {
      NewsFeedUsersStore.removeAllUsers();
    });

    it('adds a user', function() {
      NewsFeedUsersStore.addUsers({
        zia: 'maria'
      });

      expect(NewsFeedUsersStore.getUsers().zia).to.eql('maria');
    });
  });
});
