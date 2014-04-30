require 'spec_helper'
require 'action_controller/parameters'

describe ActionController::Parameters do
  describe '#param_merge' do
    # it 'merges attributes into hash' do
      # params = ActionController::Parameters.new(
#         title: 'sup',
#         wip_attributes: { title: 'wip title' },
#         tasks_attributes: [{ title: 'task1'}, {title: 'task2' }],
#         nested: {
#           object: {
#             title: 'such nest'
#           }
#         }
#
#       )
#
#       merged = params.param_merge(
#         user_id: '1',
#         wip_attributes: { user_id: '1' },
#         tasks_attributes: { user_id: '1' },
#         nested: {
#           object: {
#             user_id: '1'
#           }
#         }
#       )
#
#       expect(merged).to eq({
#         'title' => 'sup',
#         'user_id' => '1',
#         'wip_attributes' => { 'title' => 'wip title', 'user_id' => '1' },
#         'tasks_attributes' => [{
#           'title' => 'task1', 'user_id' => '1'
#         }, {
#           'title' => 'task2', 'user_id' => '1'
#         }],
#         'nested' => {
#           'object' => {
#             'title' => 'such nest',
#             'user_id' => '1'
#           }
#         }
#       })
#     end

    # it 'ignores empty params' do
    #   params = ActionController::Parameters.new(
    #     wip_attributes: { title: 'wip title' },
    #   )
    #
    #   merged = params.param_merge(
    #     tasks_attributes: { user_id: '1' },
    #   )
    #
    #   expect(merged).to eq({
    #     'wip_attributes' => {
    #       'title' => 'wip title'
    #     }
    #   })
    # end
  end
end