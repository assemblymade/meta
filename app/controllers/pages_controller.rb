class PagesController < ApplicationController
  respond_to :html, :json

  PER_PAGE = 30

  def badges
    @badges = [
      [ { name: "Flag",
          desc: "The original swag flag",
          minHeight: "41px;",
          width: "25%",
          type: "flag_icon",
          defaultWidth: "61px",
          defaultHeight: "38px",
          transparentImageURL: "flag_text_transparent.svg" },
        { name: "Flag and Text",
          desc: "Freedom flag",
          minHeight: "41px;",
          imageURL: "flag_text.svg",
          width: "100%",
          type: "light_flag_banner",
          defaultWidth: "243px",
          defaultHeight: "41px",
          transparentImageURL: "flag_text_transparent.svg" }],
      [ { name: "Dark banner",
          desc: "Resizeable banner",
          imageURL: "dark_badge.svg",
          width: "100%",
          type: "dark_love_banner",
          defaultWidth: "243px",
          defaultHeight: "34px",
          transparentImageURL: "flag_text_transparent.svg"},
        { name: "Light banner",
          desc: "Resizeable banner",
          imageURL: "light_badge.svg",
          width: "100%",
          type: "light_love_banner",
          defaultWidth: "243px",
          defaultHeight: "34px",
          transparentImageURL: "flag_text_transparent.svg"}]
      ]
  end

  def tos
  end

  def home
    test = ab_test('discover_homepage', 'focus', 'discover')
    if test == 'focus'
      render 'focus_home', layout: nil
    else

      @showcases = Showcase.active.order(:slug)
      @topics = Topic.all

      respond_to do |format|
        format.json do
          @products = if params[:search].present?
            Search::ProductSearch.new(params[:search]).results
          else
            @apps = AppsQuery.new(current_user, params).perform.page(params[:page]).per(PER_PAGE)
          end

          respond_with(@apps, each_serializer: AppSerializer)
        end
        format.html do
          if params[:search].blank?
            @products_count = AppsQuery.new(current_user, params).perform.count
            @total_pages = (@products_count / PER_PAGE.to_f).ceil
          end
        end
      end

    end
  end

  def core_team
    redirect_to help_path(group: 'building', anchor: 'who-is-in-control')
  end
end
