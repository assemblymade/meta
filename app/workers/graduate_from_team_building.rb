class GraduateFromTeamBuilding
  include Sidekiq::Worker

  def perform
    expired = Product.team_building.where('started_team_building_at < ?', 30.days.ago)

    successes, failures = *expired.partition do |product|
      product.bio_memberships_count >= 10
    end

    successes.each do |product|
      product.greenlight!

      TeamBuildingMailer.success(product.id).deliver
    end

    failures.each do |product|
      product.reject!

      TeamBuildingMailer.failure(product.id).deliver
    end
  end
end
