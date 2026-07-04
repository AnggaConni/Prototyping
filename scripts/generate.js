const fs = require('fs');
const path = require('path');

// 1. Konfigurasi Path
const protoDir = path.join(__dirname, '../proto');
const pitchDir = path.join(__dirname, '../pitchdeck'); // Folder baru
const indexPath = path.join(__dirname, '../index.html');
const sitemapPath = path.join(__dirname, '../sitemap.xml');

// UBAH INI: Ganti sesuai repository Anda
const baseUrl = 'https://anggaconni.github.io/NAMA_REPO_KAMU'; 

// Pastikan folder ada
[protoDir, pitchDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 2. Fungsi Helper untuk membaca file & extrak metadata
function getFilesData(directory, urlPrefix, defaultIcon) {
    if (!fs.existsSync(directory)) return [];
    
    const files = fs.readdirSync(directory).filter(file => 
        file.endsWith('.html') || file.endsWith('.pdf')
    );

    return files.map(file => {
        const filePath = path.join(directory, file);
        let title = file.replace(/\.[^/.]+$/, "").replace(/-/g, ' ');
        let description = 'Click to view this resource.';
        const isHtml = file.endsWith('.html');

        if (isHtml) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) title = titleMatch[1];

            const descMatch = content.match(/<meta name="description" content="(.*?)"/i);
            if (descMatch) description = descMatch[1];
        } else {
            description = 'Donor Presentation (PDF Document)';
        }

        return {
            filename: file,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            description: description,
            url: `${urlPrefix}/${file}`,
            absoluteUrl: `${baseUrl}/${urlPrefix}/${file}`,
            icon: isHtml ? defaultIcon : 'fa-file-pdf'
        };
    }).sort((a, b) => b.filename.localeCompare(a.filename));
}

// Ambil data dari kedua folder
const prototypes = getFilesData(protoDir, 'proto', 'fa-file-code');
const pitchDecks = getFilesData(pitchDir, 'pitchdeck', 'fa-presentation-screen');

// 3. Fungsi untuk Generate Card HTML
function generateCards(dataList, accentColor = 'blue') {
    if (dataList.length === 0) {
        return `<div class="col-span-full text-center py-10 text-gray-500 border border-dashed border-gray-700 rounded-xl">Belum tersedia.</div>`;
    }
    return dataList.map(item => `
        <a href="${item.url}" target="_blank" class="bg-gray-800 border border-gray-700 hover:border-${accentColor}-500 rounded-xl p-6 flex flex-col items-center text-center justify-center min-h-[180px] group cursor-pointer transition-all transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-${accentColor}-900/20 decoration-none">
            <i class="fas ${item.icon} text-4xl text-gray-500 group-hover:text-${accentColor}-400 mb-4 transition-colors"></i>
            <h3 class="text-lg font-bold text-gray-200 group-hover:text-white mb-2">${item.title}</h3>
            <p class="text-sm text-gray-400 line-clamp-2">${item.description}</p>
            <span class="text-xs font-semibold text-${accentColor}-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Open Resource <i class="fas fa-external-link-alt"></i>
            </span>
        </a>
    `).join('');
}

// 4. Build Landing Page HTML
const landingPageHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angga Conni Saputra - Innovation Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }</style>
</head>
<body class="bg-gray-900 text-gray-100 font-sans antialiased min-h-screen flex flex-col">

    <!-- Header -->
    <header class="bg-gray-800/50 border-b border-gray-700 py-12 px-6">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div class="flex-1 text-center md:text-left">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">ANGGA CONNI SAPUTRA</h1>
                <p class="text-xl text-blue-400 font-medium mb-4">Strategic Innovation Specialist & Systems Architect</p>
                <p class="text-gray-300 leading-relaxed text-sm md:text-base text-justify mb-6">
                    12+ years of experience bridging high-level policy mandates and grassroots digital execution...
                </p>
                <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                    <a href="https://linkedin.com/in/anggaconni/" target="_blank" class="flex items-center gap-2 bg-[#0A66C2] hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        <i class="fab fa-linkedin"></i> LinkedIn
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-grow w-full max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        <!-- SECTION 1: PITCH DECKS (UNTUK DONOR) -->
        <section>
            <div class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h2 class="text-2xl font-bold text-white"><i class="fas fa-lightbulb text-yellow-400 mr-2"></i> Donor Pitch Decks</h2>
                <span class="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-400 border border-gray-700">${pitchDecks.length} decks</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${generateCards(pitchDecks, 'yellow')}
            </div>
        </section>

        <!-- SECTION 2: PROTOTYPES -->
        <section>
            <div class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                <h2 class="text-2xl font-bold text-white"><i class="fas fa-flask text-blue-400 mr-2"></i> Active Prototypes</h2>
                <span class="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-400 border border-gray-700">${prototypes.length} apps</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${generateCards(prototypes, 'blue')}
            </div>
        </section>

    </main>

    <footer class="text-center py-6 text-gray-600 text-sm border-t border-gray-800 mt-auto">
        &copy; ${new Date().getFullYear()} Angga Conni Saputra.
    </footer>
</body>
</html>
`;

// 5. Simpan File
fs.writeFileSync(indexPath, landingPageHtml);
console.log('✅ Index.html updated!');

// 6. Generate Sitemap
const today = new Date().toISOString().split('T')[0];
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  ${[...prototypes, ...pitchDecks].map(p => `
  <url><loc>${p.absoluteUrl}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`).join('')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapXml);
console.log('✅ Sitemap.xml updated!');
