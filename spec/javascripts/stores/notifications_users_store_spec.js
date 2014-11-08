//= require spec_helper
//= require underscore
//= require react
//= require components

describe('NotificationsUsersStore', function() {
  describe('setUsers', function() {
    before(function() {
      NotificationsUsersStore.removeAllUsers();
    });

    after(function() {
      NotificationsUsersStore.removeAllUsers();
    });


    it('sets the users', function() {
      NotificationsUsersStore.setUsers({
        doorknob: {
          open: true
        },
        table: {
          mahogany: false
        }
      });

      expect(NotificationsUsersStore.getUsers()).to.eql({
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
      NotificationsUsersStore.removeAllUsers();
    });

    after(function() {
      NotificationsUsersStore.removeAllUsers();
    });

    it('adds a user', function() {
      NotificationsUsersStore.addUsers({
        zia: 'maria'
      });

      expect(NotificationsUsersStore.getUsers().zia).to.eql('maria');
    });
  });
});
