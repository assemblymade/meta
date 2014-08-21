require 'spec_helper'

describe Watching do
  let(:user) { User.make! }
  let(:wip) { Task.make!(user: user, product: watchable) }
  let(:watchable) { Product.make! }

  describe 'watch!' do
    let!(:subscriber) { User.make! }

    before do
      Watching.announcements!(subscriber, watchable)
    end

    it 'watches a watchable' do
      Watching.watch!(user, watchable)

      expect(watchable.watchers).to include(user)
    end

    it 'follows if announcements' do
      Watching.watch!(subscriber, watchable)

      expect(Watching.following?(subscriber, watchable)).to be_true
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

  describe 'unwatch! a product' do
    before do
      Watching.watch!(user, watchable)
      Watching.watch!(user, wip)
    end

    it 'unwatches all wips when unwatching a product' do
      Watching.unwatch!(user, watchable)

      expect(watchable.watchers).not_to include(user)
      expect(wip.watchers).not_to include(user)
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

  describe 'announcements!' do
    it 'watches a watchable passively' do
      w = Watching.announcements!(user, watchable)

      expect(w.subscription).to be_false
    end

    it 'moves to announcements if already watching' do
      Watching.watch!(user, watchable)
      Watching.announcements!(user, watchable)

      expect(
        Watching.find_by(user_id: user.id, watchable_id: watchable.id).subscription
      ).to be_false
    end
  end

  describe 'subscribe! to a product' do
    it 'watches all open wips' do
      Watching.announcements!(user, watchable)

      expect(wip.watchers).to include(user)
    end
  end
end
