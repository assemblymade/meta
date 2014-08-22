require 'customerio'

$customerio = Customerio::Client.new("#{ENV['CUSTOMER_IO_SITE_ID']}", "#{ENV['CUSTOMER_IO_API_KEY']}")

namespace :customerio do
  task :identify => :environment do
    User.all.each do |user|
      next unless user

      customer = UserAnalyticsSerializer.new(user).serializable_hash

      begin
        $customerio.identify(customer)
      rescue => e
        puts "Adding the user to Customer.io failed"
        puts e
      end
    end
  end
end
