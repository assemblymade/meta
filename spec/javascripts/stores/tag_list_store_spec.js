//= require spec_helper
//= require underscore
//= require react
//= require components

describe('TagListStore', function() {
  before(function(done) {
    Dispatcher.removeAll();
    done();
  });

  afterEach(function(done) {
    TagListStore.removeAllTags();

    done();
  });

  it('adds a tag', function(done) {
    TagListStore.addTag({ tag: 'foo' });
    expect(TagListStore.getTags()).to.include('foo');

    done();
  });

  it('removes a tag', function(done) {
    TagListStore.addTag({ tag: 'foo' });
    expect(TagListStore.getTags()).to.include('foo');

    TagListStore.removeTag({ tag: 'foo' });
    expect(TagListStore.getTags()).to.eql([]);

    done();
  });
});
