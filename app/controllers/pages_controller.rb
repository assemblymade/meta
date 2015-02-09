class PagesController < ApplicationController

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
    test = ab_test('signup_conversion_from_focus_homepage', 'focus labs', 'whale')
    if test == 'focus labs'
      render 'focus_home', layout: nil
    else
      render
    end
  end

  def core_team
    redirect_to help_path(group: 'building', anchor: 'who-is-in-control')
  end
end
