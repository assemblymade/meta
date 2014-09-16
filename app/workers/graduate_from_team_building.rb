class GraduateFromTeamBuilding
  include Sidekiq::Worker

  def perform
    expired = Product.where('started_teambuilding_at < ?', 30.days.ago).
      where(greenlit_at: nil)

    successes, failures = *expired.partition do |product|
      product.partners.count >= 10
    end

    successes.each do |product|
      product.update!(greenlit_at: Time.now)

      # send congratulations email from Austin
    end

    failures.each do |product|
      product.update!(started_teambuilding_at: nil)

      # send bummer email from Austin
    end
  end
end
