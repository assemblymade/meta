require 'spec_helper'

describe ProductMetric do
  let!(:product) { Product.make! }
  let!(:product_two) { Product.make! }
  let!(:task) { Task.make!(product: product) }
  let!(:task_two) { Task.make!(product: product_two) }
  let!(:user) { User.make!(username: 'userzero') }
  # # response to task in 10 seconds
  let!(:comment_one) { task.comments.create!(user: user, body: "comment", created_at: task.created_at + 10) }
  # # response to comment two in 40 seconds
  let!(:comment_two) { task.comments.create!(user: user, body: "comment", created_at: comment_one.created_at + 40) }
  let!(:comment_three) { task_two.comments.create!(user: user, body: "comment", created_at: task_two.created_at + 100) }

  before(:each) do
    Product.all.map(&:calc_task_comments_response_time)
  end

  describe "comment responsiveness" do
    it 'returns the correct minimum_average_comment_responsiveness' do
      min = ProductMetric.minimum_comment_responsiveness
      expect(ProductMetric.count).to eq(2)
      expect(min).to eq(50)
    end
    it 'returns the correct maximum_average_comment_responsiveness' do
      max = ProductMetric.maximum_comment_responsiveness
      expect(max).to eq(100)
    end
    it 'returns the correct weighted average comment_responsiveness on all products' do
      mean = ProductMetric.mean_comment_responsiveness
      expect(mean).to eq(((50*2)+ 100)/3)
    end
    it 'returns the correct median_comment_responsiveness on all products' do
      median = ProductMetric.median_comment_responsiveness
      expect(median).to eq((100+50)/2)
    end
  end
end
