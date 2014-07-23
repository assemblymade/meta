//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store
//= require stores/dropdown_store

describe('DropdownStore', function() {
  after(function(done) {
    Dispatcher.removeAll();

    done();
  });

  beforeEach(function(done) {
    DropdownStore.removeSelected();

    done();
  });

  it('updates the selected option', function(done) {
    DropdownStore.updateSelected({ item: 'rugby', path: '/' });

    expect(DropdownStore.getSelected()).to.eql('rugby');
    done();
  });

  it('resets the selected option', function(done) {
    DropdownStore.updateSelected({ item: 'baseball', path: '/' });

    expect(DropdownStore.getSelected()).to.eql('baseball');

    DropdownStore.removeSelected();

    expect(DropdownStore.getSelected()).to.eql(undefined);
    done();
  });
});
