class GuidesGroup < StaticContentGroup
  GROUPS = [
    ['platform',    'The Assembly Platform'],
    ['getting-started',    'Getting Started'],
    ['building-products',    'Building Products'],
    ['project-management', 'Project Management'],
    ['starting-ios', 'Starting an iOS app'],
    ['transferring-ios', 'Transferring an iOS app'],
    ['starting-android', 'Starting an Android app'],
    ['transferring-android', 'Transferring an Android app']
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'guides_groups')
  end
end
