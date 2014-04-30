class WelcomeController < ApplicationController
  def index
    @code_tasks = ImportantTasksQuery.call(:code).decorate
    @design_tasks = ImportantTasksQuery.call(:design).decorate
  end
end
