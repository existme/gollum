# ~*~ encoding: utf-8 ~*~

require 'gollum/app'
require 'securerandom'
require 'nokogiri'

class Nokogiri::XML::Node
  def add_css_class(*classes)
    existing = (self['class'] || '').split(/\s+/)
    self['class'] = existing.concat(classes).uniq.join(' ')
  end
end

class Gollum::Filter::AttributeFilter < Gollum::Filter
  # Extract all sequence diagram blocks into the map and replace with
  # placeholders.
  def extract(data)
    return data if @markup.format == :txt
    # by pass any `{.style}` but capture all {.style}
    data.gsub!(/`.*`|{(.+?)}/) do
      if Regexp.last_match[1].nil?
        Regexp.last_match
      else
        attr_name = Regexp.last_match[1]
        cache_attribute(attr_name)
      end
    end
    data
  end

  def process(data)
    return data if data.nil? || data.size.zero? || @map.size.zero?
    doc = Nokogiri::HTML(data)
    @map.each do |token, spec|
      attr = spec[:attr]
      elements = doc.xpath("//*[text()[contains(.,'#{token}')]]")
      next if elements.nil? || !elements.any?
      element = nil
      elements.children.each do |e|
        next unless e.content.include? token
        element = e
        break
      end
      next unless attr.start_with?('.')
      attr.tr!('.', ' ')

      styling_element = nil
      styling_element = element.previous_element if (element.content.start_with?(token))
      styling_element = element.parent if styling_element.nil? && element.is_a?(Nokogiri::XML::Text)
      styling_element = element.previous_element if styling_element.nil?
      styling_element = element.parent if styling_element.nil?
      styling_element.add_css_class(attr)
      element.content = element.content.gsub(token, '')
    end
    doc.to_html
  end

  private

  def cache_attribute(attr_name)
    token = "==#{SecureRandom.hex}=="
    @map[token] = { attr: attr_name }
    token
  end
end
