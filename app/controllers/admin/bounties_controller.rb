class Admin::BountiesController < AdminController

  include BountyStatsHelper
  require 'date'

  before_action :set_params

  def index
    # TODO clean up: this code is really gross
    @avg_bounty_age = avg_bounty_lifespan
    @avg_bounty_last_week = avg_bounty_lifespan(1.week.ago.beginning_of_week, Date.today.beginning_of_week)

    @created_counts = bounties_created.transpose
    @awarded_counts = award_ratio.transpose
    @closed_counts = close_ratio.transpose
  end

  def graph_data
    type = params[:type]

    case type
    when 'bounty_creation'
      data = bounties_created
    when 'award_ratio'
      data = award_ratio
    when 'close_ratio'
      data = close_ratio
    else
      data = nil
    end

    result = []
    groups = ["Global", "Core", "Noncore", "Staff"]

    unless data.nil?
      dates = data.shift
      data.each_with_index do |d, i|
        result << {"name" => groups[i],
          "data" => d.map.with_index{|d, i| {"x" => dates[i].to_time.to_i, "y" => d}}}
      end
    end

    respond_to do |format|
      format.json {render json: result}
      format.csv {render text: array_to_csv(bounties_created)}
    end
  end

  private

  def bounties_created
    @created = created(nil, @history)
    @created_c = created('core', @history)
    @created_s = created('staff', @history)
    @created_n = created('noncore', @history)
    [date_helper(@history),
      @created,
      @created_c,
      @created_n,
      @created_s]
  end

  def award_ratio
    bounties_created
    [date_helper(@history),
    awarded(nil, @history).zip(@created).map{|m| m.first / m.last},
    awarded('core', @history).zip(@created_c).map{|m| m.first / m.last},
    awarded('noncore', @history).zip(@created_n).map{|m| m.first / m.last},
    awarded('staff', @history).zip(@created_s).map{|m| m.first / m.last}]
  end

  def close_ratio
    bounties_created
    [date_helper(@history),
    closed(nil, @history).zip(@created).map{|m| m.first / m.last},
    closed('core', @history).zip(@created_c).map{|m| m.first / m.last},
    closed('noncore', @history).zip(@created_n).map{|m| m.first / m.last},
    closed('staff', @history).zip(@created_s).map{|m| m.first / m.last}]
  end

  def set_params
    @user_type = params[:user_type]
    @history = filtered_params(:weeks, 4)
  end

  def filtered_params(key, default=nil)
    return nil if default.nil? || key.nil?
    !!(params[key] =~ /\A[-+]?[0-9]+\z/) ? params[key].to_i : default
  end

end
