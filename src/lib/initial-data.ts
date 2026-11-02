import { Profile, Experience, Project, Certification, SkillCategory, ContactMessage, Highlight } from './types';

export const initialProfile: Profile = {
  id: 'profile-main',
  name: 'Ratna Sari, S.T.',
  title: 'Geologist • Exploration & 3D Modeling Specialist',
  status_badge: 'Tersedia untuk Proyek & Konsultansi',
  bio: 'Praktisi geologi eksplorasi dengan fokus pada pemetaan sistem alterasi hidrotermal, analisis sedimentologi-stratigrafi, dan pemodelan spasial 3D. Berpengalaman memimpin survei singkapan lapangan dan supervisi pemboran mineral di berbagai penjuru Indonesia.',
  education: 'S1 Teknik Geologi',
  university: 'Univ. Padjadjaran (UNPAD)',
  location: 'Bandung & Balikpapan',
  certification_badge: 'K3 & POP Minerba ESDM',
  avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  cv_url: '#resume',
  quote: '"Mente et Malleo — Menyingkap lapisan litosfer bumi melalui investigasi lapangan berbasis data ilmiah."',
  email: 'ratna.geologist@earthmail.id',
  phone: '+62 812-3456-7890',
  linkedin_url: 'https://linkedin.com',
  updated_at: new Date().toISOString()
};

