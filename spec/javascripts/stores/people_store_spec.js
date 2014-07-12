//= require spec_helper
//= require underscore
//= require dispatcher
//= require stores/store
//= require stores/people_store

describe('PeopleStore', function() {
  after(function(done) {
    Dispatcher.removeAll();
    done();
  });

  var people = [
    {
      user: {
        username: 'Bob'
      }
    },
    {
      user: {
        username: 'Anne'
      }
    },
    {
      user: {
        username: 'Stacy'
      }
    },
    {
      user: {
        username: 'Rick'
      }
    }
  ];

  it('sorts and stores an array of people', function(done) {
    PeopleStore.setPeople(people);
    expect(PeopleStore.getPeople()).to.eql([
      {
        user: {
          username: 'Anne'
        }
      },
      {
        user: {
          username: 'Bob'
        }
      },
      {
        user: {
          username: 'Rick'
        }
      },
      {
        user: {
          username: 'Stacy'
        }
      }
    ]);

    done();
  });

  it('binary searches for a person and returns their index', function(done) {
    PeopleStore.setPeople(people);
    var rick = PeopleStore.getPerson('Rick');
    expect(rick.user).to.eql({ username: 'Rick' });
    done();
  });

  it('removes a person', function(done) {
    PeopleStore.setPeople(people);
    PeopleStore.removePerson('Bob');
    expect(PeopleStore.getPeople()).to.eql([
      {
        user: {
          username: 'Anne'
        }
      },
      {
        user: {
          username: 'Rick'
        }
      },
      {
        user: {
          username: 'Stacy'
        }
      }
    ]);

    done();
  });

  it('inserts a person in order', function(done) {
    PeopleStore.setPeople(people);
    PeopleStore.addPerson({
      user: {
        username: 'Larry'
      }
    });

    expect(PeopleStore.getPeople()).to.eql([
      {
        user: {
          username: 'Anne'
        }
      },
      {
        user: {
          username: 'Bob'
        }
      },
      {
        user: {
          username: 'Larry'
        }
      },
      {
        user: {
          username: 'Rick'
        }
      },
      {
        user: {
          username: 'Stacy'
        }
      }
    ]);

    done();
  });
});
