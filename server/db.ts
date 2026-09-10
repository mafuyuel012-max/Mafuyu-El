import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  WebsiteSettings,
  Category,
  Post,
  MediaItem,
  Announcement,
  GraduationAnnouncement,
  GraduationStudent,
  DownloadItem,
  GalleryItem,
  ActivityLog,
  MenuItem,
} from '../src/types.js';

export interface DatabaseSchema {
  users: User[];
  user_credentials: { user_id: string; password_hash: string }[];
  settings: WebsiteSettings;
  categories: Category[];
  posts: Post[];
  media: MediaItem[];
  announcements: Announcement[];
  graduation_announcements: GraduationAnnouncement[];
  graduation_students: GraduationStudent[];
  downloads: DownloadItem[];
  gallery: GalleryItem[];
  activity_logs: ActivityLog[];
  menus: MenuItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSchema | null = null;

export function getInitialSettings(): WebsiteSettings {
  return {
    school_name: 'SD Negeri 53 Kota Bengkulu',
    school_short_name: 'SDN 53 Bengkulu',
    tagline: 'Membentuk Generasi Berkarakter, Unggul, Religius, dan Berwawasan Lingkungan',
    description: 'SD Negeri 53 Kota Bengkulu adalah sekolah dasar negeri unggulan yang berkomitmen mewujudkan pendidikan berkualitas, berakhlak mulia, dan berprestasi di Kota Bengkulu.',
    npsn: '10702672',
    akreditasi: 'A (Unggul)',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80',
    favicon: '/favicon.ico',
    background_type: 'none',
    background_value: '#f8fafc',
    background_opacity: 100,
    background_pattern: 'grid',
    background_repeat: 'cover',
    background_attachment: 'scroll',
    background_overlay_color: '#ffffff',
    background_blur: 0,
    primary_color: '#0284c7', // Sky-600
    secondary_color: '#0d9488', // Teal-600
    address: 'Jl. Merapi Raya No. 53, Kebun Tebeng, Kec. Ratu Agung, Kota Bengkulu, Bengkulu 38227',
    email: 'sdn53kotabengkulu@kemdikbud.go.id',
    phone: '(0736) 21543',
    whatsapp: '081273565353',
    facebook: 'https://facebook.com/sdn53bengkulu',
    instagram: 'https://instagram.com/sdn53_bengkulu',
    youtube: 'https://youtube.com/@sdn53kotabengkulu',
    tiktok: 'https://tiktok.com/@sdn53bengkulu',
    maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.890637084534!2d102.2858163!3d-3.8115599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e36b01438902521%3A0x4a36b3281045a556!2sKota%20Bengkulu!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid',
    copyright: 'Â© 2026 SD Negeri 53 Kota Bengkulu. Seluruh Hak Cipta Dilindungi.',
    kepala_sekolah_nama: 'Hj. Rosdiana, S.Pd., M.Pd.',
    kepala_sekolah_sambutan: 'Assalamuâ€™alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di website resmi SD Negeri 53 Kota Bengkulu. Portal publikasi ini kami hadirkan sebagai jembatan komunikasi, transparansi informasi, serta wadah apresiasi prestasi keluarga besar sekolah kami. Kami berkomitmen menyelenggarakan pendidikan dasar yang ramah anak, berlandaskan iman dan takwa, serta adaptif terhadap perkembangan teknologi abad ke-21.\n\nSemoga website ini memberikan manfaat seluas-luasnya bagi siswa, pendidik, orang tua, serta masyarakat umum. Mari bersama melangkah menuju masa depan gemilang!',
    kepala_sekolah_foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    sejarah: 'SD Negeri 53 Kota Bengkulu didirikan pada tahun 1982 sebagai upaya pemerintah dalam memenuhi kebutuhan sarana pendidikan dasar bagi masyarakat di wilayah Ratu Agung dan sekitarnya. Sejak awal berdirinya, sekolah ini terus berbenah secara fisik maupun mutu akademis. Dengan dedikasi para pendidik dan dukungan masyarakat, SDN 53 berhasil meraih akreditasi A dan menjadi salah satu sekolah percontohan Sekolah Ramah Anak dan Adiwiyata di Kota Bengkulu.',
    visi: 'Terwujudnya Peserta Didik yang Beriman, Bertaqwa, Berkarakter Pancasila, Berprestasi Unggul, dan Berbudaya Lingkungan.',
    misi: [
      'Menanamkan nilai-nilai keagamaan, toleransi, dan budi pekerti luhur dalam kehidupan sehari-hari.',
      'Melaksanakan pembelajaran aktif, inovatif, kreatif, dan menyenangkan berpusat pada peserta didik.',
      'Mengembangkan minat, bakat, dan potensi siswa melalui program ekstrakurikuler yang terarah.',
      'Mewujudkan lingkungan sekolah yang bersih, asri, sehat, aman, dan berwawasan pelestarian lingkungan hidup (Adiwiyata).',
      'Meningkatkan kompetensi tenaga pendidik dan kependidikan sejalan dengan transformasi kurikulum nasional.',
      'Membangun sinergi harmonis antara sekolah, komite, orang tua siswa, dan masyarakat.'
    ],
    tujuan: [
      'Menghasilkan lulusan yang menguasai literasi, numerasi, dan berakhlak mulia.',
      'Meraih kejuaraan di bidang akademis (OSN), seni budaya (FLS2N), dan olahraga (O2SN) tingkat kota hingga nasional.',
      'Menerapkan literasi digital secara cerdas dan bertanggung jawab bagi warga sekolah.'
    ],
    struktur_organisasi: 'Kepala Sekolah: Hj. Rosdiana, S.Pd., M.Pd.\nKomite Sekolah: Drs. M. Yusuf\nKoordinator Kurikulum: Ahmad Fauzi, S.Pd.\nKoordinator Kesiswaan: Sri Wahyuni, S.Pd.\nBendahara: Siti Rahma, S.Pd.\nKepala Perpustakaan: Eka Pratiwi, S.Pd.',
    sarana_prasarana: [
      'Gedung Belajar Modern 18 Ruang Kelas Ber-AC & Proyektor',
      'Laboratorium Komputer Multimedia & Pembelajaran Digital',
      'Perpustakaan Ramah Anak "Buku Jendela Dunia"',
      'Lapangan Olahraga Serbaguna (Basket, Futsal, Voli, Badminton)',
      'Musholla Sekolah "Al-Ikhlas"',
      'Unit Kesehatan Sekolah (UKS) Terstandar',
      'Kantin Sehat dan Ramah Lingkungan',
      'Taman Belajar Hijau dan Apotek Hidup'
    ],
    program_unggulan: [
      'Program Tahfidz Juz 30 dan Sholat Dhuha Berjamaah',
      'Kelas Literasi dan Sudut Baca Kelas',
      'Pembelajaran Digital Interaktif Berbasis Chromebook',
      'Sekolah Adiwiyata & Bank Sampah Edukatif',
      'Bimbingan Intensif Olimpiade Sains & Matematika'
    ],
    ekstrakurikuler: [
      'Pramuka Siaga & Penggalang (Wajib)',
      'Seni Tari Tradisional Bengkulu',
      'Drumband "Gita Ceria 53"',
      'Pencak Silat & Karate',
      'Paduan Suara & Musik Daerah',
      'Futsal & Bulutangkis',
      'Klub Bahasa Inggris Cilik'
    ],
    hero_title: 'Membangun Karakter & Mengukir Prestasi',
    hero_subtitle: 'Selamat Datang di Portal Resmi SD Negeri 53 Kota Bengkulu. Sarana Edukasi, Publikasi Prestasi, dan Keterbukaan Informasi Sekolah Terpadu.',
    hero_button_text: 'Jelajahi Profil Sekolah',
    hero_button_link: '/profil',
    hero_image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
  };
}

export function initializeDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      dbInstance = parsed;
      return parsed;
    } catch (err) {
      console.error('Failed to parse db.json, generating default database:', err);
    }
  }

  // Generate Default Seed Data
  const defaultSalt = bcrypt.genSaltSync(10);
  const superAdminId = 'user-superadmin-01';
  const adminId = 'user-admin-02';
  const editorId = 'user-editor-03';

  const defaultUsers: User[] = [
    {
      id: superAdminId,
      username: 'admin',
      name: 'Super Administrator',
      email: 'admin@sdn53bengkulu.sch.id',
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    },
    {
      id: adminId,
      username: 'operator',
      name: 'Operator Sekolah',
      email: 'operator@sdn53bengkulu.sch.id',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    },
    {
      id: editorId,
      username: 'guru_editor',
      name: 'Budi Santoso, S.Pd. (Editor)',
      email: 'budi@sdn53bengkulu.sch.id',
      role: 'editor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    },
  ];

  const defaultCredentials = [
    { user_id: superAdminId, password_hash: bcrypt.hashSync('admin123', defaultSalt) },
    { user_id: adminId, password_hash: bcrypt.hashSync('operator123', defaultSalt) },
    { user_id: editorId, password_hash: bcrypt.hashSync('editor123', defaultSalt) },
  ];

  const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Akademik', slug: 'akademik', description: 'Informasi kurikulum dan kegiatan belajar mengajar' },
    { id: 'cat-2', name: 'Prestasi', slug: 'prestasi', description: 'Capaian dan kejuaraan siswa serta guru' },
    { id: 'cat-3', name: 'Kesiswaan', slug: 'kesiswaan', description: 'Kegiatan kesiswaan, ekskul, dan OSIS/organisasi' },
    { id: 'cat-4', name: 'Agenda Sekolah', slug: 'agenda-sekolah', description: 'Acara resmi, perayaan hari besar, dan rapat sekolah' },
    { id: 'cat-5', name: 'Adiwiyata & Lingkungan', slug: 'adiwiyata', description: 'Program peduli lingkungan dan kebersihan sekolah' },
  ];

  const defaultMedia: MediaItem[] = [
    {
      id: 'med-1',
      filename: 'upacara-senin.jpg',
      original_name: 'Upacara Bendera Hari Senin.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      size: 1420500,
      path: 'uploads/demo-upacara.jpg',
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
      category: 'image',
      status: 'public',
      uploaded_by: 'Super Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'med-2',
      filename: 'juara-fls2n.jpg',
      original_name: 'Penyerahan Piala Juara 1 Seni Tari FLS2N.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      size: 2150000,
      path: 'uploads/demo-prestasi.jpg',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80',
      category: 'image',
      status: 'public',
      uploaded_by: 'Operator Sekolah',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'med-3',
      filename: 'kegiatan-literasi.jpg',
      original_name: 'Pojok Baca dan Literasi Pagi Siswa.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      size: 980400,
      path: 'uploads/demo-literasi.jpg',
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
      category: 'image',
      status: 'public',
      uploaded_by: 'Operator Sekolah',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'med-4',
      filename: 'dokumen-kurikulum-merdeka.pdf',
      original_name: 'Panduan Kurikulum Merdeka SDN 53 Bengkulu.pdf',
      mime_type: 'application/pdf',
      extension: 'pdf',
      size: 3450000,
      path: 'uploads/demo-panduan.pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      category: 'document',
      status: 'public',
      uploaded_by: 'Super Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'med-5',
      filename: 'mars-sdn53.mp3',
      original_name: 'Lagu Mars SD Negeri 53 Bengkulu.mp3',
      mime_type: 'audio/mpeg',
      extension: 'mp3',
      size: 4200000,
      path: 'uploads/demo-mars.mp3',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      category: 'audio',
      status: 'public',
      uploaded_by: 'Operator Sekolah',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'med-6',
      filename: 'video-profil-singkat.mp4',
      original_name: 'Dokumentasi Sekolah Adiwiyata.mp4',
      mime_type: 'video/mp4',
      extension: 'mp4',
      size: 15400000,
      path: 'uploads/demo-video.mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      category: 'video',
      status: 'public',
      uploaded_by: 'Super Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultPosts: Post[] = [
    {
      id: 'post-1',
      title: 'Siswa SD Negeri 53 Kota Bengkulu Raih Juara 1 Lomba Tari Kreasi FLS2N Tingkat Kota',
      slug: 'siswa-sdn-53-raih-juara-1-fls2n-tingkat-kota-bengkulu',
      category_id: 'cat-2',
      summary: 'Tim Tari Tradisional SD Negeri 53 Kota Bengkulu mengharumkan nama sekolah dengan menyabet medali emas dalam ajang Festival dan Lomba Seni Siswa Nasional (FLS2N).',
      content: `
        <p>Kabar membanggakan datang dari kontingen seni tari <strong>SD Negeri 53 Kota Bengkulu</strong>. Dalam ajang Festival dan Lomba Seni Siswa Nasional (FLS2N) tingkat Sekolah Dasar se-Kota Bengkulu yang dihelat pada hari Kamis lalu, tim tari kreasi sekolah berhasil mempersembahkan gelar <strong>Juara 1</strong>.</p>
        
        <h3>Penampilan Memukau dengan Sentuhan Budaya Daerah</h3>
        <p>Menampilkan tarian bertema <em>"Harmoni Pesisir Rafflesia"</em>, anak-anak tampil dengan penuh percaya diri dan keluwesan gerak. Kostum berpadu corak batik khas Bengkulu menambah daya pikat dewan juri dan seluruh penonton yang memadati aula dinas pendidikan.</p>
        
        <blockquote>"Prestasi ini merupakan buah manis dari latihan intensif selama 3 bulan, bimbingan para guru pembina, dan doa restu para orang tua. Kami sangat bangga atas ketekunan siswa-siswi kita," ungkap Kepala Sekolah Hj. Rosdiana, S.Pd., M.Pd.</blockquote>

        <h3>Persiapan Menuju Tingkat Provinsi</h3>
        <p>Dengan raihan kemenangan ini, SDN 53 Kota Bengkulu resmi didapuk sebagai wakil Kota Bengkulu untuk berlaga pada kompetisi FLS2N tingkat Provinsi Bengkulu mendatang. Mari bersama kita berikan doa serta dukungan terbaik agar generasi muda kita terus mengukir prestasi gemilang!</p>
      `,
      cover_image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80',
      media_ids: ['med-2', 'med-1'],
      author_id: superAdminId,
      author_name: 'Super Administrator',
      status: 'published',
      is_featured: true,
      seo_title: 'SDN 53 Kota Bengkulu Juara 1 FLS2N Tingkat Kota Bengkulu',
      seo_description: 'Tim Tari SD Negeri 53 Kota Bengkulu berhasil meraih medali emas pada FLS2N tingkat Kota Bengkulu 2026.',
      views: 342,
      published_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-2',
      title: 'Peringatan Hari Pendidikan Nasional dan Peluncuran Pojok Baca Digital SDN 53',
      slug: 'peringatan-hardiknas-dan-peluncuran-pojok-baca-digital',
      category_id: 'cat-1',
      summary: 'Dalam rangka memperingati Hari Pendidikan Nasional, SDN 53 Kota Bengkulu meresmikan Pojok Baca Digital untuk mengakselerasi kemampuan literasi siswa.',
      content: `
        <p>Semangat Hari Pendidikan Nasional diwarnai dengan inovasi edukatif di SD Negeri 53 Kota Bengkulu. Sekolah secara resmi meluncurkan fasilitas <strong>Pojok Baca Digital</strong> di ruang perpustakaan dan setiap selasar kelas.</p>
        <p>Melalui perangkat tablet edukatif dan akses koleksi ribuan e-book anak bermutu, siswa dapat membaca materi sains, sejarah, dan dongeng nusantara secara interaktif. Kegiatan ini diharapkan memperkuat pembiasaan 15 menit membaca sebelum jam pertama dimulai.</p>
      `,
      cover_image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
      media_ids: ['med-3'],
      author_id: adminId,
      author_name: 'Operator Sekolah',
      status: 'published',
      is_featured: true,
      seo_title: 'Peluncuran Pojok Baca Digital SDN 53 Kota Bengkulu',
      seo_description: 'SDN 53 Kota Bengkulu resmikan Pojok Baca Digital tingkatkan budaya literasi.',
      views: 188,
      published_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-3',
      title: 'Aksi Bersih Lingkungan dan Penanaman Pohon Bersama Komite Sekolah (Sekolah Adiwiyata)',
      slug: 'aksi-bersih-lingkungan-dan-penanaman-pohon-adiwiyata',
      category_id: 'cat-5',
      summary: 'Mewujudkan komitmen sebagai Sekolah Adiwiyata, seluruh dewan guru, siswa, dan orang tua bahu-membahu menanam 100 bibit pohon peneduh di lingkungan sekolah.',
      content: `
        <p>Keluarga besar SD Negeri 53 Kota Bengkulu menggelar aksi gotong royong peduli lingkungan hidup pada Sabtu pagi. Kegiatan ini diikuti oleh ratusan siswa, wali murid, dewan guru, dan perwakilan Dinas Lingkungan Hidup Kota Bengkulu.</p>
        <p>Selain menanam bibit pohon pucuk merah dan tabebuya, siswa juga diajak memilah sampah organik dan anorganik untuk disalurkan ke Bank Sampah Ceria SDN 53.</p>
      `,
      cover_image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      media_ids: ['med-1'],
      author_id: editorId,
      author_name: 'Budi Santoso, S.Pd. (Editor)',
      status: 'published',
      is_featured: false,
      seo_title: 'Aksi Bersih Lingkungan Adiwiyata SDN 53 Bengkulu',
      seo_description: 'Program penanaman pohon dan aksi bersih lingkungan SD Negeri 53 Kota Bengkulu.',
      views: 115,
      published_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-4',
      title: 'Pentas Seni Akhir Tahun dan Gelar Karya P5: Ragam Kreativitas Anak Bangsa',
      slug: 'pentas-seni-dan-gelar-karya-p5-sdn-53-bengkulu',
      category_id: 'cat-3',
      summary: 'Gelar Karya Projek Penguatan Profil Pelajar Pancasila (P5) berlangsung semarak dengan pameran hasil karya daur ulang dan pertunjukan musik angklung.',
      content: `
        <p>Gedung serbaguna SD Negeri 53 dipadati oleh antusiasme pengunjung dalam acara Pameran Karya P5. Siswa kelas 1 hingga 6 memamerkan beragam karya kerajinan tangan dari barang bekas, produk olahan makanan sehat tradisional Bengkulu, serta tarian kolosal.</p>
      `,
      cover_image: 'https://images.unsplash.com/photo-1460518451282-474b15672083?w=1200&auto=format&fit=crop&q=80',
      media_ids: ['med-2'],
      author_id: superAdminId,
      author_name: 'Super Administrator',
      status: 'published',
      is_featured: false,
      seo_title: 'Gelar Karya P5 SDN 53 Kota Bengkulu',
      seo_description: 'Pameran karya siswa Projek Penguatan Profil Pelajar Pancasila di SDN 53 Kota Bengkulu.',
      views: 94,
      published_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'post-5',
      title: 'Draft: Persiapan Asesmen Nasional Berbasis Komputer (ANBK) Kelas V Tahun Ajaran 2026/2027',
      slug: 'draft-persiapan-anbk-kelas-v',
      category_id: 'cat-1',
      summary: 'Laporan dan jadwal gladi bersih Asesmen Nasional Berbasis Komputer bagi siswa kelas V di laboratorium komputer SDN 53 Bengkulu.',
      content: `
        <p>Draft pemberitahuan teknis pelaksanaan gladi bersih ANBK yang mencakup kesiapan perangkat keras, jaringan internet, dan pembagian sesi siswa.</p>
      `,
      cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      media_ids: [],
      author_id: adminId,
      author_name: 'Operator Sekolah',
      status: 'draft',
      is_featured: false,
      seo_title: 'Persiapan ANBK Kelas V SDN 53 Bengkulu',
      seo_description: 'Informasi pelaksanaan gladi bersih ANBK SD Negeri 53 Kota Bengkulu.',
      views: 12,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Pemberitahuan Pelaksanaan Penilaian Akhir Semester (PAS) Genap Tahun Ajaran 2025/2026',
      content: 'Diberitahukan kepada seluruh orang tua/wali murid bahwa Penilaian Akhir Semester (PAS) Genap akan dilaksanakan mulai hari Senin, 15 Juni 2026 sampai dengan Jumat, 19 Juni 2026. Diharapkan bimbingan orang tua dalam memfasilitasi waktu belajar peserta didik di rumah.',
      status: 'published',
      priority: 'penting',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachment_name: 'Jadwal_PAS_Genap_2026.pdf',
      published_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      title: 'Sosialisasi Penerimaan Peserta Didik Baru (PPDB) Zonasi dan Prestasi SDN 53 Bengkulu',
      content: 'Informasi jalur pendaftaran PPDB SD Negeri 53 Kota Bengkulu tahun pelajaran 2026/2027 telah dibuka secara daring dan luring. Silakan unduh formulir persyaratan di menu Download Center website ini.',
      status: 'published',
      priority: 'normal',
      attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      attachment_name: 'Brosur_PPDB_2026_SDN53.pdf',
      published_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultGraduationAnnouncement: GraduationAnnouncement[] = [
    {
      id: 'grad-ann-1',
      title: 'Pengumuman Kelulusan Peserta Didik Kelas VI Tahun Pelajaran 2025/2026',
      academic_year: '2025/2026',
      publish_date: '2026-06-10',
      publish_time: '10:00',
      content: 'Berdasarkan kriteria kelulusan dan hasil rapat pleno dewan guru SD Negeri 53 Kota Bengkulu pada tanggal 8 Juni 2026, dengan ini disampaikan status kelulusan peserta didik kelas VI Tahun Ajaran 2025/2026. Silakan gunakan Nomor Induk Siswa Nasional (NISN) untuk melakukan pengecekan individual dan mencetak Surat Keterangan Lulus (SKL).',
      document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      document_name: 'SK_Kepala_Sekolah_Kelulusan_2026.pdf',
      is_active: true,
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultGraduationStudents: GraduationStudent[] = [
    {
      id: 'grad-stu-1',
      announcement_id: 'grad-ann-1',
      nisn: '0123456789',
      name: 'ADITYA PRATAMA',
      student_class: 'VI-A',
      academic_year: '2025/2026',
      status: 'LULUS',
      birth_date: '2014-03-15',
      exam_number: '053-01-001-2026',
      notes: 'Lulus dengan predikat Sangat Baik. Selamat melanjutkan ke jenjang SMP!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'grad-stu-2',
      announcement_id: 'grad-ann-1',
      nisn: '0123456790',
      name: 'AULIA RAHMADANI',
      student_class: 'VI-A',
      academic_year: '2025/2026',
      status: 'LULUS',
      birth_date: '2014-05-20',
      exam_number: '053-01-002-2026',
      notes: 'Lulus dengan predikat Pujian (Cum Laude). Peringkat 1 Umum.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'grad-stu-3',
      announcement_id: 'grad-ann-1',
      nisn: '0123456791',
      name: 'BAYU SETIAWAN',
      student_class: 'VI-B',
      academic_year: '2025/2026',
      status: 'LULUS',
      birth_date: '2014-08-11',
      exam_number: '053-02-003-2026',
      notes: 'Lulus dengan predikat Baik.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'grad-stu-4',
      announcement_id: 'grad-ann-1',
      nisn: '0123456792',
      name: 'CHELSEA PUTRI ANGGRAENI',
      student_class: 'VI-B',
      academic_year: '2025/2026',
      status: 'LULUS',
      birth_date: '2014-11-03',
      exam_number: '053-02-004-2026',
      notes: 'Lulus dengan predikat Sangat Baik.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'grad-stu-5',
      announcement_id: 'grad-ann-1',
      nisn: '0123456793',
      name: 'DIMAS ARYA KUSUMA',
      student_class: 'VI-C',
      academic_year: '2025/2026',
      status: 'LULUS',
      birth_date: '2014-01-28',
      exam_number: '053-03-005-2026',
      notes: 'Lulus dengan predikat Baik.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'grad-stu-6',
      announcement_id: 'grad-ann-1',
      nisn: '0123456794',
      name: 'FATHIR AL-FARIZI',
      student_class: 'VI-C',
      academic_year: '2025/2026',
      status: 'BELUM_DITENTUKAN',
      birth_date: '2014-07-19',
      exam_number: '053-03-006-2026',
      notes: 'Silakan menghubungi wali kelas untuk kelengkapan administrasi ujian susulan.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const defaultDownloads: DownloadItem[] = [
    {
      id: 'dl-1',
      title: 'Formulir Pendaftaran Peserta Didik Baru (PPDB) 2026/2027',
      description: 'Formulir resmi pendaftaran calon siswa baru SDN 53 Kota Bengkulu format PDF lengkap dengan pakta integritas.',
      category: 'Formulir',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'Formulir_PPDB_2026_SDN53.pdf',
      file_size: 1250000,
      file_ext: 'pdf',
      download_count: 320,
      is_active: true,
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'dl-2',
      title: 'Kalender Pendidikan dan Agenda Akademik Tahun Ajaran 2025/2026',
      description: 'Rincian hari efektif belajar, libur semester, jadwal ujian, dan agenda perayaan hari besar sekolah.',
      category: 'Akademik',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'Kalender_Akademik_2025_2026_SDN53.pdf',
      file_size: 890000,
      file_ext: 'pdf',
      download_count: 512,
      is_active: true,
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'dl-3',
      title: 'Buku Pedoman Tata Tertib Siswa dan Kode Etik Sekolah',
      description: 'Pedoman norma kesopanan, seragam sekolah harian, dan sistem pembinaan karakter ramah anak.',
      category: 'Panduan',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'Tata_Tertib_Siswa_SDN53.pdf',
      file_size: 1420000,
      file_ext: 'pdf',
      download_count: 240,
      is_active: true,
      created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'dl-4',
      title: 'Jadwal Ekstrakurikuler dan Pembagian Pelatih Tahun 2026',
      description: 'Informasi hari dan jam latihan kepramukaan, drumband, tari daerah, dan cabang olahraga.',
      category: 'Kesiswaan',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_name: 'Jadwal_Ekskul_2026_SDN53.pdf',
      file_size: 670000,
      file_ext: 'pdf',
      download_count: 185,
      is_active: true,
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const defaultGallery: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'Peringatan Hari Guru Nasional dan Apresiasi Pendidik Teladan',
      description: 'Kemeriahan upacara bendera dan persembahan puisi dari para siswa untuk dewan guru.',
      media_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
      type: 'photo',
      album: 'Kegiatan Sekolah',
      year: '2026',
      is_public: true,
      created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'gal-2',
      title: 'Latihan Drumband "Gita Ceria 53" di Lapangan Utama',
      description: 'Persiapan regu drumband menjelang karnaval HUT Kota Bengkulu.',
      media_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1000&auto=format&fit=crop&q=80',
      type: 'photo',
      album: 'Ekstrakurikuler',
      year: '2026',
      is_public: true,
      created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'gal-3',
      title: 'Kegiatan Sholat Dhuha Berjamaah dan Kultum Pagi',
      description: 'Pembiasaan ibadah rutin di musholla sekolah membina generasi religius.',
      media_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1000&auto=format&fit=crop&q=80',
      type: 'photo',
      album: 'Keagamaan',
      year: '2026',
      is_public: true,
      created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'gal-4',
      title: 'Video Profil Sekolah Adiwiyata SD Negeri 53 Kota Bengkulu',
      description: 'Dokumentasi perjalanan lingkungan hijau, apotek hidup, dan pengelolaan bank sampah.',
      media_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
      type: 'video',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      album: 'Video Dokumentasi',
      year: '2026',
      is_public: true,
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const defaultMenus: MenuItem[] = [
    { id: 'menu-1', label: 'Beranda', path: '/', order: 1, is_active: true, target: '_self' },
    { id: 'menu-2', label: 'Profil', path: '/profil', order: 2, is_active: true, target: '_self' },
    { id: 'menu-3', label: 'Berita', path: '/berita', order: 3, is_active: true, target: '_self' },
    { id: 'menu-4', label: 'Pengumuman', path: '/pengumuman', order: 4, is_active: true, target: '_self' },
    { id: 'menu-5', label: 'Galeri', path: '/galeri', order: 5, is_active: true, target: '_self' },
    { id: 'menu-6', label: 'Download', path: '/download', order: 6, is_active: true, target: '_self' },
    { id: 'menu-7', label: 'Kelulusan', path: '/kelulusan', order: 7, is_active: true, target: '_self' },
    { id: 'menu-8', label: 'Kontak', path: '/kontak', order: 8, is_active: true, target: '_self' },
  ];

  const defaultActivityLogs: ActivityLog[] = [
    {
      id: 'log-1',
      user_id: superAdminId,
      user_name: 'Super Administrator',
      action: 'SISTEM_INIT',
      details: 'Inisialisasi sistem database dan konfigurasi awal portal sekolah SD Negeri 53 Kota Bengkulu',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'log-2',
      user_id: superAdminId,
      user_name: 'Super Administrator',
      action: 'CREATE_POST',
      details: 'Mempublikasikan berita: Siswa SDN 53 Raih Juara 1 FLS2N Tingkat Kota',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const initialData: DatabaseSchema = {
    users: defaultUsers,
    user_credentials: defaultCredentials,
    settings: getInitialSettings(),
    categories: defaultCategories,
    posts: defaultPosts,
    media: defaultMedia,
    announcements: defaultAnnouncements,
    graduation_announcements: defaultGraduationAnnouncement,
    graduation_students: defaultGraduationStudents,
    downloads: defaultDownloads,
    gallery: defaultGallery,
    activity_logs: defaultActivityLogs,
    menus: defaultMenus,
  };

  saveDatabase(initialData);
  dbInstance = initialData;
  return initialData;
}

export function getDatabase(): DatabaseSchema {
  if (!dbInstance) {
    return initializeDatabase();
  }
  return dbInstance;
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    dbInstance = data;
  } catch (err) {
    console.error('Error saving database to file:', err);
    throw err;
  }
}

export function logActivity(
  user_id: string,
  user_name: string,
  action: string,
  details: string,
  ip_address = '127.0.0.1'
): void {
  const db = getDatabase();
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id,
    user_name,
    action,
    details,
    ip_address,
    created_at: new Date().toISOString(),
  };
  db.activity_logs.unshift(newLog);
  // Keep last 500 logs
  if (db.activity_logs.length > 500) {
    db.activity_logs = db.activity_logs.slice(0, 500);
  }
  saveDatabase(db);
}
