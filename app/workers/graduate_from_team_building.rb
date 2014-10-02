class GraduateFromTeamBuilding
  include Sidekiq::Worker

  def perform
    expired = Product.where('started_team_building_at < ?', 30.days.ago).
      where(greenlit_at: nil)

    successes, failures = *expired.partition do |product|
      product.partners.count >= 10
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
