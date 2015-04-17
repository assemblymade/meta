namespace :ideas do
  task seed: :environment do
    raise "You're not in the development environment" unless Rails.env.development?
    30.times {
      i = User.sample.ideas.create(name: rand_words, body: rand_words(20, 50))
      i.add_mark(%(social mobile game marketplace SaaS iOS android utility).split.sample)
    }
    Idea.all.each do |idea|
      rand(0..10).times {
        idea.news_feed_item.comments.create(user: User.sample, body: rand_words(20, 50))
      }
    end
  end

  def rand_words(min=5, max=7)
    (0..rand(min..max)).map{
      ('a'..'z').to_a.shuffle[0,rand(2..8)].join
    }.join(' ')
  end
end
