class CoreTeamMailer < BaseMailer

  def welcome(product_id, user_id)
    @product = Product.find(product_id)
    @user = @product.core_team.find(user_id)

    mail to: @user.email_address.to_s,
         cc: (@product.core_team - [@user]).map {|u| u.email_address.to_s },
         subject: "Welcome to the #{@product.name} Core Team"
  end

  def featured_work(product)
    @product = product

    active_core_team = (@product.core_team + [@product.user]).uniq.compact.delete_if { |c|
      c.last_request_at.nil? || c.last_request_at < 30.days.ago
    }.collect(&:email)

    return if active_core_team.empty?

    mail from: "Austin Smith <austin.smith@assembly.com>",
           to: active_core_team,
      subject: "Can I help grow the #{@product.name} team?"
  end


end
