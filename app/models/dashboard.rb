CURATED_MARKS = {
  'Development' => [
   'API', 'DevOps', 'Security', 'SQL', 'JavaScript', 'HTML & CSS', 'Ruby',
   'Python', 'Java', '.NET', 'Go', 'PHP', 'iOS', 'Android', 'Node', 'React',
   'Bootstrap', 'Backbone', 'Ember', 'Angular'
  ],
  'Design' => [
    'UI/UX', 'IA', 'Mockups', 'Wireframing', 'Sketches', 'Branding',
    'Typography', 'Illustration', 'Logo', 'Photography', 'HTML & CSS',
    'Responsive',  'Styleguide', 'Homepage', 'Theme'
  ],
  'Growth' => [
    'Strategy', 'Product Management', 'Monetization','Pricing', 'Naming',
    'Community', 'User Research', 'Copywriting', 'Blogging', 'Social Media',
    'BD', 'Marketing', 'Email Marketing', 'SEM', 'SEO'
  ]
}

class Dashboard
  DEFAULT_FILTER = 'interests'

  attr_accessor :filter, :user

  include ActiveModel::SerializerSupport

  def initialize(user, filter)
    self.user = user
    self.filter = filter || DEFAULT_FILTER
  end

  def marks
    CURATED_MARKS
  end

  def initial_interests
    user.marks.pluck(:name)
  end

  def news_feed_items
    dashboard_query.find_news_feed_items
  end

  def user_locked_bounties
    dashboard_query.find_user_locked_bounties
  end

  def user_reviewing_bounties
    dashboard_query.find_user_reviewing_bounties
  end

  def heartables
    dashboard_query.find_heartables
  end

  def user_hearts
    dashboard_query.find_user_hearts
  end

  def followed_products
    dashboard_query.find_followed_products
  end

  def dashboard_query
    @dashboard_query ||= DashboardQuery.new(user, filter)
  end

  def current_product
    SevenDayMVP.current
  end

  def recent_products
    SevenDayMVP.recent
  end
end
