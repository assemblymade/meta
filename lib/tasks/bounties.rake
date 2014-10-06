namespace :bounties do
  
  task :open => :environment do
    require 'csv'
    include ActionView::Helpers::DateHelper
    puts "Enter output file name:"
    filename = STDIN.gets.chomp
    query = Task.open.where('created_at <= :six_months_ago', :six_months_ago => Time.now - 6.months)

    CSV.open(filename, 'w') do |row|
      row << ['Product', 'Bounty', 'Comments', 'created at', 'updated at', 'State', 'Link']
      query.each do |q|
        row << [q.title, (q.product.name rescue 'nil'), 
                q.comments_count, time_ago_in_words(q.created_at), 
                time_ago_in_words(q.updated_at), q.state, 
                "https://assembly.com/#{q.slug rescue 'nil'}"]
      end
    end
  end
end