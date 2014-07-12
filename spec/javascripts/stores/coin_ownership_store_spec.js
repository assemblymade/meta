//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store
//= require stores/coin_ownership_store

describe('CoinOwnershipStore', function() {
  after(function(done) {
    Dispatcher.removeAll();
    done();
  });

  var usersAndOwnerships = [
    {
      user: {
        username: 'bob'
      },
      ownership: 10
    },
    {
      user: {
        username: 'cindy'
      },
      ownership: 5
    },
    {
      user: {
        username: 'lou'
      },
      ownership: 0
    },
    {
      user: {
        username: 'amy'
      },
      ownership: 8
    }
  ];

  beforeEach(function(done) {
    CoinOwnershipStore.removeAllUsers();
    done();
  });

  it('adds a user', function(done) {
    CoinOwnershipStore.addUser({ userAndOwnership: { user: { username: 'nancy' }, ownership: 12 } });

    expect(CoinOwnershipStore.getUsers()).to.eql([{ user: { username: 'nancy' }, ownership: 12 }]);

    done();
  });

  it('removes a user', function(done) {
    CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));
    CoinOwnershipStore.removeUser({ userAndOwnership: { user: { username: 'lou' }, ownership: 0 } });
    expect(CoinOwnershipStore.getUsers()).to.eql([
      {
        user: {
          username: 'bob'
        },
        ownership: 10
      },
      {
        user: {
          username: 'cindy'
        },
        ownership: 5
      },
      {
        user: {
          username: 'amy'
        },
        ownership: 8
      }
    ]);

    done();
  });

  it('updates a user', function(done) {
    CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));

    CoinOwnershipStore.updateUser({ userAndOwnership: { user: { username: 'lou' }, ownership: 10 } });
    expect(CoinOwnershipStore.getUsers()).to.eql([
      {
        user: {
          username: 'bob'
        },
        ownership: 10
      },
      {
        user: {
          username: 'cindy'
        },
        ownership: 5
      },
      {
        user: {
          username: 'lou'
        },
        ownership: 10
      },
      {
        user: {
          username: 'amy'
        },
        ownership: 8
      }
    ]);

    done();
  });
});
