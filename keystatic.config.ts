import { config, fields, collection } from '@keystatic/core';

const dataWilayah: Record<string, string[]> = {
  'Kalimantan Barat': ['Kota Pontianak', 'Kota Singkawang', 'Kab. Sambas', 'Kab. Mempawah', 'Kab. Sanggau', 'Kab. Ketapang', 'Kab. Sintang', 'Kab. Kapuas Hulu', 'Kab. Sekadau', 'Kab. Melawi', 'Kab. Kayong Utara', 'Kab. Kubu Raya', 'Kab. Bengkayang', 'Kab. Landak'],
  'Kalimantan Tengah': ['Kota Palangka Raya', 'Kab. Kotawaringin Barat', 'Kab. Kotawaringin Timur', 'Kab. Kapuas', 'Kab. Barito Selatan', 'Kab. Barito Utara', 'Kab. Sukamara', 'Kab. Lamandau', 'Kab. Seruyan', 'Kab. Katingan', 'Kab. Pulang Pisau', 'Kab. Gunung Mas', 'Kab. Barito Timur', 'Kab. Murung Raya'],
  'Kalimantan Selatan': ['Kota Banjarmasin', 'Kota Banjarbaru', 'Kab. Tanah Laut', 'Kab. Kotabaru', 'Kab. Banjar', 'Kab. Barito Kuala', 'Kab. Tapin', 'Kab. Hulu Sungai Selatan', 'Kab. Hulu Sungai Tengah', 'Kab. Hulu Sungai Utara', 'Kab. Tabalong', 'Kab. Tanah Bumbu', 'Kab. Balangan'],
  'Kalimantan Timur': ['Kota Samarinda', 'Kota Balikpapan', 'Kota Bontang', 'Kab. Paser', 'Kab. Kutai Kartanegara', 'Kab. Berau', 'Kab. Kutai Barat', 'Kab. Kutai Timur', 'Kab. Penajam Paser Utara', 'Kab. Mahakam Ulu'],
  'Kalimantan Utara': ['Kota Tarakan', 'Kab. Bulungan', 'Kab. Malinau', 'Kab. Nunukan', 'Kab. Tana Tidung'],

  'Sulawesi Utara': ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kota Kotamobagu', 'Kab. Bolaang Mongondow', 'Kab. Minahasa', 'Kab. Kepulauan Sangihe', 'Kab. Kepulauan Talaud', 'Kab. Minahasa Selatan', 'Kab. Minahasa Utara', 'Kab. Bolaang Mongondow Utara', 'Kab. Siau Tagulandang Biaro', 'Kab. Minahasa Tenggara', 'Kab. Bolaang Mongondow Selatan', 'Kab. Bolaang Mongondow Timur'],
  'Gorontalo': ['Kota Gorontalo', 'Kab. Boalemo', 'Kab. Gorontalo', 'Kab. Pohuwato', 'Kab. Bone Bolango', 'Kab. Gorontalo Utara'],
  'Sulawesi Tengah': ['Kota Palu', 'Kab. Banggai', 'Kab. Poso', 'Kab. Donggala', 'Kab. Toli-Toli', 'Kab. Buol', 'Kab. Morowali', 'Kab. Banggai Kepulauan', 'Kab. Parigi Moutong', 'Kab. Tojo Una-Una', 'Kab. Sigi', 'Kab. Banggai Laut', 'Kab. Morowali Utara'],
  'Sulawesi Barat': ['Kab. Majene', 'Kab. Polewali Mandar', 'Kab. Mamasa', 'Kab. Mamuju', 'Kab. Mamuju Tengah', 'Kab. Pasangkayu'],
  'Sulawesi Selatan': ['Kota Makassar', 'Kota Parepare', 'Kota Palopo', 'Kab. Kepulauan Selayar', 'Kab. Bulukumba', 'Kab. Bantaeng', 'Kab. Jeneponto', 'Kab. Takalar', 'Kab. Gowa', 'Kab. Sinjai', 'Kab. Maros', 'Kab. Pangkajene dan Kepulauan', 'Kab. Barru', 'Kab. Bone', 'Kab. Soppeng', 'Kab. Wajo', 'Kab. Sidenreng Rappang', 'Kab. Pinrang', 'Kab. Enrekang', 'Kab. Luwu', 'Kab. Tana Toraja', 'Kab. Luwu Utara', 'Kab. Luwu Timur', 'Kab. Toraja Utara'],
  'Sulawesi Tenggara': ['Kota Kendari', 'Kota Baubau', 'Kab. Buton', 'Kab. Muna', 'Kab. Konawe', 'Kab. Kolaka', 'Kab. Konawe Selatan', 'Kab. Bombana', 'Kab. Wakatobi', 'Kab. Kolaka Utara', 'Kab. Buton Utara', 'Kab. Konawe Utara', 'Kab. Kolaka Timur', 'Kab. Konawe Kepulauan', 'Kab. Muna Barat', 'Kab. Buton Tengah', 'Kab. Buton Selatan'],

  'Maluku': ['Kota Ambon', 'Kota Tual', 'Kab. Maluku Tengah', 'Kab. Maluku Tenggara', 'Kab. Kepulauan Tanimbar', 'Kab. Buru', 'Kab. Seram Bagian Timur', 'Kab. Seram Bagian Barat', 'Kab. Kepulauan Aru', 'Kab. Maluku Barat Daya', 'Kab. Buru Selatan'],
  'Maluku Utara': ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kab. Halmahera Barat', 'Kab. Halmahera Tengah', 'Kab. Halmahera Utara', 'Kab. Halmahera Selatan', 'Kab. Kepulauan Sula', 'Kab. Halmahera Timur', 'Kab. Pulau Morotai', 'Kab. Pulau Taliabu'],

  'Nusa Tenggara Barat': ['Kota Mataram', 'Kota Bima', 'Kab. Lombok Barat', 'Kab. Lombok Tengah', 'Kab. Lombok Timur', 'Kab. Sumbawa', 'Kab. Dompu', 'Kab. Bima', 'Kab. Sumbawa Barat', 'Kab. Lombok Utara'],
  'Nusa Tenggara Timur': ['Kota Kupang', 'Kab. Kupang', 'Kab. Timor Tengah Selatan', 'Kab. Timor Tengah Utara', 'Kab. Belu', 'Kab. Alor', 'Kab. Flores Timur', 'Kab. Sikka', 'Kab. Ende', 'Kab. Ngada', 'Kab. Manggarai', 'Kab. Sumba Timur', 'Kab. Sumba Barat', 'Kab. Lembata', 'Kab. Rote Ndao', 'Kab. Manggarai Barat', 'Kab. Sumba Tengah', 'Kab. Sumba Barat Daya', 'Kab. Nagekeo', 'Kab. Manggarai Timur', 'Kab. Sabu Raijua', 'Kab. Malaka'],

  'Papua': ['Kota Jayapura', 'Kab. Jayapura', 'Kab. Keerom', 'Kab. Sarmi', 'Kab. Mamberamo Raya', 'Kab. Biak Numfor', 'Kab. Supiori', 'Kab. Kepulauan Yapen', 'Kab. Waropen'],
  'Papua Barat': ['Kab. Manokwari', 'Kab. Pegunungan Arfak', 'Kab. Manokwari Selatan', 'Kab. Teluk Bintuni', 'Kab. Teluk Wondama', 'Kab. Fakfak', 'Kab. Kaimana'],
  'Papua Tengah': ['Kab. Nabire', 'Kab. Puncak Jaya', 'Kab. Paniai', 'Kab. Mimika', 'Kab. Puncak', 'Kab. Dogiyai', 'Kab. Intan Jaya', 'Kab. Deiyai'],
  'Papua Pegunungan': ['Kab. Jayawijaya', 'Kab. Pegunungan Bintang', 'Kab. Yahukimo', 'Kab. Tolikara', 'Kab. Mamberamo Tengah', 'Kab. Yalimo', 'Kab. Lanny Jaya', 'Kab. Nduga'],
  'Papua Selatan': ['Kab. Merauke', 'Kab. Boven Digoel', 'Kab. Mappi', 'Kab. Asmat'],
  'Papua Barat Daya': ['Kota Sorong', 'Kab. Sorong', 'Kab. Sorong Selatan', 'Kab. Raja Ampat', 'Kab. Tambrauw', 'Kab. Maybrat'],
};

