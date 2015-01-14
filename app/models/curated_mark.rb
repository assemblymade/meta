CURATED_MARKS = {
  'Development' =>
    [
     'API', 'DevOps', 'Security', 'SQL', 'JavaScript', 'HTML & CSS',
     'Ruby', 'Python', 'Java', '.NET', 'Go', 'PHP', 'iOS', 'Android',
     'Node', 'React', 'Bootstrap', 'Backbone', 'Ember', 'Angular'
    ],
  'Design' =>
    [
      'UI/UX', 'IA', 'Mockups', 'Wireframing', 'Sketches',
      'Branding', 'Typography', 'Illustration', 'Logo', 'Photography',
      'HTML & CSS', 'Responsive',  'Styleguide', 'Homepage', 'Theme'
   ],
  'Growth' =>
    [
      'Strategy', 'Product Management', 'Monetization','Pricing', 'Naming',
      'Community', 'User Research', 'Copywriting', 'Blogging', 'Social Media',
      'BD', 'Marketing', 'Email Marketing', 'SEM', 'SEO'
    ]
}

class CuratedMark
  attr_accessor :name, :related_marks

  def initialize(name, related_mark_names = [])
    self.name = name
    self.related_marks = Mark.where(name: related_mark_names)
  end
end
