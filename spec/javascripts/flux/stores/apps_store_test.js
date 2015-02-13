jest.dontMock(appFile('stores/apps_store'));

describe('AppsStore', function(){
  var ActionTypes = require(appFile('constants')).ActionTypes;
  var AppsStore, callback, Dispatcher;

  describe('getApps()', function() {
    beforeEach(function() {
      Dispatcher = require(appFile('dispatcher'));
      AppsStore = require(appFile('stores/apps_store'));
      callback = Dispatcher.register.mock.calls[0][0];
    });

    it('gets the apps it was sent', function() {
      callback({
        type: ActionTypes.APPS_RECEIVE,
        apps: [{ name: 'Awesome' }, { name: 'Everything' }]
      });

      expect(AppsStore.getApps().length).toEqual(2);
      expect(AppsStore.getApps()).toEqual([{ name: 'Awesome' }, { name: 'Everything' }]);
    });

    it('sets apps to null when searching', function() {
      callback({
        type: ActionTypes.APPS_START_SEARCH,
      });

      expect(AppsStore.getApps()).toBeNull();
    });

    it('sets apps as a result of searching', function() {
      callback({
        type: ActionTypes.APPS_RECEIVE_SEARCH_RESULTS,
        results: {
          hits: {
            hits: [{ _source: { name: 'Awesome' } }, { _source: { name: 'Everything' } }]
          }
        }
      });

      expect(AppsStore.getApps().length).toEqual(2);
      expect(AppsStore.getApps()).toEqual([{ name: 'Awesome' }, { name: 'Everything' }]);
    });
  });
});
