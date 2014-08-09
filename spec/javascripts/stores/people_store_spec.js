//= require spec_helper
//= require underscore
//= require react
//= require components

describe('PeopleStore', function() {
  after(function() {
    Dispatcher.removeAll();
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

  it('stores an array of people', function() {
    PeopleStore.setPeople(people);
    expect(PeopleStore.getPeople()).to.equal(people);
  });

  it('searches for a person and returns their index', function() {
    PeopleStore.setPeople(people);
    var rick = PeopleStore.getPerson('Rick');
    expect(rick.user).to.eql({ username: 'Rick' });
  });

  it('removes a person', function() {
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
  });

  it('inserts a person', function() {
    var p = _.clone(people);

    PeopleStore.setPeople(p);

    PeopleStore.addPerson({
      user: {
        username: 'Larry'
      }
    });

    p.push({ user: { username: 'Larry' } });

    expect(PeopleStore.getPeople()).to.eql(p);
  });
});
