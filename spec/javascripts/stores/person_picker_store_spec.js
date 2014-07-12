//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store
//= require stores/person_picker_store

describe('PersonPickerStore', function() {
  after(function(done) {
    Dispatcher.removeAll();

    done();
  });

  beforeEach(function(done) {
    PersonPickerStore.removeAllPickedPeople();

    done();
  });

  it('adds a user', function(done) {
    PersonPickerStore.addPickedPerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPickedPeople()).to.eql([{ username: 'rigby' }]);
    done();
  });

  it('removes a user', function(done) {
    PersonPickerStore.addPickedPerson({ user: { username: 'rigby' } });
    PersonPickerStore.removePickedPerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPickedPeople()).to.eql([]);
    done();
  });

  it('updates a user', function(done) {
    PersonPickerStore.addPickedPerson({ user: { username: 'rigby' } });
    expect(PersonPickerStore.getPickedPeople()).to.eql([{ username: 'rigby' }]);

    PersonPickerStore.updatePickedPerson({ user: { username: 'rigby', toys: ['shoes'] } });

    expect(PersonPickerStore.getPickedPeople()).to.eql([{ username: 'rigby', toys: ['shoes'] }]);
    done();
  });
});
