module Github
  class CreateProductRepoWorker < Github::Worker
    def perform(product_id, homepage, repo_name=nil, request_through=:post)
      product = Product.find(product_id)
      repo_name ||= product.slug

      path = if request_through == :launchpad_post
        "/github"
      else
        "/orgs/#{ENV['GITHUB_PRODUCTS_ORG']}/repos"
      end

      if ENV['GITHUB_PRODUCTS_ORG']
        repo = send request_through, path,
          name: repo_name,
          description: product.pitch,
          homepage: homepage,
          private: false,
          has_issues: false,
          has_wiki: false,
          has_downloads: false

        add_webhooks([ENV['GITHUB_PRODUCTS_ORG'], product.slug].join('/'))
        add_license_and_readme(product, repo_name)

        if request_through == :launchpad_post
          notify_core_team(product)
        end

        product.repos |= [Repo::Github.new("https://github.com/#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}")]
        product.save!

        product.core_team.each do |user|
          if github_login = user.github_login
            Github::AddCollaboratorToProductRepoWorker.perform_async(
              repo_name,
              github_login
            )
          end
        end
      end
    end

    def notify_core_team(product)
      ProductMailer.delay(queue: 'mailer').notify_core_team(product)
    end
  end
end
