class CreateIdeaWipWorker < ActiveJob::Base
  queue_as :default

  def perform(product_id)
    idea  = Product.find(product_id)
    bot   = User.asm_bot
    title = "#{idea.name}: #{idea.pitch}"
    wip   = Product.find_by!(slug: 'asm-ideas').wips.create! title: title, user: bot, created_at: idea.created_at, updated_at: idea.updated_at
    signature = <<-EOS
#{idea.user.name} ([#{idea.user.email}](mailto:#{idea.user.email})) [Administer](#{Rails.application.routes.url_helpers.admin_idea_url(idea)})
EOS

    wip.events << Event::Comment.new(
      user_id: bot,
      body: ["*#{idea.lead}*", idea.description, signature].join("\n\n")
    )
  end
end
