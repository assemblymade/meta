require 'spec_helper'

describe NewsFeedItem do
  let(:user) { User.make! }

  describe 'self.create_with_target' do
    let(:product) { Product.make! }
    let(:kernel) { User.make!(username: 'kernel') }
    let(:task) { Task.make!(product: product, user: user) }
    let(:kernel_task) { Task.make!(product: product, user: kernel) }

    it 'creates a NewsFeedItem when passed a target' do
      expect(NewsFeedItem.create_with_target(task)).to be_a NewsFeedItem
    end

    it 'has last_commented_at set' do
      expect(
        NewsFeedItem.create_with_target(task).last_commented_at
      ).to be_within(2).of(Time.now)
    end
  end

  describe '#update_task' do
    it '' do
      bounty = Task.make!(description: %Q{
        Some stuff

        - [ ] first task
        - [x] second task

        More stuff
      })
      nfi = NewsFeedItem.create_with_target(bounty)

      nfi.update_task!(1, false)

      expect(bounty.reload.description).to eq(%Q{
        Some stuff

        - [ ] first task
        - [ ] second task

        More stuff
      })
    end
  end

  describe 'followings' do
    it 'adds source on create' do
      nfi = NewsFeedItem.make!
      expect(nfi.reload.followers).to eq([nfi.source])
    end

    it 'adds hearter on heart' do
      hearter = User.make!

      nfi = NewsFeedItem.make!
      nfi.hearts.create!(user: hearter)

      expect(nfi.reload.followers).to match_array([nfi.source, hearter])
    end

    it 'adds commentor and @mentions on comment' do
      commenter = User.make!
      whatupdave = User.make!(username: 'whatupdave')

      nfi = NewsFeedItem.make!
      nfi.comments.create!(user: commenter, body: 'hay @whatupdave!')

      expect(nfi.reload.followers).to match_array([nfi.source, commenter, whatupdave])
    end
  end

  it 'caches last_commented_at' do
    nfi = NewsFeedItem.make!
    Timecop.travel(Time.now + 10)
    nfi.comments.create!(user: user, body: 'hay!')

    expect(nfi.last_commented_at).to be_within(2).of(Time.now)
  end
end
