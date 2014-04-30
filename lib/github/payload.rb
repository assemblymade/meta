require 'ostruct'
require 'json'

module Github
  class Payload
    def self.load(type, params)
      @h = params

      case type
      when 'pull_request'
        Github::PullRequest.new(@h)
      when 'push'
        Github::Push.new(@h)
      end
    end

    def extract_reference(message, repo, github_url, github_uid, github_login)
      if message =~ /#(\d+)/
        WipReference.new(
          repo,
          github_url,
          $1.to_i,
          github_uid,
          github_login,
          message,
        )
      end
    end
  end

  class PullRequest < Payload
    def initialize(h)
      @h = h
    end

    def repo
      @h['repository']['html_url']
    end

    def pull
      @h['number']
    end

    def head_sha
      @h['pull_request']['head']['sha']
    end

    def references
      @references ||= begin
        pr = @h['pull_request']
        references = []
        references << extract_reference(pr['title'], repo, pr['html_url'], pr['user']['id'], pr['user']['login'])
        references.compact.uniq
      end
    end
  end

  class Push < Payload
    def initialize(h)
      @h = h
    end

    def repo
      @h['repository']['url']
    end

    def references
      @references ||= begin
        references = []
        Array(commits).each do |commit|
          references << extract_reference(commit['message'], repo, commit['url'], nil, commit['author']['username'])
        end
        references.compact.uniq
      end
    end
    
    def commits
      Array(@h['commits'])
    end
  end

  class WipReference < Struct.new(:repo, :url, :wip, :github_uid, :github_login, :message)
  end
end
