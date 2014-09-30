module Github
  class CreateProductRepoWorker < Github::Worker
    def perform(product_id, homepage, repo_name=nil, request_through=:post)
      product = Product.find(product_id)
      repo_name ||= product.slug
      request_through = request_through.to_sym

      path = "/orgs/#{ENV['GITHUB_PRODUCTS_ORG']}/repos"
      payload = if request_through == :post
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
        repo = send request_through, path, payload

        add_webhooks([ENV['GITHUB_PRODUCTS_ORG'], product.slug].join('/'))

        if request_through == :post
          add_readme(product, repo_name)
        else
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
