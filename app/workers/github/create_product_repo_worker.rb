module Github
  class CreateProductRepoWorker < Github::Worker
    def perform(product_id, homepage, repo_name=nil, request_through=:post)
      product = Product.find(product_id)
      repo_name ||= product.slug
      request_through = request_through.to_sym
      create_through_github = request_through == :post

      path = "/orgs/#{ENV['GITHUB_PRODUCTS_ORG']}/repos"
      payload = if create_through_github
        # create through github
        {
          name: repo_name,
          description: product.pitch,
          homepage: homepage,
          private: false,
          has_issues: false,
          has_wiki: false,
          has_downloads: false,
          license_template: 'agpl-3.0'
        }
      else
        # create through launchpad
        path = "/github"
        payload = {
          name: product.name,
          slug: repo_name,
          description: product.pitch,
          homepage: homepage
        }
      end

      if ENV['GITHUB_PRODUCTS_ORG']
        send(request_through, path, payload)

        add_webhooks([ENV['GITHUB_PRODUCTS_ORG'], product.slug].join('/'))

        if create_through_github
          add_readme(product, repo_name)
        end

        repo = Repo::Github.new("https://github.com/#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}")

        product.repos |= [repo]
        product.save!

        product.core_team.each do |user|
          if github_login = user.github_login
            Github::AddCollaboratorToProductRepoWorker.perform_async(
              repo.url,
              github_login
            )
          end
        end

        if !create_through_github
          notify_core_team(product)
        end
      end
    end

    def add_readme(product, repo_name)
      put "/repos/#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}/contents/README.md", {
        message: "Added default Assembly README.md",
        content: Base64.strict_encode64(render_erb('app/views/products/git/readme.markdown.erb', product)),
        name: ENV['GITHUB_PRODUCTS_USER_NAME'],
        email: ENV['GITHUB_PRODUCTS_USER_EMAIL']
      }
    end


    def notify_core_team(product)
      ProductMailer.delay(queue: 'mailer').notify_core_team(product.id)
    end
  end
end
