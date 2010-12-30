#!/usr/bin/ruby

def main
	if ARGV.size != 1
		puts "Usage: ruby post-process.rb processed-file.js"
		return
	end

	File.open(ARGV[0], 'rb') do |fi|
		fi.each_line do |line|
			line.strip!
			next if line.empty? || line[0, 1]=='#'

			line.gsub!(/;{2,}/, ';')
			line.gsub!('(10-4)', '6')
			line.gsub!('(7-4)', '3')
			line.gsub!('(0x04 | 0x40 | 0x80)', '0xC4')
			line.gsub!('(0x80 | 0x20 | 0x08)', '0xA8')
			line.gsub!('(0x08 | 0x20)', '0x28')
			line.gsub!('(0x20 | 0x08)', '0x28')
			line.gsub!('(13-4)', '9')
			line.gsub!('(8-4)', '4')
			line.gsub!('(11-4)', '7')
			line.gsub!('(6-4)', '2')
			line.gsub!('(0x01 | 0x04 | 0x40 | 0x80)', '0xC5')
			line.gsub!('(0x02 | 0x10)', '0x12')
			line.gsub!('(0x80 | 0x20 | 0x08 | 0x01)', '0xA9')
			line.gsub!('(12-4)', '8')
			line.gsub!('(16-4)', '12')
			line.gsub!('(5-4)', '1')
			line.gsub!('(17-4)', '13')
			line.gsub!('(19-4)', '15')
			line.gsub!('(0x80 | 0x40 | 0x01)', '0xC1')
			line.gsub!('(0x40 | 0x04)', '0x44')
			line.gsub!('(0x01 | 0x08 | 0x20)', '0x29')
			line.gsub!('(0x01 | 0x10)', '0x11')
			line.gsub!('(0x02 | 0x01)', '0x03')
			line.gsub!('(15-4)', '11')
			line.gsub!('(14-4)', '10')
			line.gsub!('(11-8)', '3')
			line.gsub!('(5-4)', '1')
			line.gsub!('(8-5)', '3')
			line.gsub!(/\((\d)\)/, '\1')
			line.gsub!('(0x01 << 0)', '0x01')
			line.gsub!('(0x01 << 1)', '0x02')
			line.gsub!('(0x01 << 2)', '0x04')
			line.gsub!('(0x01 << 3)', '0x08')
			line.gsub!('(0x01 << 4)', '0x10')
			line.gsub!('(0x01 << 5)', '0x20')
			line.gsub!('(0x01 << 6)', '0x40')
			line.gsub!('(0x01 << 7)', '0x80')
			line.gsub!(' this.reg_b = this.reg_b; ', '')
			line.gsub!(' this.reg_c = this.reg_c; ', '')
			line.gsub!(' this.reg_d = this.reg_d; ', '')
			line.gsub!(' this.reg_e = this.reg_e; ', '')
			line.gsub!(' this.reg_h = this.reg_h; ', '')
			line.gsub!(' this.reg_l = this.reg_l; ', '')
			line.gsub!(' this.reg_a = this.reg_a; ', '')
			line.gsub!(/\((\([^);]+\))\)/, '\1')

			puts line
		end
	end
end

main
