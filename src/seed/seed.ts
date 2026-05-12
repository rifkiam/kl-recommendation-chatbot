import dotenv from "dotenv";
import { chroma } from "../chroma/client";
import { KB_COLLECTION_NAME } from "../chroma/collection";
import { kbEmbeddingFunction } from "../chroma/embeddings";

dotenv.config();

async function seed() {
  try {
    await chroma.deleteCollection({ name: KB_COLLECTION_NAME });
  } catch {
    // Collection may not exist yet
  }

  const collection = await chroma.getOrCreateCollection({
    name: KB_COLLECTION_NAME,
    embeddingFunction: kbEmbeddingFunction,
  });

  const metadatas = [
    {
      name: "Label Paper White",
      pros: "Tampilan kesan natural; Untuk menonjolkan kesan crafted, eksklusif, & premium; Permukaan bisa ditulis",
      for: "Produk yang butuh dirobek; Produk yang bisa ditulis atau dicoret-coret"
    },
    {
      name: "Label Pearlized",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Label dengan efek mutiara yang sangat tipis/subtle; Warna dasarnya putih namun sedikit memantulkan cahaya",
      for: "Produk yang sering terpapar suhu dingin (es), air, dan sinar matahari; Biasanya untuk produk body care/kosmetik"
    },
    {
      name: "Label Synthetic Paper",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Tekstur seperti kertas namun lebih halus sehingga bisa ditulis dengan pena",
      for: "Produk yang sering terpapar suhu dingin (es), air, minyak, dan sinar matahari"
    },
    {
      name: "Label Film Transparent",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Bisa menampilkan isi produk; Terbuat dari plastik dan tidak mudah robek",
      for: "Brand yang ingin menampilkan isi produk dalam kemasan"
    },
    {
      name: "Label Clear on Clear",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Terlihat menyatu dengan media tempel seperti print langsung di kemasan; Menggunakan material sangat jernih sehingga cocok untuk kemasan bright dan bening",
      for: "User yang menginginkan non-label look/clarity; Produk yang sering terpapar suhu dingin (es), air, minyak, dan sinar matahari"
    },
    {
      name: "Label Film Silver",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Belum banyak kompetitor yang menggunakan bahan ini; Bisa diprint dengan warna lain; Hasil metallic dan mencolok untuk highlight desain; Sudah mengandung foil sehingga tidak perlu press foil satu per satu",
      for: "Produk yang sering terpapar suhu dingin (es), air, minyak, dan sinar matahari"
    },
    {
      name: "Label Film White",
      pros: "Tahan panas; Tahan dingin hingga suhu -20 derajat; Tidak menyerap minyak; Tidak mudah robek karena berbahan dasar plastik; Warna hasil cetak lebih cerah",
      for: "Produk yang sering terpapar suhu dingin (es), air, minyak, dan sinar matahari"
    }
  ];

  await collection.add({
    ids: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7"
    ],
    metadatas: metadatas,
    documents: [
      "Label Paper White memiliki tampilan natural dan premium dengan permukaan yang bisa ditulis. Cocok untuk produk yang perlu dirobek atau dicoret.",
      "Label Pearlized tahan panas, dingin, minyak, dan air dengan efek mutiara subtle. Cocok untuk body care dan kosmetik.",
      "Label Synthetic Paper tahan panas, dingin, minyak, dan air dengan tekstur seperti kertas yang bisa ditulis menggunakan pena.",
      "Label Film Transparent transparan dan tahan lama sehingga cocok untuk menampilkan isi produk dalam kemasan.",
      "Label Clear on Clear memberikan efek non-label look dan tampak menyatu dengan kemasan transparan atau bright.",
      "Label Film Silver memiliki efek metallic mencolok dengan bahan foil bawaan yang cocok untuk highlight desain produk.",
      "Label Film White menghasilkan warna cetak lebih cerah dan tahan terhadap panas, dingin, minyak, dan air."
    ]
  });

  console.log("Seeding complete");
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
