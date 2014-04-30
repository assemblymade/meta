class ProductMailer < ActionMailer::Base
  helper :markdown
  helper :wip

  include ActionView::Helpers::TextHelper

  def congrats_on_your_first_user(product_id)
    @product = Product.find(product_id)
    entire_core_team = (@product.core_team + [@product.user]).uniq.compact.collect(&:email)

    mail from: "#{@product.name} <notifications@assemblymade.com>",
           to: entire_core_team,
      subject: "#{@product.name} just got its first signup!"
  end

  def stale_wips(user_id)
    @product = Product.find_by!(slug: 'helpful')
    @wips = @product.wips.where(state: %w(open allocated)).stale_by(20.hours.ago).to_a
    @user = User.find(user_id)

    mail from: "#{@product.name} <notifications@assemblymade.com>",
           to: @user.email,
      subject: "#{pluralize @wips.size, 'stale WIP'} on #{@product.name}"
  end

  def flagged(curret_user_id, product_id, message)
    @current_user = User.find(curret_user_id)
    @product      = Product.find(product_id)
    @message      = message
    mail from: @current_user.email,
           to: @product.user.email,
           cc: @current_user.email,
      subject: "[Assembly] Update on #{@product.name}"
  end

  def status_update(user_id, status_update_id)
    tag 'product#status_update'

    @user = User.find(user_id)
    @status_update = StatusUpdate.find(status_update_id)
    @product = @status_update.product

    new_wips = Wip.open.
      joins(:product).
      where(product_id: @product.id).
      order('products.name', 'wips.created_at desc').
      take(5)

    recently_awarded_wips = Task.won.
      joins(:product).
      where(product_id: @product.id).
      order('wips.closed_at desc').
      take(5)

    hot_wips = Wip.open.
      joins(:product).
      joins(:comments).
      where(product_id: @product.id).
      where('events.created_at > ?', 3.days.ago).
      group('wips.id').
      having('events.count >= ?', 3).
      order('events.count desc').
      take(5)

    @wips = [{
      title: 'New WIPs',
      wips: new_wips
    },{
      title: 'Hot WIPs',
      wips: hot_wips,
    }, {
      title: 'Recently Awarded',
      wips: recently_awarded_wips
    }]

    @from = @status_update.user

    mail from: "#{@from.name} on #{@product.name} <notifications@assemblymade.com>",
           to: @user.email,
      subject: @status_update.title
  end

  def idea_process_update(product_id)
    tag 'product#idea_process_update'

    @product = Product.find(product_id)
    @user = @product.user

    mail from: "matt@assemblymade.com",
           to:  @user.email,
      subject: "[Assembly] Good news for #{@product.name}"
  end

  def mission_completed(completed_mission_id, user_id)
    @completed_mission = CompletedMission.find(completed_mission_id)
    @product = @completed_mission.product
    @user = User.find(user_id)
    @mission = ProductMissionDecorator.new(ProductMission.find(@completed_mission.mission_id, @product))

    subject = I18n.t("missions.#{@completed_mission.mission_id}.reward_title", product: @product.name).strip

    mail from: "#{@product.name} <notifications@assemblymade.com>",
           to: @user.email,
      subject: I18n.t("missions.#{@completed_mission.mission_id}.reward_title", product: @product.name).strip

  end

  def tag(name)
    headers 'X-Mailgun-Tag' => name.to_s
  end

end
