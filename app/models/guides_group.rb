class GuidesGroup < StaticContentGroup
  GROUPS = [
    ['platform',    'The Assembly Platform'],
    ['getting-started',    'Getting Started'],
    ['building-products',    'Building Products'],
    ['project-management', 'Project Management']
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'guides_groups')
  end
end
