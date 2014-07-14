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
    PersonPickerStore.removeAllPeople();

    done();
  });

  it('adds a user', function(done) {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby' }]);
    done();
  });

  it('removes a user', function(done) {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });
    PersonPickerStore.removePerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPeople()).to.eql([]);
    done();
  });

  it('updates a user', function(done) {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });
    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby' }]);

    PersonPickerStore.updatePerson({ user: { username: 'rigby', toys: ['shoes'] } });

    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby', toys: ['shoes'] }]);
    done();
  });
});
