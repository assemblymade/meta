function truncate(text, limit) {
  if (!text || text.length <= limit) {
    return text
  }

  return text.substr(0, limit) + "…"
}
