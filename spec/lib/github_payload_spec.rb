require './lib/github/payload'

# test against development site with
# $ curl -XPOST http://localhost:5000/webhooks/github -H "Content-Type: application/json" -H "X-Github-Event: pull_request" -d @spec/fixtures/github/pull_request.json
# $ curl -XPOST http://localhost:5000/webhooks/github -H "Content-Type: application/json" -H "X-Github-Event: push" -d @spec/fixtures/github/push.json

describe Github::Payload do
  describe '#push' do
    subject {
      Github::Push.new(JSON.parse(File.read('spec/fixtures/github/push.json')))
    }

    it 'references wips' do
      subject.references.size.should == 1
      ref = subject.references.first
      ref.repo.should == 'https://github.com/support-foo/web'
      ref.wip.should == 5
      ref.url.should == 'https://github.com/support-foo/web/commit/ca201959a7e87794c8d30edd3cbeaf8a341adc46'
      ref.github_login.should == 'whatupdave'
      ref.message.should == "Performance improvements\n\nAlso let's test #5"
    end

    it 'has commits' do
      subject.commits.size.should == 1
      commit = subject.commits.first
      commit['author'].should == {
        "name" => "Dave Newman",
        "email" => "lolwut@noway.biz",
        "username" => "whatupdave"
      }
    end
  end

  describe '#pull_request' do
    subject {
      Github::PullRequest.new(JSON.parse(File.read('spec/fixtures/github/pull_request.json')))
    }

    its(:pull) { should == 1 }
    its(:head_sha) { should == '9985c8954b63159f6bb7a372dde792576011c31e' }

    it 'references wips' do
      subject.references.size.should == 1
      ref = subject.references.first
      ref.repo.should == 'https://github.com/support-foo/web'
      ref.wip.should == 5
      ref.url.should == 'https://github.com/support-foo/web/pull/2'
      ref.github_uid.should == 7064
      ref.github_login.should == 'whatupdave'
      ref.message.should == "Pull request for #5"
    end
  end
end
