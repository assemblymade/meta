class Webhooks::GithubController < WebhookController

  def create
    process_request

    render nothing: true, status: 200
  end

  # private

  def process_request
    type = request.headers['X-GitHub-Event']
    if payload = ::Github::Payload.load(type, params)

      product = Product.with_repo(payload.repo).first
      if product.nil?
        log "Product not found: #{payload.repo}"
        return
      end

      if payload.nil?
        log "Malformed payload"
      else
        # specs for this are found here:
        # http://developer.github.com/v3/activity/events/types/#pushevent

        if type == 'push'
          Github::UpdateCommitCount.perform_async(product.id)
          payload.commits.each do |commit|
            author = commit['author']
            if username = author['username']
              user = User.find_by(github_login: username)

              work = WorkFactory.create_with_transaction_entry!(
                product: product,
                user: user,
                url: commit['url'],
                metadata: { author: author, message: commit['message'], distinct: commit['distinct'], sha: commit['sha'] }
              )

              Activities::GitPush.publish!(
                actor: user,
                subject: work,
                target: product
              )
            end
          end
        end
      end
    end
  end

  def log(message)
    # logger.info(message)
    puts "  [github] #{message}"
  end
end
