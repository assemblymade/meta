module Github
  class CreateProductRepoWorker < Github::Worker
    def perform(product_id, homepage, repo_name=nil)
      product = Product.find(product_id)

      if ENV['GITHUB_PRODUCTS_ORG']
        repo = post "/orgs/#{ENV['GITHUB_PRODUCTS_ORG']}/repos",
          name: repo_name || product.slug,
          description: product.pitch,
          homepage: homepage,
          private: false,
          has_issues: false,
          has_wiki: false,
          has_downloads: false

        add_webhooks([ENV['GITHUB_PRODUCTS_ORG'], product.slug].join('/'))
        add_license_and_readme(product, repo_name)
      end
    end

    def add_license_and_readme(product, repo_name=nil)
      name = repo_name || product.slug

      url = "https://#{ENV['GITHUB_PRODUCTS_GITHUB_USER']}:#{ENV['GITHUB_PRODUCTS_GITHUB_TOKEN']}@github.com/asm-products/#{name}.git"
      Dir.mktmpdir do |dir|
        g = Git.init(name)

        g.config('user.name', ENV['GITHUB_PRODUCTS_USER_NAME'])
        g.config('user.email', ENV['GITHUB_PRODUCTS_USER_EMAIL'])
        g.config('github.user', ENV['GITHUB_PRODUCTS_GITHUB_USER'])
        g.config('github.token', ENV['GITHUB_PRODUCTS_GITHUB_TOKEN'])

        Dir.mkdir(product.slug)
        Dir.chdir(product.slug) do
          write_erb_file 'README.md', 'app/views/products/git/readme.markdown.erb', product
          write_erb_file 'LICENSE', 'app/views/products/git/license.text.erb', product

          g.add(:all=>true)
          g.commit('Initial commit')
          g.add_remote 'origin', url
          g.push
        end
      end
    end

    def write_erb_file(file, view, object)
      text = ERB.new(
        File.read(Rails.root.join(view))
      ).result(SimpleDelegator.new(object).binding)
      File.write(file, text)
    end
  end
end