export const initialExperiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Senior Field Exploration Geologist',
    company: 'PT Nusa Mineral Nusantara',
    location: 'Sumbawa & Halmahera',
    period: '2022 — Sekarang',
    description: 'Memimpin tim survei geologi lapangan untuk pemetaan alterasi hidrotermal dan supervisi pemboran inti diamond drill >3.500m dalam eksplorasi porfiri Cu-Au.',
    tags: ['Core Logging', 'Hydrothermal Alteration', 'Leapfrog 3D'],
    order_index: 0
  },
  {
    id: 'exp-2',
    title: 'Junior Exploration Geologist',
    company: 'PT Bumi Geocipta Konsultindo',
    location: 'Bandung & Site',
    period: '2020 — 2022',
    description: 'Interpretasi geokimia multielemen (XRF & ICP-MS), evaluasi petrografi mikroskopik, dan pemodelan sesar serta domain geologi menggunakan software 3D.',
    tags: ['Geokimia', 'Petrografi', 'ArcGIS Pro'],
    order_index: 1
  },
  {
    id: 'exp-3',
    title: 'Field Assistant & Wellsite Mudlogger',
    company: 'Geothermal Exploration Unit',
    location: 'Jawa Barat',
    period: '2019 — 2020',
    description: 'Monitoring cutting sampling real-time pada sumur eksplorasi geotermal entalpi tinggi dan pencatatan litologi serta rekahan produktif.',
    tags: ['Mudlogging', 'Geotermal'],
    order_index: 2
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Carbonate Reservoir Characterization of the Baturaja Formation Using SPEIL, SCPEI, and Seismic Stratigraphic Analysis',
    location: 'Cekungan Sumatera Selatan',
    duration: 'APRIL 2026 – JULY 2026',
    description: 'Undergraduate thesis at Institut Teknologi Bandung focused on quantitative characterization of the Baturaja Formation carbonate reservoir, combining extended elastic impedance attributes (SPEIL, SCPEI) with seismic stratigraphic analysis to identify high-quality reservoir zones.',
    deliverable: 'Model Inversi 3D & Rekomendasi Pemboran',
    deliverable_color: 'primary',
    tags: ['Carbonate Reservoir', 'Seismic Inversion', 'SPEIL', 'SCPEI', 'Rock Physics', 'Seismic Stratigraphy'],
    image_url: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&w=1200&q=80',
    document_url: 'https://kdokmvnpixzcwmslpsee.supabase.co/storage/v1/object/public/portfolio/1793524292032_CV_Novrijal_Ramadhany.pdf',
    document_name: 'Paparan_Karakterisasi_Reservoir_Karbonat.pdf',
    details: {
      objectives: [
        'Characterize carbonate reservoir quality from elastic and reservoir-property volumes.',
        'Define quantitative cut-offs that separate reservoir from non-reservoir facies.',
        'Translate the integrated interpretation into a drilling recommendation.',
      ],
      dataset: [
        '3 wells with complete petrophysical suites',
        '3D partial-stack seismic volumes',
        'Checkshot and well marker data',
      ],
      workflow: [
        'Well log conditioning and petrophysical analysis',
        'Rock physics analysis and sensitivity testing',
        'Well-to-seismic tie and wavelet extraction',
        'Seismic stratigraphic framework interpretation',
        'Simultaneous and extended elastic impedance inversion',
        'Reservoir property prediction and QC',
      ],
      methods: [
        'Seismic stratigraphy',
        'Rock physics modeling',
        'SPEIL / SCPEI extended elastic impedance',
        'Acoustic impedance and Vp/Vs inversion',
      ],
      results: [
        'Integrated well, petrophysical, and 3D partial-stack seismic data from 3 wells.',
        'Generated and evaluated 6 elastic and reservoir-property volumes: AI, Vp/Vs, SPEIL, SCPEI, pseudo-density, and pseudo-porosity.',
        'Achieved inversion QC correlations reaching 0.93.',
        'Established quantitative reservoir indicators of P-Impedance < 6,400 (m/s·g/cc) and Vp/Vs < 2.',
      ],
      key_findings: [
        'A reefal buildup was identified as the highest-quality reservoir sweet spot.',
        'Drilling recommendation targets an anticline crest with structural closure and favorable reservoir quality.',
      ],
      software_used: ['Petrel', 'Hampson-Russell', 'Interactive Petrophysics', 'Python'],
      doc_description:
        'Complete undergraduate thesis documenting the integrated seismic, well-log, petrophysical, inversion, and seismic-stratigraphic workflow used for carbonate reservoir characterization.',
      doc_tags: [
        '3 Wells',
        '6 Reservoir / Elastic Volumes',
        'Seismic Inversion',
        'SPEIL',
        'SCPEI',
        'Seismic Stratigraphy',
        'Reservoir Characterization',
      ],
    },
    order_index: 0,
  },
  {
    id: 'proj-2',
    title: 'Karakterisasi Geokimia & Petrografi Formasi Batuan',
    location: 'Cekungan Jawa Timur',
    duration: '5 Bulan',
    description: 'Analisis 45 preparasi thin section sayatan tipis untuk mengidentifikasi provenans tektonik serta fasa lempung XRD.',
    deliverable: 'Atlas Petrografi & Laporan Provenans',
    deliverable_color: 'secondary',
    tags: ['Thin Section', 'Petrografi', 'XRD', 'Provenans Sedimen'],
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    details: {
      objectives: [
        'Menentukan komposisi mineralogi dan klasifikasi batuan sedimen klastik.',
        'Menganalisis diagenesis batuan dan pengaruhnya terhadap kualitas porositas.',
        'Mengonstruksi provenans tektonik dan lingkungan pengendapan regional.',
      ],
      dataset: [
        '45 preparasi sayatan tipis (thin section) batuan inti dan singkapan',
        'Data difraksi sinar-X (XRD) untuk identifikasi fasa lempung',
        'Analisis geokimia unsur utama (XRF) 20 sampel batuan',
      ],
      workflow: [
        'Sampling batuan lapangan & pemotongan spesimen',
        'Preparasi sayatan tipis berstandar 0.03 mm',
        'Point counting mikroskop polarisasi 300 titik per sayatan',
        'Uji difraksi sinar-X (XRD) fraksi lempung',
        'Klasifikasi segitiga Dickinson & rekonstruksi provenans',
        'Penyusunan atlas petrografi & laporan komparatif',
      ],
      methods: [
        'Optical Petrography Polarizing Microscope',
        'X-Ray Diffraction (XRD) Clay Mineralogy',
        'Dickinson Provenance Ternary Diagram',
        'Diagenetic Sequence Modeling',
      ],
      results: [
        'Teridentifikasi litologi dominan Sublitharenite dan Feldspathic Wacke.',
        'Fasa lempung didominasi oleh Ilit dan Smektit teralterasi.',
        'Indeks porositas sekunder berkembang akibat disolusi feldspar.',
        'Atlas petrografi 45 sampel resolusi tinggi tersusun rapi.',
      ],
      key_findings: [
        'Provenans batuan menunjukkan tatanan tektonik Recycled Orogen.',
        'Zona reservoar terbaik berasosiasi dengan fasies channel sandstone berbutir sedang.',
      ],
      software_used: ['JMicroVision', 'RockJock XRD', 'ArcGIS Pro', 'Microsoft Excel'],
      doc_description:
        'Dokumen teknis komparatif analisis mikroskopis petrografi, difraksi sinar-X (XRD), dan rekonstruksi sejarah pengendapan sedimen.',
      doc_tags: ['45 Thin Sections', 'XRD Analysis', 'Petrografi', 'Sedimentologi', 'Atlas Batuan'],
    },
    order_index: 1,
  },
  {
    id: 'proj-3',
    title: 'Studi Geohidrologi & Pemodelan Akuifer Air Tanah',
    location: 'Cekungan Bandung',
    duration: '4 Bulan',
    description: 'Survei geolistrik konfigurasi Schlumberger di 28 titik sounding untuk delimitasi akuifer tertekan dan sumur resapan.',
    deliverable: 'Peta Hidrogeologi & Penampang 2D',
    deliverable_color: 'tertiary',
    tags: ['Geolistrik', 'Schlumberger', 'Akuifer', 'Resistivitas'],
    image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    details: {
      objectives: [
        'Memetakan geometri lapisan pembawa air tanah (akuifer bebas dan tertekan).',
        'Menentukan zona kedalaman optimal untuk perencanaan sumur bor dalam.',
        'Memberikan rekomendasi titik sumur resapan untuk konservasi air tanah.',
      ],
      dataset: [
        '28 titik Vertical Electrical Sounding (VES) konfigurasi Schlumberger (AB/2 hingga 300m)',
        'Data 12 log litologi sumur bor pembanding (ground truth)',
        'Data pengukuran tinggi muka air tanah statis (muka pisometrik)',
      ],
      workflow: [
        'Survei orientasi lapangan & pengukuran koordinat GNSS titik sounding',
        'Akuisisi data resistivitas sounding multichannel',
        'Filtering dan curve matching kurva tahanan jenis semu',
        'Inversi 1D/2D menggunakan perangkat lunak geolistrik',
        'Korelasi litologi dan penampang geohidrologi 2D',
        'Penyusunan peta rekomendasi titik bor dan zona konservasi',
      ],
      methods: [
        'Vertical Electrical Sounding (VES) Schlumberger Array',
        '1D & 2D Resistivity Inversion Modeling',
        'Piezometric Surface Mapping',
        'Hydrogeological Cross-Section Correlation',
      ],
      results: [
        'Ditemukan 3 sistem akuifer utama pada interval kedalaman 25-45m, 70-110m, dan >140m.',
        'Resistivitas akuifer tertekan berada pada rentang 35 - 90 ohm.m (lapisan pasir tufaan).',
        'Peta hidrogeologi 2D berhasil mendelimitasi area imbuhan dan lepasan.',
      ],
      key_findings: [
        'Lapisan lempung pasiran bertindak sebagai confining bed tebal di sisi barat cekungan.',
        'Titik bor produksi direkomendasikan pada zona depresi struktur dengan debit potensi tinggi.',
      ],
      software_used: ['IPI2win', 'Res2Dinv', 'Surfer', 'QGIS'],
      doc_description:
        'Laporan studi komprehensif pendugaan geolistrik resistivitas, penampang geohidrologi 2D, dan rekomendasi pemanfaatan air tanah berkelanjutan.',
      doc_tags: ['28 Titik VES', 'Akuifer Tertekan', 'Geolistrik 2D', 'Hidrogeologi', 'Konservasi'],
    },
    order_index: 2,
  },
  {
    id: 'proj-4',
    title: 'Pemetaan Geohazard & Mitigasi Longsor LiDAR',
    location: 'Jawa Barat',
    duration: '6 Bulan',
    description: 'Pengolahan DEM resolusi tinggi dan pemodelan kestabilan lereng kritis untuk zonasi kerentanan gerakan tanah.',
    deliverable: 'Peta Bahaya Longsor Skala 1:10.000',
    deliverable_color: 'error',
    tags: ['LiDAR', 'DEM', 'Geohazard', 'Kestabilan Lereng'],
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    details: {
      objectives: [
        'Identifikasi fitur morfologi longsoran purba dan bidang diskontinuitas lereng.',
        'Menghitung faktor keamanan (FoK) lereng batuan dan tanah pada kondisi kritis.',
        'Menyusun peta mikrozonasi kerentanan bencana tanah longsor skala 1:10.000.',
      ],
      dataset: [
        'Data point cloud LiDAR udara kerapatan 8 pts/m²',
        'Digital Elevation Model (DEM) resolusi 0.5 meter',
        'Data uji mekanika tanah (kohesi, sudut geser dalam, bobot isi)',
        'Data curah hujan ekstrem harian maksimum 10 tahun',
      ],
      workflow: [
        'Filtering ground points data mentah LiDAR udara',
        'Ekstraksi DEM, slope gradient, curvature, dan flow accumulation',
        'Pemetaan ground truth rekahan dan gawir longsoran aktif',
        'Pemodelan kestabilan lereng Limit Equilibrium Method (LEM)',
        'Analisis probabilistik multi-kriteria AHP (Analytical Hierarchy Process)',
        'Penyusunan zonasi kerentanan dan desain dinding penahan tanah (retaining wall)',
      ],
      methods: [
        'LiDAR High-Resolution Terrain Extraction',
        'Kinematic & Limit Equilibrium Analysis (Bishop / Janbu)',
        'Spatial Multi-Criteria Evaluation (SMCE)',
        'Hydrological Soil Slope Saturation Modeling',
      ],
      results: [
        'Terpetakan 18 gawir longsoran aktif dan 7 mahkota longsoran potensial baru.',
        'Faktor keamanan lereng kritis berada pada nilai FoK < 1.05 saat kondisi jenuh air.',
        'Peta mikrozonasi bahaya tanah longsor skala 1:10.000 berhasil divalidasi.',
      ],
      key_findings: [
        'Kontak bidang perlapisan tuf pasiran dan batulempung bertindak sebagai bidang gelincir utama.',
        'Pemasangan sistem subdrainage dan perkuatan bronjong/terassering efektif menaikkan FoK > 1.4.',
      ],
      software_used: ['Rocscience Slide2', 'Global Mapper', 'ArcGIS Pro', 'CloudCompare'],
      doc_description:
        'Dokumen analisis geoteknik kestabilan lereng, pemrosesan LiDAR resolusi tinggi, dan rekomendasi mitigasi rekayasa geologi.',
      doc_tags: ['LiDAR 0.5m', 'Limit Equilibrium', 'Geohazard', 'Mitigasi Longsor', 'Geoteknik'],
    },
    order_index: 3,
  },
];

