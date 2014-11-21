namespace :marks do

  desc "Adds some marks to products"
  task :seed => :environment do

    data = {
      'helpful' => ['Rails'],
      'coderwall' => ['Rails', 'Postgres'],
      'artfactum' => ['Rails'],
      'buckets' => ['Node.js', 'MongoDB'],
      'really-good-emails' => ['Rails'],
      'runbook' => ['Python', 'Flask', 'Devops'],
      'firesize' => ['Go'],
      'flash-dash' => ['React', 'Javascript', 'Rails'],
      'localhost' => ['Go'],
      'mana' => ['Go'],
      'zenforms' => ['Go'],
      'hn-monitor' => ['Go'],
      'cliq' => ['Go'],
      'saulify' => ['Go'],
      'invoicerio' => ['Go'],
      'vacay' => ['Go'],
      'signupsumo' => ['Go'],
      'boxychat' => ['Node.js', 'Ember'],
      'ripple' => ['Go'],
      'calmail' => ['Go'],
      'totroops' => ['Go'],
      'meowboard' => ['Go'],
      'confy' => ['Devops'],
      'gig-radio' => ['iOS', 'mobile', 'android'],
      'nomad' => ['iOS', 'mobile', 'Rails', 'android'],
      'voices' => ['iOS', 'mobile'],
      'pay-it-forward' => ['Go'],
      'cake-it' => ['Go'],
      'octobox' => ['Go'],
      'pretty-shots' => ['Go'],
      'leasepop' => ['Go'],
      'splitty' => ['Go'],
      'readraptor' => ['Go'],
      'dreiser' => ['Go'],
      'coffee-memo' => ['Go'],
      'food-data' => ['Go'],
      'hesperides' => ['Go'],
      'villeme' => ['Rails'],
      'music-news' => ['Go'],
      'peanut-butter-jams' => ['Go'],
      'enclouder' => ['Go'],
      'show-up' => ['Go'],
      'banyan' => ['Go'],
      'prudio' => ['Go']
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
