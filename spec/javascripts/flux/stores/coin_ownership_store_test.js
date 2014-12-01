jest.dontMock(pathToFile('stores/coin_ownership_store'));

describe('CoinOwnershipStore', function() {
  var CoinOwnershipStore

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
    Dispatcher = require(appFile('dispatcher'))
    CoinOwnershipStore = require(pathToFile('stores/coin_ownership_store'));

    CoinOwnershipStore.removeAllUsers();
  });

  describe('addUser()', function() {
    it('adds a user', function() {
      CoinOwnershipStore.addUser({ userAndCoins: { username: 'nancy', ownership: 12 } });

      expect(CoinOwnershipStore.getUsers()).toEqual([{ username: 'nancy', ownership: 12 }]);
    });
  });

  describe('removeUser()', function() {
    beforeEach(function() {
      CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));
    });

    it('removes a user', function() {
      CoinOwnershipStore.removeUser({ userAndCoins: { username: 'lou', ownership: 0 } });
      expect(CoinOwnershipStore.getUsers()).toEqual([
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
  });

  describe('updateUser()', function() {
    beforeEach(function() {
      CoinOwnershipStore.setUsers(_.clone(usersAndOwnerships));
    });

    it('updates a user', function() {
      CoinOwnershipStore.updateUser({ userAndCoins: { username: 'lou', ownership: 10 } });
      expect(CoinOwnershipStore.getUsers()).toEqual([
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
});
