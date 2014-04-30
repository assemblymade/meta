class Group
  include ActiveModel::Serialization

  def self.all(product)
    GROUPS.sort_by {|g| g[:name] }.map {|attrs| new(product, attrs) }
  end

  def self.find_by_slug!(product, slug)
    attrs = GROUPS.find {|group| group[:slug] == slug }
    if attrs.nil?
      raise ActiveRecord::RecordNotFound
    end

    new(product, attrs)
  end

  attr_reader :product
  attr_reader :tag

  attr_reader :name
  attr_reader :slug
  attr_reader :description

  def initialize(product, attrs={})
    @product = product
    @name = attrs.fetch(:name)
    @slug = attrs.fetch(:slug)
    @description = attrs.fetch(:description)

    @tag = Wip::Tag.where(name: name).first!
  end

  def to_param
    slug
  end

end

Group::GROUPS = [
  {
    name: 'API',
    slug: 'api',
    description: "
![Diagram](http://f.cl.ly/items/1v3u2J0y2d1v1o0W3L42/2013-11-15%2012.10.52.png)

Flexibility is the key to making Helpful a success. A clean, simple <abbr title='Application Programming Interface'>API</abbr> is key to letting customers customize their support workfow. The API is comprised of a REST interface to modify data, and Webhooks that notify external apps of changes.
"
  },
  {
    name: 'Homepage',
    slug: 'homepage',
    description: "
![Homepage](http://f.cl.ly/items/2Q0l2i0v3d1n2i1y3l2v/homepage.jpg)

First impressions: they matter. This page is where people land when they want to find out about the product. It needs to lead them to paying for Helpful.
"
  },
  {
    name: 'Accounts & Billing',
    slug: 'accounts-and-billing',
    description: "
![Accounts & Billing](http://f.cl.ly/items/2i0M07401p300O3g0l2g/accounts-and-billing.jpg)

The reason we're all here: to make money. Accounts and billing takes care of signing up new customers, free trials and charging customers for using Helpful.
"
  },
  {
    name: 'Conversations',
    slug: 'conversations',
    description: "
![Conversations](http://f.cl.ly/items/2Z2D3v1b0S1K131L3U2Y/Helpful_Conversation_0_2.png)

The main interface used by the people fielding questions. It needs to be quick and easy to use so support queues can be emptied as soon as possible.
"
  },
  {
    name: 'Javascript Widget',
    slug: 'javascript-widget',
    description: "
![Javascript Widget](http://f.cl.ly/items/3U043x1K2W1b1A2Y1K3t/Screen%20Shot%202013-11-07%20at%208.06.32%20AM.png)

The Javascript Widget is a way for people to quickly offer help and support on their own websites. When a use clicks a 'Help!' button, it opens up a conversation with an operator.
"
  },
  {
    name: 'Search',
    slug: 'search',
    description: "
![Search](http://f.cl.ly/items/2q0s3p3V392m120h2j1Z/search.png)

Operators need to be able to quickly search so that they can follow up existing conversations. Search accuracy is important so specific messages can be found within lots of similar documents.
"
  },
  {
    name: 'Mobile',
    slug: 'mobile',
    description: "
Support operators need to be able to answer support on the run. Dedicated mobile apps help this process be quicker and easier. The speed of being able to deal with customers is important for the mobile apps.
"
  }
]
