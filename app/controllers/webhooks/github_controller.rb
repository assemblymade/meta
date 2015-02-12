class Webhooks::GithubController < WebhookController

  def create
    process_request

    render nothing: true, status: 200
  end

  # private

  def process_request
    type = request.headers['X-GitHub-Event']
    return unless type == 'push'

    payload = ::Github::Payload.load(type, params)
    log 'Malformed payload' and return unless payload

    product = Product.with_repo(payload.repo).first
    log "Product not found: #{payload.repo}" and return unless product

    # specs for this are found here:
    # http://developer.github.com/v3/activity/events/types/#pushevent

    Github::UpdateCommitCount.perform_async(product.id)

    payload.commits.each do |commit|
      author = commit['author']

      username = author['username']
      next unless username

      user = User.find_by(github_login: username)
      next unless user

      work = WorkFactory.create_with_transaction_entry!(
        product: product,
        user: user,
        url: commit['url'],
        metadata: {
          author: author,
          message: commit['message'],
          distinct: commit['distinct'],
          sha: commit['sha']
        }
      )

      Activities::GitPush.publish!(
        actor: user,
        subject: work,
        target: product
      )
    end
  end

  def log(message)
    # logger.info(message)
    puts "  [github] #{message}"
  end
end
