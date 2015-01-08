namespace :products do
  task :update_commit_counts => :environment do
    Product.repos_gt(0).each do |product|
      Github::UpdateCommitCount.new.perform(product.id)
    end
  end

  task :assign_key_pairs => :environment do
    Product.find_each do |product|
      if product.wallet_public_address.nil?
        AssignProductKeyPair.assign(product)
      end
    end
  end

  task :initialize_assembly_assets_wallet => :environment do
  end

  task :mark_with_repo_languages => :environment do
    THRESHOLD = 0.1

    Product.all.each do |p|
      languages = {}
      marks = []

      p.repos.each do |r|
        new_languages = Github::Worker.new.get("repos/#{r.full_name}/languages")
        languages.merge!(new_languages){|k, o, n| o + n }
      end

      languages.reject!{|k, v| v.is_a?(String)}
      next if languages.empty?

      total_lines = languages.values.sum

      languages.each do |k, v|
        marks << k if v/total_lines.to_f > THRESHOLD
      end

      marks.each do |m|
        MakeMarks.new.mark_with_name(p, m)
      end
    end
  end
end
