import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const arsipCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/arsip" }),

  schema: z.object({
    title: z.string().optional(),
    tanggal_upload: z.string().optional(),

    // Keystatic menyimpan form dinamis (conditional) dalam bentuk objek:
    // { discriminant: 'nama_kategori', value: { field1: '..', field2: '..' } }
    kategori_dokumen: z.object({
      discriminant: z.string(),
      value: z.record(z.any()) // Mengizinkan isian dinamis di dalamnya
    }).optional(),

    tautan_utama: z.string().optional(),
    tautan_lampiran: z.string().optional().nullable(),
  })
});

export const collections = {
  'arsip': arsipCollection,
};
