class GuidesController < ApplicationController

  def index
    @guide_groups = GuidesGroup.all
    @guide_group = GuidesGroup.find_by_slug!(params.fetch(:group, 'platform'))
  end

end
