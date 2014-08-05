//= require spec_helper
//= require underscore
//= require react
//= require components

fixture.preload('readraptor_meta_tag.html');

describe('NotificationPreferencesDropdownStore', function() {
  after(function() {
    Dispatcher.removeAll();
  });

  beforeEach(function() {
    NotificationPreferencesDropdownStore.removeSelected();
  });

  it('updates the selected option', function() {
    sinon.stub(window.xhr, 'request', function(method, path, data, callback) {
      return true;
    });

    NotificationPreferencesDropdownStore.updateSelected({ item: 'rugby', path: '/' });

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql('rugby');

    window.xhr.request.restore();
  });

  it('resets the selected option', function() {
    sinon.stub(window.xhr, 'request', function(method, path, data, callback) {
      return true;
    });

    NotificationPreferencesDropdownStore.updateSelected({ item: 'baseball', path: '/' });

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql('baseball');

    NotificationPreferencesDropdownStore.removeSelected();

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql(undefined);

    window.xhr.request.restore();
  });
});
