// Tes aturan status kabar (server menentukan status, bukan klien).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tafsirkanKabar } from '../src/services/kabar.service.js';

const nama = 'Oma Siti';
const tafsir = (k) => tafsirkanKabar({ nama, ...k });

test('tombol Saya Aman = HIJAU', () => {
  assert.equal(tafsir({ tipeInput: 'TOMBOL_AMAN' }).statusBahaya, 'HIJAU');
});

test('tombol Darurat = MERAH', () => {
  assert.equal(tafsir({ tipeInput: 'TOMBOL_DARURAT' }).statusBahaya, 'MERAH');
});

test('keluhan ringan = KUNING, keluhan gawat = MERAH, sudah obat = HIJAU', () => {
  assert.equal(tafsir({ tipeInput: 'KELUHAN', keluhan: ['PUSING'] }).statusBahaya, 'KUNING');
  assert.equal(tafsir({ tipeInput: 'KELUHAN', keluhan: ['PUSING', 'KEJANG'] }).statusBahaya, 'MERAH');
  assert.equal(tafsir({ tipeInput: 'KELUHAN', keluhan: ['SUDAH_OBAT'] }).statusBahaya, 'HIJAU');
});

test('keluhan tidak valid atau terlalu banyak ditolak', () => {
  assert.throws(() => tafsir({ tipeInput: 'KELUHAN', keluhan: [] }), /Pilih 1 sampai 6/);
  assert.throws(() => tafsir({ tipeInput: 'KELUHAN', keluhan: ['NGAWUR'] }), /Pilih 1 sampai 6/);
  assert.throws(() => tafsir({ tipeInput: 'KELUHAN' }), /Pilih 1 sampai 6/);
});

test('deteksi otomatis = MERAH; sebab tak dikenal ditolak', () => {
  assert.equal(tafsir({ tipeInput: 'DETEKSI_OTOMATIS', sebab: 'KEJANG' }).statusBahaya, 'MERAH');
  assert.throws(() => tafsir({ tipeInput: 'DETEKSI_OTOMATIS', sebab: 'LAIN' }), /KEJANG atau JATUH/);
});

test('tipeInput tidak dikenal ditolak', () => {
  assert.throws(() => tafsir({ tipeInput: 'HACK' }), /tidak dikenal/);
});
