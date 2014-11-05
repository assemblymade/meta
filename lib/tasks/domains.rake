namespace :domains do

  desc 'Check the status of all domains in Dnsimple'
  task :refresh => :environment do
    Domain.includes(:product).find_each do |domain|
      puts domain.inspect
    end
  end
end