class GuidesGroup < StaticContentGroup
  GROUPS = [
    ['platform',    'The Assembly platform'],
    ['getting-started',    'Getting started'],
    ['building-products',    'Building products'],
    ['accepting-payments',    'Accepting payments'],
    ['project-management', 'Project management'],
    ['leading', 'Leading a product'],
    ['starting-ios', 'Starting an iOS app'],
    ['transferring-ios', 'Transferring an iOS app'],
    ['starting-android', 'Starting an Android app'],
    ['transferring-android', 'Transferring an Android app'],
    ['starting-web', 'Starting a Web app'],
    ['transferring-web', 'Transferring a Web app'],
    ['ownership', 'Managing Ownership']
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'guides_groups')
  end
end
