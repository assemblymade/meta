class FaqGroup < StaticContentGroup
  GROUPS = [
    ['basics',    'The Basics'],
    ['building',  'Building Apps'],
    ['revenue',   'Revenue and App Coins'],
    ['privacy',   'Privacy and Security'],
    ['community', 'Community'],
    ['launching', 'Starting a new Product'],
    ['migrating', 'Migrating an Existing Product'],
    ['platform',  'Platform Features'],
    ['terms',     'Terminology']
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'faq_groups')
  end
end
