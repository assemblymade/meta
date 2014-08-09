//= require spec_helper
//= require underscore
//= require react
//= require components

describe('CoinOwnershipStore', function() {
  after(function() {
    Dispatcher.removeAll();
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

  beforeEach(function() {
    CoinOwnershipStore.removeAllUsers();
  });

  it('adds a user', function() {
    CoinOwnershipStore.addUser({ userAndCoins: { username: 'nancy', ownership: 12 } });

    expect(CoinOwnershipStore.getUsers()).to.eql([{ username: 'nancy', ownership: 12 }]);
  });

  it('removes a user', function() {
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
  });

  it('updates a user', function() {
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
  });
});
