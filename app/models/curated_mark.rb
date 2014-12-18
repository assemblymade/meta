CURATED_MARKS = {
  'Development' =>
    ['Ruby', 'JavaScript', 'HTML & CSS', 'iOS', 'API', 'Fortran', 'DevOps',
     'Go', 'Python', 'Android', 'Rails', 'React', 'Bootstrap', 'Backbone',
     'Security', 'Postgres', 'Redis', 'Bitcoin'],
  'Design' => 
    ['UI', 'UX', 'IA', 'Branding', 'Typography', 'Microsoft Paint', 'Mockups',
     'Illustration', 'Colors', 'Logo', 'Photoshop', 'Illustrator',
     'Responsive', 'Homepage', 'Theme', 'Blog', 'Styleguide'],
  'Strategy & Growth' =>
    ['Copywriting', 'Marketing', 'Product Management', 'User Research',
     'Growth', 'Air Guitar', 'Monetization', 'Email Marketing', 'Social Media',
     'Onboarding', 'Blogging', 'SEO', 'Pricing', 'Naming', 'Roadmapping']
}

class CuratedMark
  attr_accessor :name, :related_marks

  def initialize(name, related_mark_names = [])
    self.name = name
    self.related_marks = Mark.where(name: related_mark_names)
  end
end
