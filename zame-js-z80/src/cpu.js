/*
 * zame-js-z80
 * Copyright 2010, Slava Tretyak
 */

#define REG_A      this.reg_a
#define REG_F      this.reg_f
#define REG_B      this.reg_b
#define REG_C      this.reg_c
#define REG_D      this.reg_d
#define REG_E      this.reg_e
#define REG_H      this.reg_h
#define REG_L      this.reg_l
#define REG_A_     this.reg_a_
#define REG_F_     this.reg_f_
#define REG_B_     this.reg_b_
#define REG_C_     this.reg_c_
#define REG_D_     this.reg_d_
#define REG_E_     this.reg_e_
#define REG_H_     this.reg_h_
#define REG_L_     this.reg_l_
#define REG_I      this.reg_i
#define REG_R      this.reg_r
#define REG_IFF1   this.reg_iff1
#define REG_IFF2   this.reg_iff2
#define REG_IM     this.reg_im
#define REG_IXH    this.reg_ixh
#define REG_IXL    this.reg_ixl
#define REG_IYH    this.reg_iyh
#define REG_IYL    this.reg_iyl

#define GET_SPH    (this.reg_sp >> 8)
#define GET_SPL    (this.reg_sp & 0xFF)
#define GET_PCH    (this.reg_pc >> 8)
#define GET_PCL    (this.reg_pc & 0xFF)
#define GET_MPH    (this.reg_mp >> 8)
#define GET_MPL    (this.reg_mp & 0xFF)

#define GET_AF     (this.reg_a << 8 | this.reg_f)
#define GET_BC     (this.reg_b << 8 | this.reg_c)
#define GET_DE     (this.reg_d << 8 | this.reg_e)
#define GET_HL     (this.reg_h << 8 | this.reg_l)
#define GET_AF_    (this.reg_a_ << 8 | this.reg_f_)
#define GET_BC_    (this.reg_b_ << 8 | this.reg_c_)
#define GET_DE_    (this.reg_d_ << 8 | this.reg_e_)
#define GET_HL_    (this.reg_h_ << 8 | this.reg_l_)
#define GET_IX     (this.reg_ixh << 8 | this.reg_ixl)
#define GET_IY     (this.reg_iyh << 8 | this.reg_iyl)
#define GET_SP     this.reg_sp
#define GET_PC     this.reg_pc
#define GET_MP     this.reg_mp

#define SET_AF(v)   this.set_af(v)
#define SET_BC(v)   this.set_bc(v)
#define SET_DE(v)   this.set_de(v)
#define SET_HL(v)   this.set_hl(v)
#define SET_AF_(v)  this.set_af_(v)
#define SET_BC_(v)  this.set_bc_(v)
#define SET_DE_(v)  this.set_de_(v)
#define SET_HL_(v)  this.set_hl_(v)
#define SET_IX(v)   this.set_ix(v)
#define SET_IY(v)   this.set_iy(v)
#define SET_PC(v)   this.reg_pc=v
#define SET_SP(v)   this.reg_sp=v
#define SET_MP(v)   this.reg_mp=v

#define TMP_INT8    this.tmp_int8
#define TMP_INT16   this.tmp_int16
#define TMP_INT32   this.tmp_int32
#define TMP_BYTE    this.tmp_byte
#define TMP_BYTE_B  this.tmp_byte_b
#define TMP_ADDR    this.tmp_addr
#define TMP_WORD    this.tmp_word
#define TMP_WORD_B  this.tmp_word_b
#define TMP_DWORD   this.tmp_dword

#define TSTATE_ADD(v)  this.tstate += (v)
#define PTR_WRITE(a,v) this.ptr_write(a, v)
#define PTR_READ(a)    this.ptr_read(a)
#define PTR_IN(p)      this.ptr_in(p)
#define PTR_OUT(p,v)   this.ptr_out(p, v)

#define READ_BYTE      this.read_byte
#define READ_OFFSET    this.read_offset

#define CPU_HALTED     this.is_halted
#define CPU_NOINT      this.is_noint
#define CPU_RESET_PV   this.is_reset_pv
#define CPU_PREFIX     this.prefix
#define CPU_OPTABLE    this.optable

#define CPU_CALL_FUNC(f) f.call(this)
#define DECL_FUNC        function

#define DO_READ_WORD \
	this.tmp_word = this.read_byte(); \
	this.tmp_word |= this.read_byte() << 8;

// priority '+' -> '&'
#define DO_READ_OFFSET(GET_RP) \
	this.tmp_int8 = this.read_offset(); \
	SET_MP(GET_RP + this.tmp_int8 & 0xFFFF);

