class DashboardController < ApplicationController
  respond_to :html

  def activity
    @stories = NewsFeed.new(current_user).page(params[:top_id])
    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq

    respond_with @stories
  end

  def bounties
    default_filters = { user: 'assigned', state: true }.with_indifferent_access
    filters = default_filters.merge(params.slice(:user, :state))

    query = FilterWipsQuery.call(Wip.all, current_user, filters)
    query = query.ordered_by_activity
    @wips = PaginatingDecorator.new(query)

    @user = current_user.decorate

    respond_with @wips
  end
end