export const initialCertifications: Certification[] = [
  {
    id: 'cert-1',
    title: 'POP (Pengawas Operasional Pertama)',
    issuer: 'ESDM • BNSP',
    year: '2023',
    description: 'Pengawasan keselamatan operasional minerba sesuai Kepmen ESDM.',
    credential_url: '#',
    order_index: 0
  },
  {
    id: 'cert-2',
    title: 'Basic Sea Survival & HUET',
    issuer: 'OPITO',
    year: '2022',
    description: 'Protokol keselamatan & evakuasi helikopter lapangan maritim.',
    credential_url: '#',
    order_index: 1
  },
  {
    id: 'cert-3',
    title: '3D Modeling Leapfrog Geo',
    issuer: 'Seequent',
    year: '2022',
    description: 'Pemodelan implisit domain litologi, sesar, dan kadar mineral.',
    credential_url: '#',
    order_index: 2
  },
  {
    id: 'cert-4',
    title: 'ArcGIS Mining & Spatial Database',
    issuer: 'Esri',
    year: '2021',
    description: 'Geodatabase spasial dan integrasi penginderaan jauh.',
    credential_url: '#',
    order_index: 3
  },
  {
    id: 'cert-5',
    title: 'Petrografi Alterasi Hidrotermal',
    issuer: 'IAGI',
    year: '2021',
    description: 'Spesiasi mineral alterasi dan paragenesis urat bijih.',
    credential_url: '#',
    order_index: 4
  },
  {
    id: 'cert-6',
    title: 'Wellsite & Mudlogging Operations',
    issuer: 'AAPG',
    year: '2020',
    description: 'Evaluasi cuttings dan analisis tekanan gas sumur pemboran.',
    credential_url: '#',
    order_index: 5
  }
];

