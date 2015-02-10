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
    Product.all.each do |p|
      languages = {}
      marks = {}

      p.repos.each do |r|
        new_languages = Github::Worker.new.get("repos/#{r.full_name}/languages")
        languages.merge!(new_languages){|k, o, n| o + n }
      end

      languages.reject!{|k, v| v.is_a?(String)}
      next if languages.empty?

      total_lines = languages.values.sum

      languages.each do |k, v|
        marks[k] = v/total_lines.to_f
      end

      marks.each do |m, w|
        mark = Mark.where(name: m.downcase).first_or_create
        MakeMarks.new.mark_additively(p, mark.id, w)
      end
    end
  end

  task :tag_with_repo_languages => :environment do
    Product.all.each do |p|
      languages = {}
      marks = {}

      p.repos.each do |r|
        new_languages = Github::Worker.new.get("repos/#{r.full_name}/languages")
        languages.merge!(new_languages){|k, o, n| o + n }
      end

      languages.reject!{|k, v| v.is_a?(String)}
      next if languages.empty?

      total_lines = languages.values.sum

      languages.each do |k, v|
        marks[k] = v/total_lines.to_f
      end

      p.update_attribute(:tags, p.tags.map(&:downcase))

      marks.each do |m, w|
        next if w < 0.1 || p.tags.map(&:downcase).include?(m.downcase)
        p.update_attribute(:tags, p.tags << m.downcase)
      end
    end
  end

  task descriptions_to_updates: :environment do
    Product.find_each do |product|
      next if product.description.nil?

      title = if Post.find_by(product_id: product.id, title: product.name)
        "#{product.name} - Introduction"
      else
        product.name
      end

      product.posts.create!(
        author_id: product.user_id,
        title: title,
        slug: "#{product.slug}-introduction",
        body: product.description
      )

      post = Post.find_by(product_id: product.id, slug: product.slug)

      post.update_column('created_at', product.created_at)
      post.update_column('updated_at', product.created_at)
      post.news_feed_item.update_column('created_at', product.created_at)
      post.news_feed_item.update_column('updated_at', product.created_at)
      post.news_feed_item.update_column('last_commented_at', product.created_at)
    end
  end
end
