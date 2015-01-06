class MarkVectorFromText
  include Sidekiq::Worker
  def perform(user_id, text)
    mv = Interpreter.new.mark_vector_from_text(text)
    AddMarkIdentity.perform_async(user_id, mv, 3.0)
  end
end
