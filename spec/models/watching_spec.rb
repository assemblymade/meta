require 'spec_helper'

describe Watching do
  let(:user) { User.make! }
  let(:watchable) { Product.make! }

  describe 'watch!' do
    let!(:subscriber) { User.make! }

    before do
      Watching.subscribe!(subscriber, watchable)
    end

    it 'watches a watchable' do
      Watching.watch!(user, watchable)

      expect(watchable.watchers).to include(user)
    end

    it 'unsubscribes if subscribed' do
      Watching.watch!(subscriber, watchable)

      expect(Watching.subscribed?(subscriber, watchable)).to be_false
    end
  end

  describe 'unwatch!' do
    before do
      Watching.watch!(user, watchable)
    end

    it 'unwatches a watchable' do
      Watching.unwatch!(user, watchable)

      expect(watchable.watchers).not_to include(user)
    end
  end


  describe 'watched?' do
    let!(:non_watcher) { User.make! }

    before do
      Watching.watch!(user, watchable)
    end

    it 'returns true if watched' do
      expect(Watching.watched?(user, watchable)).to be_true
    end

    it 'returns false if unwatched' do
      expect(Watching.watched?(non_watcher, watchable)).to be_false
    end
  end

  describe 'subscribe!' do
    it 'subscribes to a watchable' do
      w = Watching.subscribe!(user, watchable)

      expect(w.subscription).to be_true
    end

    it 'subscribes if a user is already watching' do
      Watching.watch!(user, watchable)

      expect(watchable.watchers).to include(user)
      Watching.subscribe!(user, watchable)

      expect(Watching.find_by(user_id: user.id, watchable_id: watchable.id).subscription).to be_true
    end
  end

  describe 'unsubscribe!' do
    before do
      Watching.subscribe!(user, watchable)
    end

    it 'unsubscribes from a watchable' do
      Watching.unsubscribe!(user, watchable)

      expect(Watching.find_by(user_id: user.id, watchable_id: watchable.id).subscription).to be_false
    end
  end

  describe 'subscribed?' do
    let!(:non_subscriber) { User.make! }

    before do
      Watching.watch!(non_subscriber, watchable)
      Watching.subscribe!(user, watchable)
    end

    it 'returns true if subscribed' do
      expect(Watching.subscribed?(user, watchable)).to be_true
    end

    it 'returns false if not subscribed' do
      expect(Watching.subscribed?(non_subscriber, watchable)).to be_false
    end
  end
end
