class GuidesGroup < StaticContentGroup
  GROUPS = [
    ['platform',  'The Assembly platform'],
    ['product-management', 'Product management'],
    ['tips', 'Tips for success'],
    ['accepting-payments',  'Accepting payments'],
    ['getting-paid',  'Getting paid'],
    ['domains',  'Domains, hosting, and repos'],
    ['ownership', 'Managing Ownership']
    ['starting-ios', 'Starting an iOS app'],
    ['transferring-ios', 'Transferring an iOS app'],
    ['starting-android', 'Starting an Android app'],
    ['transferring-android', 'Transferring an Android app'],
    ['starting-web', 'Starting a Web app'],
    ['transferring-web', 'Transferring a Web app'],
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'guides_groups')
  end
end
