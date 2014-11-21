namespace :marks do

  desc "Adds some marks to products"
  task :seed => :environment do

    data = {
      'helpful' => ['Rails', 'Ruby'],
      'coderwall' => ['Rails', 'Ruby', 'Postgres'],
      'artfactum' => ['Rails', 'Ruby'],
      'buckets' => ['Node.js', 'MongoDB'],
      'really-good-emails' => ['Rails', 'Ruby'],
      'runbook' => ['Python', 'Flask', 'Devops'],
      'firesize' => ['Go'],
      'flash-dash' => ['React', 'Javascript', 'Rails', 'Ruby'],
      'localhost' => ['Rails', 'Ruby'],
      'zenforms' => ['Rails', 'Ruby'],
      'hn-monitor' => ['Rails', 'Ruby'],
      'saulify' => ['Python', 'Flask'],
      'invoicerio' => ['Rails', 'Ruby'],
      'vacay' => ['Angular'],
      'signupsumo' => ['Ruby', 'Sinatra'],
      'boxychat' => ['Node.js', 'Ember'],
      'ripple' => ['iOS'],
      'calmail' => ['Rails', 'Ruby'],
      'totroops' => ['Python'],
      'meowboard' => ['iOS', 'Mobile'],
      'confy' => ['Devops', 'Node'],
      'gig-radio' => ['iOS', 'mobile', 'android'],
      'nomad' => ['iOS', 'mobile', 'Rails', 'android'],
      'voices' => ['iOS', 'mobile'],
      'pay-it-forward' => ['Rails'],
      'cake-it' => ['Rails'],
      'octobox' => ['Node'],
      'pretty-shots' => ['Video'],
      'leasepop' => ['php', 'ember'],
      'splitty' => ['iOS', 'mobile'],
      'readraptor' => ['Go', 'API'],
      'dreiser' => ['Clojure', 'PostgreSQL', 'ClojureScript'],
      'coffee-memo' => ['Rails'],
      'food-data' => ['php'],
      'hesperides' => ['Bitcoin'],
      'villeme' => ['Rails', "Social"],
      'music-news' => ['Rails', 'Music', "Social"],
      'peanut-butter-jams' => ['Music'],
      'enclouder' => ['Video'],
      'show-up' => ['Mobile'],
      'banyan' => ['mobile'],
      'prudio' => ['Node']
    }

    data.each do |slug, marks|
      product = Product.find_by(slug: slug)
      marks.each do |mark|
        MakeMarks.new.mark_with_name(product, mark)
      end
    end
  end

  desc "Deletes marks with uppercase letters"
  task :downcase_all => :environment do
    Mark.all.each do |mark|
      next if mark.name == mark.name.downcase
      mark.markings.each do |marking|
        MakeMarks.new.mark_with_name(marking.markable, mark.name.downcase)
        marking.destroy
      end
      mark.destroy
    end
  end
end
