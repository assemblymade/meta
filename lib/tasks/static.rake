namespace :static do
  task :maintenance => :environment do
    template = ErrorsOfflineTemplate.new
    puts template.render_to_string template: 'errors/maintenance', :signed_in? => false
  end
end