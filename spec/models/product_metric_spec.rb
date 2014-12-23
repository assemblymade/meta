require 'spec_helper'

describe ProductMetric do

  before(:each) do
    product_one = Product.make!
    product_two = Product.make!
    noncore_user = User.make!(username: 'noncoreuser')
    core_user = User.make!(username: 'coreuser')

    product_one.core_team += [core_user]
    product_two.core_team += [core_user]

    # task one (core)
    # - noncore
    # - core
    # - core
    # - noncore
    # core responsiveness: 10 + penalty for unanswered noncore comment
    # noncore reponsiveness: (10+20)/2 = 15
    task_one_one = Task.make!(product: product_one, user: core_user)
    nfi_one_one = NewsFeedItem.create_with_target(task_one_one)
    nfi_one_one.comments.create!(user: noncore_user, body: "product one task one comment one", created_at: task_one_one.created_at + 10.seconds)
    nfi_one_one.comments.create!(user: core_user, body: "product one task one comment two", created_at: task_one_one.created_at + 20.seconds)
    nfi_one_one.comments.create!(user: core_user, body: "product one task one comment three", created_at: task_one_one.created_at + 30.seconds)
    @penalized_comment = nfi_one_one.comments.create!(user: noncore_user, body: "product one task one comment four", created_at: task_one_one.created_at + 50.seconds)

    # task two (noncore)
    # - core
    # - core
    # core responsiveness: 60
    # noncore responsiveness: n/a
    task_one_two = Task.make!(product: product_one, user: noncore_user)
    nfi_one_two = NewsFeedItem.create_with_target(task_one_two)
    nfi_one_two.comments.create!(user: core_user, body: "product one task two comment one", created_at: task_one_two.created_at + 60.seconds)
    nfi_one_two.comments.create!(user: core_user, body: "product one task two comment two", created_at: task_one_two.created_at + 70.seconds)

    # task three (core) [closed]
    # - noncore
    # core responsiveness: n/a
    # noncore responsiveness: 70
    task_two_one = Task.make!(product: product_two, user: core_user, state: "closed")
    nfi_two_one = NewsFeedItem.create_with_target(task_two_one)
    nfi_two_one.comments.create!(user: noncore_user, body: "product two task one comment one", created_at: task_two_one.created_at + 70.seconds)

    # task four (core)
    # - noncore
    # - core
    # core responsiveness: 80
    # noncore responsiveness: 20
    task_two_two = Task.make!(product: product_two, user: core_user)
    nfi_two_two = NewsFeedItem.create_with_target(task_two_two)
    nfi_two_two.comments.create!(user: noncore_user, body: "product two task two comment one", created_at: task_two_two.created_at + 20.seconds)
    nfi_two_two.comments.create!(user: core_user, body: "product two task two comment two", created_at: task_two_two.created_at + 100.seconds)

    # product one
    # - core: (10+60+created_at_to_time_now)/3 = >70+1 day
    # - noncore: (10+20)/2 = 15
    # product two
    # - core: 80
    # - noncore: (20+70)/2
    Timecop.freeze(Time.now+1.day) do
      @timenow = Time.now
      Product.all.each do |p|
        ProductMetric.record_new(product: p)
      end
    end

    @first_prod_metric = ProductMetric.first
    @second_prod_metric = ProductMetric.last
  end

  # TODO: refactor so each Task/NFI can calculate its own responsiveness
  # and test each Task/NFI
  describe "comment responsiveness" do
    # min
    it 'returns the correct minimum_core_comment_responsiveness' do
      min = ProductMetric.calc_minimum(:core_responsiveness)

      expect(min).to eq(80)
    end
    it 'returns the correct minimum_non_core_comment_responsiveness' do
      min = ProductMetric.calc_minimum(:noncore_responsiveness)

      expect(ProductMetric.count).to eq(2)
      expect(min).to eq(15)
    end

    # max
    it 'returns the correct maximum_core_comment_responsiveness' do
      max = ProductMetric.maximum(:core_responsiveness)

      expect(max).to eq((10+60+(@timenow-@penalized_comment.created_at).abs.to_i)/3)
    end
    it 'returns the correct maximum_non_core_comment_responsiveness' do
      max = ProductMetric.maximum(:noncore_responsiveness)

      expect(max).to eq((20+70)/2)
    end

    # weighted averages
    it 'returns the correct weighted core average comment_responsiveness on all products' do
      mean = ProductMetric.overflow_safe_weighted_average(:core_responsiveness)

      expected = (@first_prod_metric.core_responsiveness * @first_prod_metric.comments_count + @second_prod_metric.core_responsiveness * @second_prod_metric.comments_count) / ProductMetric.sum(:comments_count)

      expect(mean).to eq(expected)
    end
    it 'returns the correct weighted non_core average comment_responsiveness on all products' do
      mean = ProductMetric.overflow_safe_weighted_average(:noncore_responsiveness)

      expected = (@first_prod_metric.noncore_responsiveness * @first_prod_metric.comments_count + @second_prod_metric.noncore_responsiveness * @second_prod_metric.comments_count) / ProductMetric.sum(:comments_count)

      expect(mean).to eq(expected)
    end

    # median
    it 'returns the correct core median_comment_responsiveness on all products' do
      median = ProductMetric.median(:core_responsiveness)

      expected = (@first_prod_metric.core_responsiveness + @second_prod_metric.core_responsiveness) / 2.0

      expect(median).to eq(expected)
    end
    it 'returns the correct non_core median_comment_responsiveness on all products' do
      median = ProductMetric.median(:noncore_responsiveness)
      expected = (@first_prod_metric.noncore_responsiveness + @second_prod_metric.noncore_responsiveness) / 2.0

      expect(median).to eq(expected)
    end
  end
end