// 1. Opsi Provinsi (Berlaku umum)
const provOptions = [{ label: '-- Tidak Ada / Kosong --', value: '-' }];
Object.keys(dataWilayah).forEach(prov => {
  provOptions.push({ label: prov, value: prov });
});

// 2. Fungsi pembuat cabang Daerah
function buatCabangDaerah(labelDaerah: string) {
  const branches: Record<string, any> = {
    '-': fields.select({
      label: labelDaerah,
      options: [{ label: '-- Menunggu Provinsi --', value: '-' }],
      defaultValue: '-'
    })
  };

  Object.keys(dataWilayah).forEach(prov => {
    branches[prov] = fields.select({
      label: labelDaerah,
      options: dataWilayah[prov].map(kab => ({ label: kab, value: kab })),
      defaultValue: dataWilayah[prov][0]
    });
  });

  return branches;
}

const daerahBranches1 = buatCabangDaerah('Daerah 1');
const daerahBranches2 = buatCabangDaerah('Daerah 2 (Opsional)');
const daerahBranches3 = buatCabangDaerah('Daerah 3 (Opsional)');

const isLocal = process.env.NODE_ENV === 'development';

export default config({
  storage: isLocal
    ? { kind: 'local' }
    : { kind: 'github', repo: 'damarjatimumpuni/portal-arsip-topobad' },
  collections: {
    arsip: collection({
      label: 'Dokumen Arsip',
      slugField: 'title',
      path: 'src/content/arsip/*',
      format: { data: 'json' },
      schema: {
        kategori_dokumen: fields.conditional(
          fields.select({
            label: 'Jenis Dokumen',
            options: [
              { label: '1. Undangan', value: 'undangan' },
              { label: '2. Surat Tugas', value: 'surat_tugas' },
              { label: '3. Berkas Rapat', value: 'berkas_rapat' },
              { label: '4. Berkas Perjadin', value: 'berkas_perjadin' },
              { label: '5. Berita Acara / Notulensi', value: 'ba_notulen' },
              { label: '6. Laporan', value: 'laporan' },
              { label: '7. Ranpermendagri', value: 'ranpermendagri' },
            ],
            defaultValue: 'undangan',
          }),
          {
            undangan: fields.object({
              no_surat: fields.text({ label: 'No. Surat' }),
              asal_instansi: fields.text({ label: 'Asal Instansi' }),
              tanggal_surat: fields.date({ label: 'Tanggal Surat' }),
              uraian: fields.text({ label: 'Perihal / Uraian Isi', multiline: true }),
            }),
            surat_tugas: fields.object({
              no_surat: fields.text({ label: 'No. Surat Tugas' }),
              tanggal: fields.date({ label: 'Tanggal Tugas' }),
              isi_tugas: fields.text({ label: 'Isi Tugas', multiline: true }),
            }),
            berkas_rapat: fields.object({
              jenis_rapat: fields.select({ label: 'Jenis Rapat', options: [{ label: 'RDK', value: 'RDK' }, { label: 'Fullday', value: 'Fullday' }, { label: 'Full board', value: 'Full board' }], defaultValue: 'RDK' }),
              tanggal_rapat: fields.date({ label: 'Tanggal Rapat' }),
              no_nota_dinas: fields.text({ label: 'No. Nota Dinas Verifikasi' }),
              uraian: fields.text({ label: 'Uraian Singkat', multiline: true }),
            }),
            berkas_perjadin: fields.object({
              tujuan: fields.text({ label: 'Tujuan Perjadin' }),
              no_surat_tugas: fields.text({ label: 'No. Surat Tugas' }),
              tanggal_perjadin: fields.date({ label: 'Tanggal Perjadin' }),
            }),
            ba_notulen: fields.object({
              no_ba: fields.text({ label: 'No. BA / Notulen', description: 'Ketik manual (misal: 01/BAD II/V/2026)' }),
              tanggal: fields.date({ label: 'Tanggal' }),

              // --- INI LOGIKA BARU UNTUK BERITA ACARA ---
              jenis_kegiatan: fields.conditional(
                fields.select({
                  label: 'Kegiatan Berita Acara',
                  options: [
                    { label: '1. Batas Daerah', value: 'batas_daerah' },
                    { label: '2. Batas Kewenangan Pengelolaan SDA di Laut', value: 'batas_laut' },
                    { label: '3. Penyusunan Produk Hukum Non Batas Daerah', value: 'non_batas' },
                  ],
                  defaultValue: 'batas_daerah',
                }),
                {
                  // Jika Batas Daerah -> Muncul Combo Prov & Kab
                  batas_daerah: fields.object({
                    prov_daerah_1: fields.conditional(fields.select({ label: 'Pilih Provinsi 1', options: provOptions, defaultValue: '-' }), daerahBranches1),
                    prov_daerah_2: fields.conditional(fields.select({ label: 'Pilih Provinsi 2 (Opsional)', options: provOptions, defaultValue: '-' }), daerahBranches2),
                    prov_daerah_3: fields.conditional(fields.select({ label: 'Pilih Provinsi 3 (Opsional)', options: provOptions, defaultValue: '-' }), daerahBranches3),
                  }),
                  // Jika Batas Laut -> Muncul Prov saja
                  batas_laut: fields.object({
                    prov_1: fields.select({ label: 'Pilih Provinsi 1', options: provOptions, defaultValue: '-' }),
                    prov_2: fields.select({ label: 'Pilih Provinsi 2 (Opsional)', options: provOptions, defaultValue: '-' }),
                    prov_3: fields.select({ label: 'Pilih Provinsi 3 (Opsional)', options: provOptions, defaultValue: '-' }),
                  }),
                  // Jika Non Batas -> Kosong (Tidak ada field tambahan)
                  non_batas: fields.empty(),
                }
              ),
              // -------------------------------------------

            }),
            laporan: fields.object({
              tanggal: fields.date({ label: 'Tanggal Laporan' }),
              uraian: fields.text({ label: 'Uraian Singkat', multiline: true }),
            }),
            ranpermendagri: fields.object({
              prov_daerah_1: fields.conditional(fields.select({ label: 'Pilih Provinsi 1', options: provOptions, defaultValue: '-' }), daerahBranches1),
              prov_daerah_2: fields.conditional(fields.select({ label: 'Pilih Provinsi 2 (Opsional)', options: provOptions, defaultValue: '-' }), daerahBranches2),
              prov_daerah_3: fields.conditional(fields.select({ label: 'Pilih Provinsi 3 (Opsional)', options: provOptions, defaultValue: '-' }), daerahBranches3),
            }),
          }
        ),

        title: fields.slug({ name: { label: 'Isian Singkat', description: 'Ringkasan isi berkas' } }),
        tanggal_upload: fields.date({ label: 'Tanggal Upload', defaultValue: { kind: 'today' } }),
        tautan_utama: fields.url({ label: 'Tautan GDrive (Berkas Utama)' }),
        tautan_lampiran: fields.url({ label: 'Tautan Lampiran (Opsional)' }),
      },
    }),
  },
});
