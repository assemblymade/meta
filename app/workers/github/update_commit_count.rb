module Github
  class UpdateCommitCount < Github::Worker
    def perform(product_id)
      product = Product.find(product_id)
      total_commits = product.repos.inject(0) do |count, repo|
        Rails.logger.info "#{repo.full_name} - update stats"

        stats(repo).inject(0) do |sum, author|
          contributions = if author['login'] == ENV['GITHUB_PRODUCTS_GITHUB_USER']
            0
          else
            author['contributions']
          end
          contributions.tap do |contributions|
            Rails.logger.info "  #{author['login']} - #{contributions}"
          end
        end
      end

      product.update_attributes commit_count: total_commits
    end

    def stats(repo)
      stats = Github::Worker.new.get("/repos/#{repo.full_name}/contributors") || []
    end
  end
end
