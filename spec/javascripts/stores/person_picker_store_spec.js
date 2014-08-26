//= require spec_helper
//= require underscore
//= require react
//= require jquery
//= require bootstrap
//= require components

describe('PersonPickerStore', function() {
  after(function() {
    Dispatcher.removeAll();
  });

  beforeEach(function() {
    PersonPickerStore.removeAllPeople();

  });

  it('adds a user', function() {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby' }]);
  });

  it('removes a user', function() {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby' }]);

    PersonPickerStore.removePerson({ user: { username: 'rigby' } });

    expect(PersonPickerStore.getPeople()).to.eql([]);
  });

  it('updates a user', function() {
    PersonPickerStore.addPerson({ user: { username: 'rigby' } });
    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby' }]);

    PersonPickerStore.updatePerson({ user: { username: 'rigby', toys: ['shoes'] } });

    expect(PersonPickerStore.getPeople()).to.eql([{ username: 'rigby', toys: ['shoes'] }]);
  });
});
