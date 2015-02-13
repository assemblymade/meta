jest.dontMock(pathToFile('stores/online_users_store'))

var ActionTypes = require(appFile('constants')).ActionTypes

describe('OnlineUsersStore', function(){
  var callback;
  var OnlineUsersStore;

  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'))
    OnlineUsersStore = require(pathToFile('stores/online_users_store'))
    callback = Dispatcher.register.mock.calls[0][0];
  })

  it('adds users when they come online', function(){
    callback({
      type: ActionTypes.CHAT_USER_ONLINE,
      rawMember: { id: 'bill' }
    })

    var users = OnlineUsersStore.getUsersOnline()
    expect(users['bill']).toBe(1)
  })
})
