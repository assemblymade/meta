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
      username: 'bob',
      ownership: 10
    },
    {
      username: 'cindy',
      ownership: 5
    },
    {
      username: 'lou',
      ownership: 0
    },
    {
      username: 'amy',
      ownership: 8
    }
  ];

  beforeEach(function(done) {
    CoinOwnershipStore.removeAllUsers();
    done();
  });

  it('adds a user', function(done) {
    CoinOwnershipStore.addUser({ userAndCoins: { username: 'nancy', ownership: 12 } });

    expect(CoinOwnershipStore.getUsers()).to.eql([{ username: 'nancy', ownership: 12 }]);

    done();
  });

  it('removes a user', function(done) {
    CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));
    CoinOwnershipStore.removeUser({ userAndCoins: { username: 'lou', ownership: 0 } });
    expect(CoinOwnershipStore.getUsers()).to.eql([
      {

        username: 'bob',
        ownership: 10
      },
      {

        username: 'cindy',
        ownership: 5
      },
      {
        username: 'amy',
        ownership: 8
      }
    ]);

    done();
  });

  it('updates a user', function(done) {
    CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));

    CoinOwnershipStore.updateUser({ userAndCoins: { username: 'lou', ownership: 10 } });
    expect(CoinOwnershipStore.getUsers()).to.eql([
      {

        username: 'bob',
        ownership: 10
      },
      {

        username: 'cindy',
        ownership: 5
      },
      {

        username: 'lou',
        ownership: 10
      },
      {

        username: 'amy',
        ownership: 8
      }
    ]);

    done();
  });
});
