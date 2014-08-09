//= require spec_helper
//= require moment
//= require underscore
//= require react
//= require components

describe('NewsFeedStore', function() {
  var _app;
  before(function() {
    this.fixture = fixture.load('readraptor_meta_tag.html', true);
    _app = window.app;

    window.app = {
      currentUser: function() {
        return {
          get: function(property) {
            return 'pizza';
          }
        }
      }
    };
  });

  after(function() {
    window.app = _app;
  });

  describe('newsFeed:fetchStories', function() {
    var spy, request, noCsrfRequest;

    beforeEach(function() {
      spy = sinon.spy(NewsFeedStore, 'emit');
      request = sinon.stub(window.xhr, 'request', function(method, path, data, callback) {
        var users = [
          {
            id: 1
          },
          {
            id: 2
          },
          {
            id: 3
          },
          {
            id: 4
          }
        ];

        var stories = [
          {
            key: 1
          },
          {
            key: 2
          },
          {
            key: 3
          },
          {
            key: 4
          }
        ];

        return callback(null, JSON.stringify({ users: users, stories: stories }));
      });

      noCsrfRequest = sinon.stub(window.xhr, 'noCsrfRequest', function(method, path, data, callback) {
        var readraptorData = [
          {
            key: 1,
            last_read_at: 123
          },
          {
            key: 2,
            last_read_at: 123
          }
        ];

        return callback(null, JSON.stringify(readraptorData));
      });
    });

    afterEach(function() {
      NewsFeedStore.emit.restore();
      window.xhr.request.restore();
      window.xhr.noCsrfRequest.restore();
    });

    it('fetches stories', function() {
      NewsFeedStore['newsFeed:fetchStories']('/rex');

      expect(spy.calledOnce).to.be.true;
      expect(request.calledOnce).to.be.true;
      expect(noCsrfRequest.calledOnce).to.be.true;
    });
  });

  describe('getUnreadCount', function() {
    it('returns the number of unread stories', function() {
      var stories = [
        {
          updated: 123,
          last_read_at: 123
        },
        {
          updated: 789,
          last_read_at: 123
        },
        {
          updated: 456,
          last_read_at: 123
        }
      ];

      NewsFeedStore.setStories(stories);

      expect(NewsFeedStore.getUnreadCount(555)).to.equal(1);

      NewsFeedStore.removeAllStories();
    });
  });
});