export const initialHighlights: Highlight[] = [
  {
    id: 'hl-1',
    value: '3.50 / 4.00',
    label: 'IPK Kelulusan S1',
    description: 'Teknik Geologi UPN "Veteran" Yogyakarta',
    order_index: 0,
  },
  {
    id: 'hl-2',
    value: '30+ Mahasiswa',
    label: 'Asisten Praktikum',
    description: 'Laboratorium Geologi & Pemetaan Lapangan',
    order_index: 1,
  },
  {
    id: 'hl-3',
    value: '10+ Titik Pemboran',
    label: 'Core Logging & Supervisi',
    description: 'Supervisi Pemboran Inti Batubara & Mineral',
    order_index: 2,
  },
  {
    id: 'hl-4',
    value: '25+ Peta Geologi',
    label: 'Pemetaan & SIG Spasial',
    description: 'Dihasilkan Menggunakan ArcGIS & Global Mapper',
    order_index: 3,
  },
  {
    id: 'hl-5',
    value: '390+ Mt',
    label: 'Estimasi Sumber Daya Batubara',
    description: 'Korelasi Seam & Pemodelan MineScape',
    order_index: 4,
  },
  {
    id: 'hl-6',
    value: '12.6 Juta m³',
    label: 'Estimasi Volume Overburden',
    description: 'Perhitungan Cadangan & Cut-and-Fill Tambang',
    order_index: 5,
  },
  {
    id: 'hl-7',
    value: '9 km²',
    label: 'Luas Area Pemetaan',
    description: 'Pemetaan Singkapan & Analisis Struktur Geologi',
    order_index: 6,
  },
  {
    id: 'hl-8',
    value: '450+ Titik Pengamatan',
    label: 'Pengukuran Strike & Dip',
    description: 'Analisis Sesar, Kekar & Orientasi Lapisan Singkapan',
    order_index: 7,
  },
];

