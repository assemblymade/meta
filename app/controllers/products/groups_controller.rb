class Products::GroupsController < ApplicationController
  def show
    @product = Product.find_by_slug!(params.fetch(:product_id)).decorate
    @group = Group.find_by_slug!(@product, params.fetch(:id))

    tagged_tasks = Task.joins(:taggings).where(wip_taggings: { wip_tag_id: @group.tag.id })
    @latest_discussions = tagged_tasks.hot.limit(5)
    @recently_awarded_work = tagged_tasks.won.limit(5)
  end

end
