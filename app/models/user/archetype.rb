class User::Archetype
  attr_reader :id
  attr_reader :name
  attr_reader :role
  attr_reader :description
  attr_reader :long_description

  attr_reader :users
  attr_writer :users

  def self.all
    [
      {
        id: 'design',
        name: 'Design',
        role: 'designer',
        description: 'Making pixels proper in branding, IA, & UX',
        long_description: 'Designers are concerned with how the product feels, behaves and looks. One part art, one part psychology, one part inspiration.'

      },
      {
        id: 'code',
        name: 'Code',
        role: 'coder',
        description: 'Writing ridiculous backends & frontends',
        long_description: 'Coders breathe life into tech products. They implement the systems and make sure they are available and fast.'
      },
      {
        id: 'growth',
        name: 'Growth',
        role: 'growth hacker',
        description: 'Making things grow by hacking, Marketing, or PR',
        long_description: 'Coders breathe life into tech products. They implement the systems and make sure they are available and fast.'
      },
      {
        id: 'strategy',
        name: 'Strategy',
        role: 'strategist',
        description: 'Helping move forward on goals, copy, finances',
        long_description: 'Strategists shape the vision of a product by of combining quantifiable data with their unique market understanding.'
      },
    ].map{|attrs| new(attrs) }
  end

  def self.find(id)
    all.find{|a| a.id == id }
  end

  def self.group(id, users)
    find(id).tap {|a| a.users = users }
  end

  def initialize(attributes)
    @id = attributes[:id]
    @name = attributes[:name]
    @role = attributes[:role]
    @description = attributes[:description]
    @long_description = attributes[:long_description]
    @users = []
  end

  def count
    @users.count
  end
end