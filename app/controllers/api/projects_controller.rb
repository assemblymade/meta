module Api
  class ProjectsController < ApplicationController
    respond_to :json

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    before_action :authenticate
    before_action :authenticate_user!

    def create
      @product = Product.find_by(slug: params[:product_id])
      @wip = @product.wips.create!(title: milestone_params[:title], user: current_user)

      if @wip.valid?
        # then create milestone
        @milestone = @wip.create_milestone!(milestone_params[:milestone_attributes].merge(user: current_user, product: @product))

        if @milestone.valid?
          update_tasks_for(@milestone)
        end
      end

      respond_with @wip, location: product_project_path(@product, @milestone)
    end

    def update_tasks_for(milestone)
      # add/create tasks
      Array(milestone_params[:milestone_tasks_attributes]).each do |attrs|
        if attrs[:id].present?
          task = @product.tasks.find(attrs[:id])
          MilestoneTask.find_or_create_by!(milestone: @milestone, task: task)
        else
          task = WipFactory.create(
            @product,
            @product.tasks,
            current_user,
            request.remote_ip,
            title: attrs[:title]
          )
          milestone.tasks << task
        end
      end
    end

    def milestone_params
      params.require(:wip).permit(:title, milestone_attributes: [:description], milestone_tasks_attributes: [:id, :title], milestone_images_attributes: [:attachment_id])
    end

    private

    def authenticate
      authenticate_or_request_with_http_token do |token, options|
        user = User.find_by(authentication_token: token)

        sign_in user if user
      end
    end
  end
end
