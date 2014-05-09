module Github
  class UpdateCommitCount < Github::Worker
    def perform(product_id)
      product = Product.find(product_id)
      total_commits = product.repos.inject(0) do |sum, repo|
        Rails.logger.info "#{repo.full_name} - update stats"

        sum + stats(repo).inject(0) do |sum, author|
          (sum + contributions_count(author)).tap do |count|
            Rails.logger.info "  #{author['login']} - #{count}"
          end
        end
      end
      product.update_attributes commit_count: total_commits
    end

    def stats(repo)
      stats = Github::Worker.new.get("/repos/#{repo.full_name}/contributors")
      # will return {"message": "Not Found"} hash if not found
      if stats.is_a? Hash
        []
      else
        stats
      end
    end

    def contributions_count(author)
      return 0 if author['login'] == ENV['GITHUB_PRODUCTS_GITHUB_USER']
      author['contributions']
    end
  end
end