// priority '+' -> '&' -> '|'
#define CPU_INC_R \
	REG_R = REG_R & 0x80 | REG_R + 1 & 0x7F;

function CONV_INT8(v) { return v > 127 ? v - 256 : v; }
function CONV_INT16(v) { return v > 32767 ? v - 65536 : v; }

#include "consts.zinc"
#include "op_common.zinc"
#include "op_pref_00.zinc"
#include "op_pref_CB.zinc"
#include "op_pref_DD.zinc"
#include "op_pref_DD_CB.zinc"
#include "op_pref_ED.zinc"
#include "op_pref_FD.zinc"
#include "op_pref_FD_CB.zinc"

function Cpu(ptr_read, ptr_read_m1, ptr_write, ptr_in, ptr_out, ptr_read_int)
{
	this.reg_a = 0;
	this.reg_f = 0;
	this.reg_b = 0;
	this.reg_c = 0;
	this.reg_d = 0;
	this.reg_e = 0;
	this.reg_h = 0;
	this.reg_l = 0;
	this.reg_a_ = 0;
	this.reg_f_ = 0;
	this.reg_b_ = 0;
	this.reg_c_ = 0;
	this.reg_d_ = 0;
	this.reg_e_ = 0;
	this.reg_h_ = 0;
	this.reg_l_ = 0;
	this.reg_i = 0;
	this.reg_r = 0;
	this.reg_iff1 = 0;
	this.reg_iff2 = 0;
	this.reg_im = 0;
	this.reg_ixh = 0;
	this.reg_ixl = 0;
	this.reg_iyh = 0;
	this.reg_iyl = 0;

	this.reg_sp = 0;
	this.reg_pc = 0;
	this.reg_mp = 0;

	this.set_af = function(v)  { this.reg_a = v >> 8; this.reg_f = v & 0xFF; }
	this.set_bc = function(v)  { this.reg_b = v >> 8; this.reg_c = v & 0xFF; }
	this.set_de = function(v)  { this.reg_d = v >> 8; this.reg_e = v & 0xFF; }
	this.set_hl = function(v)  { this.reg_h = v >> 8; this.reg_l = v & 0xFF; }
	this.set_af_ = function(v) { this.reg_a_ = v >> 8; this.reg_f_ = v & 0xFF; }
	this.set_bc_ = function(v) { this.reg_b_ = v >> 8; this.reg_c_ = v & 0xFF; }
	this.set_de_ = function(v) { this.reg_d_ = v >> 8; this.reg_e_ = v & 0xFF; }
	this.set_hl_ = function(v) { this.reg_h_ = v >> 8; this.reg_l_ = v & 0xFF; }
	this.set_ix = function(v)  { this.reg_ixh = v >> 8; this.reg_ixl = v & 0xFF; }
	this.set_iy = function(v)  { this.reg_iyh = v >> 8; this.reg_iyl = v & 0xFF; }

	this.is_halted = false;
	this.is_opcode = false;
	this.is_noint = false;
	this.is_reset_pv = false;
	this.is_read_int = false

	this.ptr_read = ptr_read;			// (word addr)
	this.ptr_read_m1 = ptr_read_m1;		// (word addr)
	this.ptr_write = ptr_write;			// (word addr, byte val)
	this.ptr_in = ptr_in;				// (word port)
	this.ptr_out = ptr_out;				// (word port, byte val)
	this.ptr_read_int = ptr_read_int;	// ()

	this.tick = null;
	this.optable = null;
	this.prefix = 0;
	this.tstate = 0;

	this.tmp_int8 = 0;
	this.tmp_int16 = 0;
	this.tmp_int32 = 0;
	this.tmp_byte = 0;
	this.tmp_byte_b = 0;
	this.tmp_addr = 0;
	this.tmp_word = 0;
	this.tmp_word_b = 0;
	this.tmp_dword = 0;

	this.read_byte = function()
	{
		if (this.is_read_int) return this.ptr_read_int();

		var ret = this.ptr_read(GET_PC);
		SET_PC(GET_PC + 1 & 0xFFFF);

		return ret;
	}

	this.read_offset = function()
	{
		var off = this.read_byte();
		return off > 127 ? off - 256 : off;
	}

	this.reset = function()
	{
		REG_I = 0;
		REG_R = 0;
		REG_IFF1 = 0;
		REG_IFF2 = 0;
		REG_IM = 0;
		SET_PC(0);
		SET_MP(0);

		SET_AF(0xFFFF);
		SET_SP(0xFFFF);

		// really all others registers may has any value
		SET_BC(0xFFFF);
		SET_DE(0xFFFF);
		SET_HL(0xFFFF);
		SET_AF_(0xFFFF);
		SET_BC_(0xFFFF);
		SET_DE_(0xFFFF);
		SET_HL_(0xFFFF);
		SET_IX(0xFFFF);
		SET_IY(0xFFFF);

		this.is_halted = false;
		this.is_opcode = false;
		this.is_noint = false;
		this.is_reset_pv = false;
		this.is_read_int = false;

		this.tick = Cpu.tick_def;
		this.optable = optable_00;
		this.prefix = 0;
		this.tstate = 0;
	}

	this.do_int = function()
	{
		if (!REG_IFF1 || this.is_noint || this.is_opcode || this.prefix) return 0;

		if (this.is_halted)
		{
			SET_PC(GET_PC + 1 & 0xFFFF);
			this.is_halted = false;
		}

		REG_IFF1 = 0;
		REG_IFF2 = 0;

		if (this.is_reset_pv)
		{
			REG_F &= ~FLAG_PV;
			this.is_reset_pv = false;
		}

		this.is_opcode = true;
		this.tstate = 0;

		switch (REG_IM)
		{
			case 0:
			{
				this.is_read_int = true;
				Cpu.tick_int.call(this);	// tstate changed in this function

				if (this.prefix) this.tick = Cpu.tick_int;
			}
			break;

			case 1:
			{
				CPU_INC_R;
				this.tstate += 6;				// (4 + 2)
				optable_00[0xFF].call(this);	// RST #38
			}
			break;

			case 2:
			{
				CPU_INC_R;
				var vec = this.ptr_read_int();
				var addr = REG_I << 8 | vec;

				SET_SP(GET_SP - 1 & 0xFFFF); this.ptr_write(GET_SP, GET_PCH);
				SET_SP(GET_SP - 1 & 0xFFFF); this.ptr_write(GET_SP, GET_PCL);

				var tmp = this.ptr_read(addr);
				SET_PC(this.ptr_read(addr + 1 & 0xFFFF) << 8 | tmp);

				SET_MP(GET_PC);
				this.tstate += 19;
			}
			break;
		}

		this.is_opcode = false;
		return this.tstate;
	}

	this.do_nmi = function()
	{
		if (this.is_noint || this.is_opcode || this.prefix) return 0;

		if (this.is_halted)
		{
			SET_PC(GET_PC + 1 & 0xFFFF);
			this.is_halted = false;
		}

		this.is_opcode = true;
		CPU_INC_R;
		REG_IFF1 = 0;

		SET_SP(GET_SP - 1 & 0xFFFF); this.ptr_write(GET_SP, GET_PCH);
		SET_SP(GET_SP - 1 & 0xFFFF); this.ptr_write(GET_SP, GET_PCL);

		SET_PC(0x0066);
		SET_MP(0x0066);		// SET_MP(GET_PC)
		this.is_opcode = false;

		return 11;
	}

	this.is_int_possible = function()
	{
		return (REG_IFF1 && !this.is_noint && !this.is_opcode && !this.prefix);
	}

	this.is_nmi_possible = function()
	{
		return (!this.is_noint && !this.is_opcode && !this.prefix);
	}

	Cpu.init_tables();
	this.reset();
}

