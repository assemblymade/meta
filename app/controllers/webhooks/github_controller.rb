class Webhooks::GithubController < WebhookController

  def create
    type = request.headers['X-GitHub-Event']
    if payload = ::Github::Payload.load(type, params)

      product = Product.with_repo(payload.repo).first
      if product.nil?
        log "Product not found: #{ref.repo}"
        return
      end

      if payload.nil?
        log "Malformed payload"
      else
        payload.references.each do |ref|
          process_wip_reference(product, ref, payload)
        end

        # specs for this are found here:
        # http://developer.github.com/v3/activity/events/types/#pushevent

        if type == 'push'
          Github::UpdateCommitCount.perform_async(product.id)
          payload.commits.each do |commit|
            author = commit['author']
            user = User.find_by(github_login: author['username'])

            work = WorkFactory.create_with_transaction_entry!(
              product: product,
              user: user,
              url: commit['url'],
              metadata: { author: author, message: commit['message'], distinct: commit['distinct'] }
            )
          end
        end
      end
    end

    render nothing: true, status: 200
  end

  def process_wip_reference(product, ref, payload)
    # some github hooks send uid, others send the login
    user = if ref.github_uid
      User.find_by(github_uid: ref.github_uid)
    elsif ref.github_login
      User.find_by(github_login: ref.github_login)
    end

    if user.nil?
      log "User not found: #{ref.github_login}:#{ref.github_uid}"

      # the user probably hasn't linked their github account. Fail the pull on github
      repo = ref.repo.split('/')[-2..-1].join('/')
      ::Github::PullRequestUnknownUserWorker.perform_async(repo, payload.head_sha, ref.github_login)
      return
    end

    @wip = product.wips.find_by(number: ref.wip)
    if @wip.nil?
      log "Wip not found: #{ref.repo}/#{ref.wip}"
      return
    end

    if @wip.awardable?
      @wip.with_lock do
        @wip.submit_code!({ url: ref.url }, user)
      end
    end
  end

  def log(message)
    # logger.info(message)
    puts "  [github] #{message}"
  end
end
