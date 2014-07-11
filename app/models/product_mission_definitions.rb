# Missions run in the order listed in this file. The next mission is determined by the missions already completed.
# Mission copy is stored in config/locales/missions.en.yml
class ProductMissionDefinitions
  include Missions::DSL

  # mission :tasks do
  #   steps       2
  #
  #   steps_completed do
  #     product.tasks.count
  #   end
  #
  #   on_completed do
  #     # create repo
  #     Github::CreateProductRepoWorker.perform_async(
  #       product.id,
  #       Rails.application.routes.url_helpers.product_url(product)
  #     )
  #
  #     # add creator to repo
  #     if github_login = product.user.github_login
  #       Github::AddCollaboratorToProductRepoWorker.perform_in(
  #         1.minute,
  #         product.slug,
  #         github_login
  #       )
  #     end
  #  #   end
  # end
  #
  # mission :contributors do
  #   steps       5
  #
  #   steps_completed do
  #     product.count_contributors
  #   end
  #
  #   on_completed do
  #     product.can_advertise = true
  #     product.save!
  #   end
  # end

  # mission :events do
  #   steps       25
  #
  #   steps_completed do
  #     Event.joins(:wip).
  #       where('wips.product_id = ?', product.id).
  #       where('wips.type = ?', Task).size
  #   end
  #
  #   on_completed do
  #     chris = User.find_by!(username: 'chrislloyd')
  #     product.core_team << chris unless product.core_team.include?(product.user)
  #   end
  # end
  #
  # mission :signups do
  #   steps       50
  #
  #   steps_completed do
  #     product.count_presignups
  #   end
  #
  #   on_completed do
  #     product.feature!
  #   end
  # end
  #
  # mission :more_contributors do
  #   steps       25
  #
  #   steps_completed do
  #     product.count_contributors
  #   end
  #
  #   on_completed do
  #     # TODO: (whatupdave) send an email
  #   end
  # end
end
