namespace :mailchimp do
  task :sync do
    Product.where(slug: %w(buckets)).each do |product|
      (ENV['MAILCHIMP_PRODUCTS'] || '').split(',').each do |product_key|
        slug, key, list_id = product_key.split(':')

        gibbon_export = Gibbon::Export.new(key)

        puts gibbon_export.list({id => list_id})
      end
    end
  end
end