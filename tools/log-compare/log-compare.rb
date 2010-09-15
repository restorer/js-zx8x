#!/usr/bin/ruby

File.open('cputrace.log', 'r') do |fi|
	File.open('zemuz80.log', 'w') do |fo|
		while !fi.eof
			line = fi.gets.strip
			fo << "#{line}\n" unless line.match(/INTR=01/)
		end
	end
end

line = 0

File.open('zemuz80.log', 'r') do |fa|
	File.open('jsz80.log', 'r') do |fb|
		File.open('result.log', 'w') do |fo|
			while !fa.eof() && !fb.eof()
				line += 1
				str_a = fa.gets.strip
				str_b = fb.gets.strip

				str_a.gsub!('R=8', 'R=0')
				str_a.gsub!('R=9', 'R=1')
				str_a.gsub!('R=A', 'R=2')
				str_a.gsub!('R=B', 'R=3')
				str_a.gsub!('R=C', 'R=4')
				str_a.gsub!('R=D', 'R=5')
				str_a.gsub!('R=E', 'R=6')
				str_a.gsub!('R=F', 'R=7')
				str_a.gsub!(/dT=[0-9A-F][0-9A-F]/, 'dT=00')

				if str_a != str_b
					fo << "\n"
					fo << "> Line #{line}\n"
					fo << "[A] #{str_a}\n"
					fo << "[B] #{str_b}\n"

					break
				else
					fo << str_b + "\n"
				end
			end
		end
	end
end
