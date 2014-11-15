class Admin::KarmahistoryController < AdminController

  def index
    @karma_history = Karma::Kronikler.new.meta_karma_history(30)

    @karma_history_chart_data = [["Date", "Karma Produced"]]

    @karma_history.each do |k, v|
      @karma_history_chart_data.append([k, v])
    end

  end

end
