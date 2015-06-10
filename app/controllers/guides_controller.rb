class GuidesController < ApplicationController
  def faq
    @article_list = FaqGroup.all
    @article = FaqGroup.find_by_slug!(params.fetch(:group))
    @title = "FAQs"
    @description = "Frequently asked questions about #{@article.name.downcase} on Assembly."
    @show_toc = false
    render :index
  end

  def guides
    @article_list = GuidesGroup.all
    @article = GuidesGroup.find_by_slug!(params.fetch(:group, "platform"))
    @title = "Guides"
    @description = "A guide about #{@article.name.downcase} on Assembly."
    @show_toc = true
    render :index
  end
end
