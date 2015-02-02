class GovernanceWorker
  include Sidekiq::Worker
  def perform
    Governance.new.enforce_all
  end
end
