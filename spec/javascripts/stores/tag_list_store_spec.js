//= require spec_helper
//= require underscore
//= require stores/store
//= require stores/tag_list_store

describe('TagListStore', function() {
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
