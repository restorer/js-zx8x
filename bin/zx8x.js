/*
 * js-zx8x
 * Copyright 2010, Slava Tretyak
 */

var is_ie = (document.all && !window.opera);
var MIN_DELAY = 20;		// 20 for chrome, 100 for others
var FRAME_SKIP = 3;		// 0 for chrome, 3 for others

var viewport = null;
var elements = [];
var el_pc = null;

function add_handler(element, event_name, event_handler)
{
	if (element.addEventListener) element.addEventListener(event_name, event_handler, false);
	else
	if (element.attachEvent) element.attachEvent('on' + event_name, event_handler);
}

ZX8X = function()
{
	var MAX_LINE = 321;

	var cpu = null;
	var mem = null;
	var scr = null;

	var start = 0;
	var ticks = 0;
	var int_active = false;
	var must_blit = false;

	var vid_tick = 0;
	var vid_line = 0;
	var vid_cntr = 0;
	var vid_byte = 0;
	var vid_hsync = -1;

	var kbd_ports = [
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
	];

	var kbd_map = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	];

	function update_kbd()
	{
		for (var i = 0; i < 8; i++)
		{
			var val = 0;

			if (kbd_map[i][0]) { val |= 0x01; if (kbd_map[i][0] > 0) { kbd_map[i][0]--; } }
			if (kbd_map[i][1]) { val |= 0x02; if (kbd_map[i][1] > 0) { kbd_map[i][1]--; } }
			if (kbd_map[i][2]) { val |= 0x04; if (kbd_map[i][2] > 0) { kbd_map[i][2]--; } }
			if (kbd_map[i][3]) { val |= 0x08; if (kbd_map[i][3] > 0) { kbd_map[i][3]--; } }
			if (kbd_map[i][4]) { val |= 0x10; if (kbd_map[i][4] > 0) { kbd_map[i][4]--; } }

			kbd_ports[i] = val ^ 0x1F;
		}
	}

	/*
	  __Line____Bit__0____1____2____3____4__
	   0  (A8)     SHIFT  Z    X    C    V
	   1  (A9)       A    S    D    F    G
	   2  (A10)      Q    W    E    R    T
	   3  (A11)      1    2    3    4    5
	   4  (A12)      0    9    8    7    6
	   5  (A13)      P    O    I    U    Y
	   6  (A14)    ENTER  L    K    J    H
	   7  (A15)     SPC   .    M    N    B
	*/

	function update_key(keyCode, val)
	{
		switch (keyCode)
		{
			case 16:  kbd_map[0][0] = val; return true;
			case 90:  kbd_map[0][1] = val; return true;
			case 88:  kbd_map[0][2] = val; return true;
			case 67:  kbd_map[0][3] = val; return true;
			case 86:  kbd_map[0][4] = val; return true;
			case 65:  kbd_map[1][0] = val; return true;
			case 83:  kbd_map[1][1] = val; return true;
			case 68:  kbd_map[1][2] = val; return true;
			case 70:  kbd_map[1][3] = val; return true;
			case 71:  kbd_map[1][4] = val; return true;
			case 81:  kbd_map[2][0] = val; return true;
			case 87:  kbd_map[2][1] = val; return true;
			case 69:  kbd_map[2][2] = val; return true;
			case 82:  kbd_map[2][3] = val; return true;
			case 84:  kbd_map[2][4] = val; return true;
			case 49:  kbd_map[3][0] = val; return true;
			case 50:  kbd_map[3][1] = val; return true;
			case 51:  kbd_map[3][2] = val; return true;
			case 52:  kbd_map[3][3] = val; return true;
			case 53:  kbd_map[3][4] = val; return true;
			case 48:  kbd_map[4][0] = val; return true;
			case 57:  kbd_map[4][1] = val; return true;
			case 56:  kbd_map[4][2] = val; return true;
			case 55:  kbd_map[4][3] = val; return true;
			case 54:  kbd_map[4][4] = val; return true;
			case 80:  kbd_map[5][0] = val; return true;
			case 79:  kbd_map[5][1] = val; return true;
			case 73:  kbd_map[5][2] = val; return true;
			case 85:  kbd_map[5][3] = val; return true;
			case 89:  kbd_map[5][4] = val; return true;
			case 13:  kbd_map[6][0] = val; return true;
			case 76:  kbd_map[6][1] = val; return true;
			case 75:  kbd_map[6][2] = val; return true;
			case 74:  kbd_map[6][3] = val; return true;
			case 72:  kbd_map[6][4] = val; return true;
			case 32:  kbd_map[7][0] = val; return true;
			case 188: kbd_map[7][1] = val; return true;
			case 190: kbd_map[7][1] = val; return true;
			case 77:  kbd_map[7][2] = val; return true;
			case 78:  kbd_map[7][3] = val; return true;
			case 66:  kbd_map[7][4] = val; return true;

			case 8:
				kbd_map[0][0] = val;
				kbd_map[4][0] = val;
				return true;
		}

		return false;
	}

	function keydown_handler(ev)
	{
		if (!ev) ev = event;

		if (update_key(ev.keyCode, -1))
		{
			if (ev.stopPropagation) ev.stopPropagation();
			if (ev.preventDefault) ev.preventDefault();
			ev.cancelBubble = true;
			return false;
		}

		return true;
	}

	function keyup_handler(ev)
	{
		if (!ev) ev = event;

		if (update_key(ev.keyCode, 2))
		{
			if (ev.stopPropagation) ev.stopPropagation();
			if (ev.preventDefault) ev.preventDefault();
			ev.cancelBubble = true;
			return false;
		}

		return true;
	}

	function read_int()
	{
		return 0xFF;
	}

	function mem_read(addr)
	{
		return addr < 0x8000 ? mem[addr] : 0xFF;
	}

	function mem_read_m1(addr)
	{
		if (addr < 0x8000) {
			return mem[addr];
		} else {
			var chr = mem[addr & 0x7FFF];

			if (chr & 0x40) {
				vid_byte = 0;
				return chr;
			}

			vid_byte = chr;
			return 0x00;
		}
	}

	function mem_write(addr, val)
	{
		if (addr>=0x4000 && addr<0x8000) mem[addr] = val;
	}

	function port_in(port)
	{
		if (port & 1) return 0xFF;

		if (vid_hsync < 0) {
			vid_hsync = ticks;
		}

		// casette = pulse (bit 7 set), refresh rate = 50Hz (bit 6 set)
		var ret = 0xFF;

		if (!(port & 0x0100)) ret &= kbd_ports[0];
		if (!(port & 0x0200)) ret &= kbd_ports[1];
		if (!(port & 0x0400)) ret &= kbd_ports[2];
		if (!(port & 0x0800)) ret &= kbd_ports[3];
		if (!(port & 0x1000)) ret &= kbd_ports[4];
		if (!(port & 0x2000)) ret &= kbd_ports[5];
		if (!(port & 0x4000)) ret &= kbd_ports[6];
		if (!(port & 0x8000)) ret &= kbd_ports[7];

		return ret;
	}

	function port_out(port, val)
	{
		if (vid_hsync >= 0)
		{
			if (ticks - vid_hsync > 207) {
				vid_tick = ticks;
				must_blit = true;
			}

			vid_cntr = 0;
			vid_hsync = -1;
		}
	}

	function process()
	{
		do
		{
			var pos = ticks - vid_tick;

			if (pos >= 207)
			{
				vid_line++;
				vid_cntr = vid_cntr + 1 & 7;
				vid_tick += 207;
			}
			else if (pos >= 16)
			{
				scr[vid_line][(pos - 16) >> 2] = vid_byte;
			}

			vid_byte = 0;
			ticks += cpu.tick();

			if (int_active)
			{
				int_active = false;
				ticks += cpu.do_int();
			}

			if (!(cpu.reg_r & 0x40)) int_active = true;
			if (vid_line >= MAX_LINE) must_blit = true;
		}
		while (!must_blit);

		ticks = (ticks - vid_tick) % 207;
		vid_tick = 0;
		vid_line = 0;
		vid_hsync = -1;
		must_blit = false;

		update_kbd();
		ptr_blit(scr);

		var now = (new Date()).valueOf();
		var delay = Math.max(MIN_DELAY, 20 - (now - start));
		start = now;

		el_pc.innerHTML = cpu.reg_pc;
		setTimeout(process, delay);
	}

	return {
		init: function(blit)
		{
			scr = [];

			for (var i = 0; i < MAX_LINE; i++)
			{
				scr[i] = [];

				for (var j = 0; j < 51; j++) {
					scr[i].push(0);
				}
			}

			mem = zx80rom;
			while (mem.length < 0x8000) mem.push(0);

			cpu = new Cpu(mem_read, mem_read_m1, mem_write, port_in, port_out, read_int);
			ptr_blit = blit;

			add_handler((is_ie ? document : window), 'keydown', keydown_handler);
			add_handler((is_ie ? document : window), 'keyup', keyup_handler);
		},

		reset: function()
		{
			cpu.reset();
		},

		load_prog: function(prog)
		{
			for (var i = 0x4000; i < 0x8000; i++) mem[i] = 0;

			cpu.set_af(0x0044);
			cpu.set_bc(0x0000);
			cpu.set_de(0x0447);
			cpu.set_hl(0x402A);
			cpu.set_ix(0xFFFF);
			cpu.set_iy(0x4000);
			cpu.set_af_(0xFFFF);
			cpu.set_bc_(0x0021);
			cpu.set_de_(0xD8F0);
			cpu.set_hl_(0xD8F0);
			cpu.reg_sp = 0x7FFE;
			cpu.reg_pc = 0x0283;
			cpu.reg_i = 0x0E;
			cpu.reg_r = 0xE8;
			cpu.reg_iff1 = 0;
			cpu.reg_iff2 = 0;
			cpu.reg_im = 1;

			mem[32766] = 174;
			mem[32767] = 63;

			for (var i = 0; i < prog.length; i++) mem[0x4000 + i] = prog[i];
		},

		loop: function()
		{
			start = (new Date()).valueOf();
			process();
		}
	};
}();

var frame = 0;

function blit(scr)
{
	frame++;
	if (frame < FRAME_SKIP) return;

	frame = 0;
	var ind = 0;

	for (var y = 0; y < 32; y++)
	{
		sy = y << 3;

		for (var x = 2; x < 50; x++)
		{
			elements[ind].backgroundPosition = '0 -' + (scr[sy][x] << 4) + 'px';
			ind++;

			scr[sy][x] = 0;
		}
	}
}

function init()
{
	viewport = document.getElementById('viewport');
	el_pc = document.getElementById('pc');

	for (var i = 0; i < 32; i++)
	{
		for (var j = 0; j < 48; j++)
		{
			var el = document.createElement('DIV');
			el.className = 'c';
			el.style.top = (i * 16) + 'px';
			el.style.left = (j * 16) + 'px';

			viewport.appendChild(el);
			elements.push(el.style);
		}
	}

	ZX8X.init(blit);
}

function reset()
{
	ZX8X.reset();
}

function load()
{
	ZX8X.load_prog(p_space);
}

function main()
{
	init();
	ZX8X.loop();
}

