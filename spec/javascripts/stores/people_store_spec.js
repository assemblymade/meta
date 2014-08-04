//= require spec_helper
//= require underscore
//= require react
//= require components

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

  it('stores an array of people', function(done) {
    PeopleStore.setPeople(people);
    expect(PeopleStore.getPeople()).to.equal(people);

    done();
  });

  it('searches for a person and returns their index', function(done) {
    PeopleStore.setPeople(people);
    var rick = PeopleStore.getPerson('Rick');
    expect(rick.user).to.eql({ username: 'Rick' });
    done();
  });

  it('removes a person', function(done) {
    var p = _.clone(people);
    PeopleStore.setPeople(p);
    PeopleStore.removePerson('Bob');
    expect(PeopleStore.getPeople()).to.eql([
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
    ]);

    done();
  });

  it('inserts a person', function(done) {
    var p = _.clone(people);

    PeopleStore.setPeople(p);

    PeopleStore.addPerson({
      user: {
        username: 'Larry'
      }
    });

    p.push({ user: { username: 'Larry' } });

    expect(PeopleStore.getPeople()).to.eql(p);

    done();
  });
});
