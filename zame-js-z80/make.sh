#!/bin/bash

cpp src/cpu.js > out/z80.pp.js
ruby post-process.rb out/z80.pp.js > out/z80.js
rm out/z80.pp.js
