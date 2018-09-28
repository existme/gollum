# ~*~ encoding: utf-8 ~*~
require 'gollum/app'
require 'securerandom'
require 'nokogiri'

class Nokogiri::XML::Node
  def add_css_class(*classes)
    existing = (self['class'] || "").split(/\s+/)
    self['class'] = existing.concat(classes).uniq.join(" ")
  end
end

class Gollum::Filter::TaskListFilter < Gollum::Filter

  # Extract all sequence diagram blocks into the map and replace with
  # placeholders.
  def extract(data)
    return data if @markup.format == :txt
    data.gsub!(/\[(x|X| )\] /) do
      task_value = Regexp.last_match[1]
      cache_token(task_value)
    end
    data
  end

  def process(data)
    return data if data.nil? || data.size.zero? || @map.size.zero?
    doc = Nokogiri::HTML(data)
    @map.each do |token, spec|
      val=spec[:val]
      elements = doc.xpath("//*[text()[contains(.,'#{token}')]]")
      next if elements.nil? || !elements.any?

      element = nil
      elements.children.each do |e|
        next unless e.content.include? token
        element = e
        break
      end

      element.content = element.content.gsub(token, '')
      element = element.parent
      if val === 'x' || val === 'X'
        element.add_css_class('task-list-item checked')
      else
        element.add_css_class('task-list-item')
      end
    end
    doc.to_html
  end

  private

  def cache_token(tokenValue)
    token = "==#{SecureRandom.hex}=="
    @map[token] = {val: tokenValue}
    token
  end

end

