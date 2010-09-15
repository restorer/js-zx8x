#!/usr/bin/ruby

require 'RMagick'

$scale = 2

def put_line(view, line, bt)
	line *= $scale

	black = Magick::Pixel.from_color('#000000')
	white = Magick::Pixel.from_color('#EEEEEE')

	bits = [
		((bt & 0x80) != 0 ? black : white),
		((bt & 0x40) != 0 ? black : white),
		((bt & 0x20) != 0 ? black : white),
		((bt & 0x10) != 0 ? black : white),
		((bt & 0x08) != 0 ? black : white),
		((bt & 0x04) != 0 ? black : white),
		((bt & 0x02) != 0 ? black : white),
		((bt & 0x01) != 0 ? black : white)
	]

	for i in 1..$scale
		pos = 0

		bits.each do |pix|
			for j in 1..$scale
				view[line][pos] = pix
				pos += 1
			end
		end

		line += 1
	end
end

def make_font(base, rom_name, image_name)
	rom_str = File.open(rom_name, 'rb') { |fi| fi.read }

	rom = []
	rom_str.each_byte { |b| rom << b }

	img = Magick::Image.new(8 * $scale, 256 * 8 * $scale)
	line = 0

	img.view(0, 0, img.columns, img.rows) do |view|
		for chr in 0..63
			addr = base | (chr << 3)

			for cl in 0..7
				put_line(view, line, rom[addr + cl])
				line += 1
			end
		end

		for chr in 0..63
			addr = base | (chr << 3)

			for cl in 0..7
				put_line(view, line, 0)
				line += 1
			end
		end

		for chr in 0..63
			addr = base | (chr << 3)

			for cl in 0..7
				put_line(view, line, rom[addr + cl] ^ 0xFF)
				line += 1
			end
		end

		for chr in 0..63
			addr = base | (chr << 3)

			for cl in 0..7
				put_line(view, line, 0)
				line += 1
			end
		end
	end

	img = img.quantize(2)
	img.write(image_name)
end

make_font(0x0E00, 'zx80rom.bin', 'zx80f.gif')

