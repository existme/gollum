# ~*~ encoding: utf-8 ~*~
require 'gollum/app'

class Gollum::Filter::PlantUML2 < Gollum::Filter

  # Extract all sequence diagram blocks into the map and replace with
  # placeholders.
  def extract(data)
    return data if @markup.format == :txt

    extract_lang(data, 'sequence|uml')
    return data
  end

  def replace_plantuml_tags(language, code, indent = '')
    language = language.to_s.empty? ? nil : language
    "@startuml\n#{code}\n@enduml\n"
  end

  def replace_code_tags(language, code, indent = '')
    language = language.to_s.empty? ? nil : language
    "~~~#{language}\n#{code}\n~~~\n"
  end

  def process(data)
    data
  end

  private

  def extract_lang(data, lang_tags)
    extract_code_lang(data, '~~~', lang_tags)
    extract_code_lang(data, '```', lang_tags)
  end

  def extract_code_lang(data, code_tag, lang_tags)
    data.gsub!(/^([ \t]*)(#{code_tag}) ?(#{lang_tags})$([\S\s]*?)#{code_tag}[ \t\r]*$/m) do
      m_indent = Regexp.last_match[1]
      m_lang = Regexp.last_match[3]
      m_code = Regexp.last_match[4]
      lang = m_lang ? m_lang.strip : nil
      "#{m_indent}#{replace_plantuml_tags(lang, m_code, m_indent)}"
    end
  end

end

