require 'spec_helper'

describe NewsFeedItemComment do
  it 'has mentioned users, excluding author' do
    pletcher = User.make!(username: 'pletcher')
    whatupdave = User.make!(username: 'whatupdave')

    comment = NewsFeedItemComment.make!(user: pletcher, body: '@whatupdave it is I, @pletcher')
    expect(comment.mentioned_users).to eq([whatupdave])
  end
end
