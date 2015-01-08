require 'spec_helper'

describe FilterIdeasQuery do
  let(:user) { User.make! }
  let(:bad_user) { User.make! }
  let!(:idea) { Idea.make!(user: user) }
  let!(:bad_idea) { Idea.make!(user: bad_user) }

  describe 'self.call' do
    it 'initializes and filters ideas' do
      ideas = FilterIdeasQuery.call({ user: user.username })

      expect(ideas.count).to eq(1)
      expect(ideas.first.user).to eq(user)
    end
  end

  describe '#initialize' do
    it 'initializes a FilterIdeasQuery' do
      query = FilterIdeasQuery.new({ option: 'option' })

      expect(query.options[:option]).to eq('option')
      expect(query.try(:non_option)).to be(nil)
    end
  end

  describe '#filter' do
    let!(:old_idea) { Idea.make!(user: user, created_at: Time.now - 10000) }
    let!(:greenlit_idea) { Idea.make!(user: user, greenlit_at: Time.now) }

    it 'filters by greenlit status' do
      ideas = FilterIdeasQuery.call({ filter: 'greenlit' })

      expect(ideas.count).to eq(1)
      expect(ideas.first).to eq(greenlit_idea)
    end

    it 'sorts by newness' do
      ideas = FilterIdeasQuery.call({ sort: 'newness' })

      expect(ideas.count).to eq(4)
      expect(ideas.last).to eq(old_idea)
    end
  end
end
