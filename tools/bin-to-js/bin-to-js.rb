#!/usr/bin/ruby

def main
	if ARGV.size != 1
		puts "Usage: ruby bin-to-js.rb file.bin"
		return
	end

	base_name = ARGV[0].gsub(/\..+?$/, '')
	data = ''

	File.open(ARGV[0], 'rb') do |fi|
		data = fi.read
	end

	res = []

	data.each_byte do |bt|
		res << '0x%02X' % bt
	end

	File.open("#{base_name}.js", 'wb') do |fo|
		fo << base_name + ' = [' + res.join(',') + '];'
	end
end

main
