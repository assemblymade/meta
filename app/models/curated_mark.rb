SUGGESTED_MARKS = [
  {
    name: 'Development',
    description: 'You build webapps, develop mobile apps, implement designs, manage infrastructure, or just love doing code reviews.',
    related_marks: [
      'Ruby', 'Rails', 'iOS', 'Android', 'Redis', 'JavaScript', 'Node.js',
      'Postgres', 'CSS', 'MongoDB', 'HTML5', 'Python', 'Backend', 'API',
      'Flask', 'DevOps', 'RethinkDB', 'ZeroMQ', 'Go', 'Bitcoin', 'Ember',
      'Clojure', 'React', 'Security'
    ]
  },
  {
    name: 'Design',
    description: 'You spend most of your day in Photoshop. You design logos, put together wireframes and create high fidelity mockups.',
    related_marks: [
      'UI', 'UX', 'Logo', 'IA', 'Homepage', 'Branding', 'Wireframe',
      'Photoshop', 'Responsive', 'Interface', 'Mockup', 'Blog', 'Dashboard',
      'Layout', 'Typography', 'Form', 'Theme', 'Illustration', 'Sketching',
      'Styleguide', 'Mobile', 'Color'
    ]
  },
  {
    name: 'Strategy',
    description: 'You like thinking up marketing plans, tailoring customer experience, or giving really good feedback.',
    related_marks: [
      'Copy', 'Email', 'Project Management', 'Marketing', 'Social',
      'Onboarding', 'Launch', 'Feedback', 'Billing', 'Ads', 'SEO',
      'Monetization', 'Growth', 'Research', 'Pricing', 'Naming', 'Roadmap',
      'Blog', 'Metrics', 'Sales', 'Newsletter'
    ]
  }
]

class CuratedMark
  attr_accessor :name, :description, :related_marks

  def self.all
    SUGGESTED_MARKS.map do |mark|
      new(mark[:name], mark[:description], mark[:related_marks])
    end
  end

  def initialize(name, description, related_mark_names = [])
    self.name = name
    self.description = description
    self.related_marks = Mark.where(name: related_mark_names)
  end
end