Cpu.is_tbl_initialized = false;
Cpu.tbl_parity = [];	// [0x100]

Cpu.init_tables = function()
{
	if (Cpu.is_tbl_initialized) return;

	for (var i = 0; i < 0x100; i++)
	{
		var p = ((i & 0x80) >> 7) ^ ((i & 0x40) >> 6) ^ ((i & 0x20) >> 5) ^ ((i & 0x10) >> 4) ^ ((i & 0x08) >> 3) ^ ((i & 0x04) >> 2) ^ ((i & 0x02) >> 1) ^ (i & 0x01);
		Cpu.tbl_parity.push(p ? 0 : FLAG_PV);
	}

	Cpu.is_tbl_initialized = true;
}

Cpu.tick_def = function()
{
	this.is_opcode = true;
	this.is_noint = false;
	this.is_reset_pv = false;
	this.tstate = 4;

	var op = this.ptr_read_m1(GET_PC);
	SET_PC(GET_PC + 1 & 0xFFFF);
	CPU_INC_R;

	this.optable[op].call(this);
	this.is_opcode = false;

	return this.tstate;
}

Cpu.tick_int = function()
{
	this.is_opcode = true;
	this.is_noint = false;
	this.is_reset_pv = false;
	this.tstate = 6;	// (4 + 2)

	var op = this.ptr_read_int();
	CPU_INC_R;

	this.optable[op].call(this);
	this.is_opcode = false;

	if (this.prefix) {
		this.is_noint = true;
	} else {
		this.tick = Cpu.tick_def;
		this.is_read_int = false;
	}

	return this.tstate;
}
