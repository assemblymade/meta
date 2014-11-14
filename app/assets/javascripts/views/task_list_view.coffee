class window.TaskListView extends Backbone.View
  events:
    'keypress .js-new-task-input': 'createOnEnter'
    # 'blur     .js-new-task-input': 'create'

  keys:
    ENTER: 13

  initialize: (args)->
    @incompleteTasks = args.incompleteTasks
    @completeTasks = args.completeTasks

    @children =
      newTask: @$('.js-new-task')
      newTaskInput: @$('.js-new-task-input')
      incompleteTasksList: @$('.js-incomplete-tasks-list')
      completeTasksList: @$('.js-complete-tasks-list')
      newTasksList: @$('.js-new-tasks-list')

    @listenTo(@incompleteTasks, 'add', @addIncomplete)
    @listenTo(@incompleteTasks, 'change:state', @stateChanged)

    @listenTo(@completeTasks, 'add', @addComplete)
    @listenTo(@completeTasks, 'change:state', @stateChanged)

  addIncomplete: (taskItem)->
    @addToList(taskItem, @children.incompleteTasksList)

  addComplete: (taskItem)->
    @addToList(taskItem, @children.completeTasksList)

  addToList: (taskItem, list)->
    view = new TaskItemView(model: taskItem)
    el = view.render().el
    list.append(el)

  createOnEnter: (e)->
    if e.which == @keys.ENTER
      e.preventDefault()

      @create()

  create: ->
    title = @children.newTaskInput.val().trim()

    model = new TaskItem(title: title)
    @incompleteTasks.add model

    matches = /^#?(\d+)\s*$/.exec(title)
    if matches
      model.set('number': matches[1])
      model.fetch
        success: =>
          model.save()
          model.set('title', model.attributes.bounty.title)
        error: =>
          model.set('number': null)
          model.save()

    else
      model.save()

    @children.newTaskInput.val('')

  stateChanged: (task)->
    if task.complete()
      @incompleteTasks.remove(task)
      @completeTasks.add(task)
    else
      @completeTasks.remove(task)
      @incompleteTasks.add(task)

    @children.newTaskInput.focus()
