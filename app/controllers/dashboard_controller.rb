class DashboardController < ApplicationController
  respond_to :html

  def activity
    @stories = NewsFeed.new(current_user).page(params[:top_id])
    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq

    respond_with @stories
  end

  def bounties
    default_filters = {
      user: 'assigned',
      state: true,
      sort: ['commented', 'awarded'].exclude?(params[:user]) && 'newest'
    }.with_indifferent_access

    filters = default_filters.merge(params.slice(:user, :state))
    query = FilterWipsQuery.call(Task.all, current_user, filters)
    @wips = PaginatingDecorator.new(query)

    set_empty_state if @wips.empty?

    respond_with @wips
  end

  def set_empty_state
    @empty_state_link_location = discover_path

    if params[:user].blank?
      @empty_state_text = "You aren't working on any bounties"
      @empty_state_link_text = 'Find a bounty to work on'
    elsif params[:user] == 'started'
      @empty_state_text = "You haven't created any bounties"
      @empty_state_link_text = 'Find a project and create a bounty'
    elsif params[:user] == 'commented'
      @empty_state_text = "You haven't commented on any bounties"
      @empty_state_link_text = 'Read the most active bounties'
    elsif params[:user] == 'awarded'
      @empty_state_text = "You haven't been awarded any bounties"
      @empty_state_link_text = 'Find a bounty to work on'
    end
  end
end