export const initialSkills: SkillCategory[] = [
  {
    id: 'skill-1',
    category: 'Geologi Lapangan',
    icon_name: 'terrain',
    items: ['Brunton Compass', 'Core Logging', 'Rock Sampling', 'Analisis Struktur'],
    order_index: 0
  },
  {
    id: 'skill-2',
    category: 'Software & GIS',
    icon_name: 'computer',
    items: ['Leapfrog Geo', 'ArcGIS Pro', 'QGIS', 'Micromine', 'ioGAS'],
    order_index: 1
  },
  {
    id: 'skill-3',
    category: 'Laboratorium',
    icon_name: 'biotech',
    items: ['Thin Section', 'Ore Microscopy', 'Spektroskopi XRF', 'Difraksi XRD'],
    order_index: 2
  },
  {
    id: 'skill-4',
    category: 'Kepatuhan & K3',
    icon_name: 'verified_user',
    items: ['KCMI & JORC 2012', 'Job Safety Analysis', 'Wilderness Safety'],
    order_index: 3
  }
];

export const initialMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Ir. Hendra Wijaya',
    email: 'hendra.wijaya@minera-group.co.id',
    phone: '+62 811-2233-4455',
    subject: 'Peluang Eksplorasi Cu-Au Kalimantan Tengah',
    message: 'Halo Ibu Ratna, kami sedang merencanakan kampanye pemetaan singkapan dan supervisi pemboran eksplorasi porfiri di Kalimantan Tengah untuk Q1 2026. Apakah Anda terbuka untuk diskusi teknis?',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_read: false
  },
  {
    id: 'msg-2',
    name: 'Dr. Bambang Priyono',
    email: 'bambang.priyono@georesearch.or.id',
    phone: '+62 813-8899-7711',
    subject: 'Undangan Kolaborasi Penelitian Sedimentologi',
    message: 'Selamat siang Bu Ratna, kami membaca abstrak riset Anda mengenai Formasi batuan di Cekungan Jawa Timur. Kami ingin mengajak kolaborasi penulisan makalah untuk simposium IAGI mendatang.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    is_read: true
  }
];
