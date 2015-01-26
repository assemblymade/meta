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

  attr_accessor :filter, :user, :marks, :initial_interests

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
end
