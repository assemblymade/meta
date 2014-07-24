//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store
//= require stores/notification_preferences_dropdown_store

describe('NotificationPreferencesDropdownStore', function() {
  after(function(done) {
    Dispatcher.removeAll();

    done();
  });

  beforeEach(function(done) {
    NotificationPreferencesDropdownStore.removeSelected();

    done();
  });

  it('updates the selected option', function(done) {
    NotificationPreferencesDropdownStore.updateSelected({ item: 'rugby', path: '/' });

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql('rugby');
    done();
  });

  it('resets the selected option', function(done) {
    NotificationPreferencesDropdownStore.updateSelected({ item: 'baseball', path: '/' });

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql('baseball');

    NotificationPreferencesDropdownStore.removeSelected();

    expect(NotificationPreferencesDropdownStore.getSelected()).to.eql(undefined);
    done();
  });
});
