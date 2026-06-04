const fs = require('fs');
const path = require('path');

// 1. Konfigurasi Path
const protoDir = path.join(__dirname, '../proto');
const indexPath = path.join(__dirname, '../index.html');
const sitemapPath = path.join(__dirname, '../sitemap.xml');

// UBAH INI: Ganti NAMA_REPO_KAMU sesuai repository Anda
const baseUrl = 'https://anggaconni.github.io/NAMA_REPO_KAMU'; 

// Buat folder proto jika belum ada
if (!fs.existsSync(protoDir)) {
    fs.mkdirSync(protoDir, { recursive: true });
}

// 2. Baca semua file di dalam folder 'proto'
const files = fs.readdirSync(protoDir).filter(file => file.endsWith('.html'));

let prototypes = [];

// 3. Ekstrak data (Judul & Deskripsi) langsung dari dalam file HTML
files.forEach(file => {
    const filePath = path.join(protoDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Cari <title> di dalam HTML menggunakan Regex
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    // Jika tidak ada title, gunakan nama file yang dirapikan
    let title = titleMatch ? titleMatch[1] : file.replace('.html', '').replace(/-/g, ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Cari meta description untuk deskripsi Card
    const descMatch = content.match(/<meta name="description" content="(.*?)"/i);
    let description = descMatch ? descMatch[1] : 'Click to launch this prototype application in your browser.';

    prototypes.push({
        filename: file,
        title: title,
        description: description,
        url: `proto/${file}`,
        absoluteUrl: `${baseUrl}/proto/${file}`
    });
});

// Urutkan berdasarkan abjad (Z-A, terbaru)
prototypes.sort((a, b) => b.filename.localeCompare(a.filename));

// 4. Generate Element Card HTML
let cardsHtml = '';
if (prototypes.length === 0) {
    cardsHtml = `<div class="col-span-full text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-xl">Belum ada prototype. Silakan upload file HTML Anda ke folder "proto".</div>`;
} else {
    prototypes.forEach(proto => {
        cardsHtml += `
        <a href="${proto.url}" class="bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center text-center justify-center min-h-[180px] group cursor-pointer transition-all transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20 decoration-none">
            <i class="fas fa-file-code text-4xl text-gray-500 group-hover:text-blue-400 mb-4 transition-colors"></i>
            <h3 class="text-lg font-bold text-gray-200 group-hover:text-white mb-2">${proto.title}</h3>
            <p class="text-sm text-gray-400 line-clamp-2">${proto.description}</p>
            <span class="text-xs font-semibold text-blue-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Launch Prototype <i class="fas fa-arrow-right"></i>
            </span>
        </a>
        `;
    });
}

// 5. Build HTML Landing Page Utuh (Dengan Data Bio Anda)
const landingPageHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angga Conni Saputra - Prototype Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-gray-100 font-sans antialiased min-h-screen flex flex-col">

    <!-- Header / Identitas -->
    <header class="bg-gray-800/50 border-b border-gray-700 py-12 px-6">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">ANGGA CONNI SAPUTRA</h1>
                <p class="text-xl text-blue-400 font-medium mb-4">Strategic Innovation Specialist & Systems Architect</p>
                
                <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-sm text-gray-400">
                    <span class="flex items-center gap-2"><i class="fas fa-map-marker-alt"></i> Jakarta, Indonesia</span>
                    <span class="flex items-center gap-2"><i class="fas fa-envelope"></i> angga.conni@horizon-scanning.org</span>
                </div>

                <p class="text-gray-300 leading-relaxed text-sm md:text-base text-justify mb-6">
                    12+ years of experience bridging high-level policy mandates and grassroots digital execution for United Nations agencies (UNESCO, UNDP) and government ministries. Proven expertise in engineering zero-cost, serverless digital public goods and AI-assisted OSINT pipelines to automate data validation and policy-ready forecasting in low-resource settings. Adept at conducting institutional readiness audits and designing phased, costed implementation roadmaps that translate complex bureaucratic bottlenecks into sustainable, child-safe, and user-centric digital architectures.
                </p>

                <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                    <a href="https://anggaconni.github.io/" target="_blank" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <i class="fas fa-globe"></i> Portfolio
                    </a>
                    <a href="https://linkedin.com/in/anggaconni/" target="_blank" class="flex items-center gap-2 bg-[#0A66C2] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <i class="fab fa-linkedin"></i> LinkedIn
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Prototype Grid -->
    <main class="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
        <div class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
            <h2 class="text-2xl font-bold text-white"><i class="fas fa-flask text-blue-400 mr-2"></i> Active Prototypes</h2>
            <span class="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-400 border border-gray-700">${prototypes.length} apps</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${cardsHtml}
        </div>
    </main>

    <footer class="text-center py-6 text-gray-600 text-sm border-t border-gray-800 mt-auto">
        &copy; ${new Date().getFullYear()} Angga Conni Saputra. Auto-generated by Serverless Pipeline.
    </footer>
</body>
</html>
`;

// Tulis file index.html
fs.writeFileSync(indexPath, landingPageHtml);
console.log('✅ Landing Page (index.html) berhasil di-generate!');

// 6. Build XML Sitemap
const today = new Date().toISOString().split('T')[0];
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

prototypes.forEach(proto => {
    sitemapXml += `
  <url>
    <loc>${proto.absoluteUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

sitemapXml += `\n</urlset>`;

// Tulis file sitemap.xml
fs.writeFileSync(sitemapPath, sitemapXml);
console.log('✅ Sitemap (sitemap.xml) berhasil di-generate!');
