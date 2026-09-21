const fs = require('fs');
const path = require('path');

// Gunakan process.cwd() agar path selalu dihitung dari ROOT repository
const rootDir = process.cwd();
const protoDir = path.join(rootDir, 'proto');
const pitchDir = path.join(rootDir, 'pitchdeck');
const indexPath = path.join(rootDir, 'index.html');
const sitemapPath = path.join(rootDir, 'sitemap.xml');

const baseUrl = 'https://anggaconni.github.io/Prototyping'; // Sesuaikan nama repo Anda

// Debugging Log untuk melihat isi folder saat Action berjalan
console.log('--- Debugging Path ---');
console.log('Root Dir:', rootDir);
if (fs.existsSync(pitchDir)) {
    console.log('Isi folder pitchdeck:', fs.readdirSync(pitchDir));
} else {
    console.log('Folder pitchdeck TIDAK ditemukan di:', pitchDir);
}

// 1. Fungsi Helper (Support HTML & PDF)
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
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) title = titleMatch[1];

                const descMatch = content.match(/<meta name="description" content="(.*?)"/i);
                if (descMatch) description = descMatch[1];
            } catch (e) {
                console.error(`Gagal membaca file ${file}:`, e);
            }
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

const prototypes = getFilesData(protoDir, 'proto', 'fa-file-code');
const pitchDecks = getFilesData(pitchDir, 'pitchdeck', 'fa-chalkboard-user');

// 2. Helper untuk Card (Perbaikan Tailwind Class)
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateCards(dataList, type = 'blue') {
    if (dataList.length === 0) {
        return `
            <div class="col-span-full text-center py-14 text-slate-400 border border-dashed border-slate-300 rounded-3xl bg-white/60">
                No resources available yet.
            </div>`;
    }

    const colors = {
        blue: {
            accent: 'text-blue-600',
            icon: 'text-slate-300 group-hover:text-blue-600',
            border: 'hover:border-blue-200',
            glow: 'hover:shadow-blue-100'
        },
        yellow: {
            accent: 'text-amber-600',
            icon: 'text-slate-300 group-hover:text-amber-500',
            border: 'hover:border-amber-200',
            glow: 'hover:shadow-amber-100'
        }
    };
    const color = colors[type] || colors.blue;

    return dataList.map(item => `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer"
           class="resource-card group bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between min-h-[205px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${color.border} ${color.glow}">
            <div>
                <div class="flex items-start justify-between gap-3 mb-5">
                    <div class="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-900">
                        <i class="fas ${item.icon} text-lg ${color.icon} transition-colors"></i>
                    </div>
                    <span class="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 group-hover:text-slate-500">Prototype</span>
                </div>
                <h3 class="text-[17px] leading-snug font-bold text-slate-800 group-hover:text-slate-950 mb-2">${escapeHtml(item.title)}</h3>
                <p class="text-sm leading-6 text-slate-500 line-clamp-2">${escapeHtml(item.description)}</p>
            </div>
            <div class="mt-6 flex items-center justify-between">
                <span class="text-xs font-semibold ${color.accent}">Open resource</span>
                <span class="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <i class="fas fa-arrow-up-right-from-square text-[10px]"></i>
                </span>
            </div>
        </a>
    `).join('');
}

// 3. Build HTML
const landingPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Angga Conni Saputra — Innovation Hub for prototypes, design experiments and digital systems.">
    <title>Angga Conni Saputra — Innovation Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
    <style>
        html { scroll-behavior: smooth; }
        body { background:
            radial-gradient(circle at 10% 10%, rgba(59,130,246,.08), transparent 28%),
            radial-gradient(circle at 90% 15%, rgba(245,158,11,.08), transparent 25%),
            #f8fafc;
        }
        .hero-grid {
            background-image:
                linear-gradient(rgba(15,23,42,.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(15,23,42,.045) 1px, transparent 1px);
            background-size: 34px 34px;
        }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .resource-card { box-shadow: 0 10px 30px rgba(15,23,42,.05); }
        .glass { background: rgba(255,255,255,.78); backdrop-filter: blur(18px); }
    </style>
</head>
<body class="text-slate-900 antialiased">
    <header class="relative overflow-hidden border-b border-slate-200 bg-white/80">
        <div class="absolute inset-0 hero-grid opacity-70"></div>
        <div class="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
            <nav class="flex items-center justify-between mb-14">
                <a href="#" class="flex items-center gap-3 font-bold tracking-tight text-slate-900">
                    <span class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                        <i class="fas fa-cubes text-sm"></i>
                    </span>
                    <span>Innovation Hub</span>
                </a>
                <a href="https://linkedin.com/in/anggaconni/" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white/90 hover:bg-slate-50 text-sm font-semibold transition">
                    <i class="fab fa-linkedin text-[#0A66C2]"></i> LinkedIn
                </a>
            </nav>

            <div class="grid lg:grid-cols-[1.3fr_.7fr] gap-10 items-end">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-6">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Experimental systems & prototypes
                    </div>
                    <h1 class="text-4xl md:text-6xl font-black tracking-tight leading-[1.02] text-slate-950">
                        ANGGA CONNI<br class="hidden md:block"> SAPUTRA
                    </h1>
                    <p class="mt-5 text-lg md:text-xl text-slate-500 max-w-2xl leading-8">
                        Strategic Innovation Specialist & Systems Architect exploring how ideas become useful digital tools.
                    </p>
                </div>

                <div class="glass rounded-3xl border border-white/80 shadow-xl p-6 md:p-7">
                    <div class="text-xs uppercase tracking-[0.18em] font-semibold text-slate-400 mb-4">At a glance</div>
                    <div class="grid grid-cols-2 gap-5">
                        <div>
                            <div class="text-3xl font-black text-slate-900">${prototypes.length}</div>
                            <div class="text-sm text-slate-500 mt-1">Active prototypes</div>
                        </div>
                        <div>
                            <div class="text-3xl font-black text-slate-900">${pitchDecks.length}</div>
                            <div class="text-sm text-slate-500 mt-1">Pitch decks</div>
                        </div>
                    </div>
                    <div class="mt-6 pt-5 border-t border-slate-200">
                        <p class="text-sm text-slate-500 leading-6">A browser-first lab for testing ideas, interfaces, workflows and decision-support concepts.</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-3 mt-10">
                <a href="#prototypes" class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 font-semibold transition">
                    Explore prototypes <i class="fas fa-arrow-down text-xs"></i>
                </a>
                <a href="#pitchdecks" class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 hover:bg-slate-50 font-semibold transition">
                    View pitch decks
                </a>
            </div>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-14 md:py-18">
        <section id="prototypes" class="scroll-mt-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                <div>
                    <div class="text-xs uppercase tracking-[0.18em] font-semibold text-blue-600 mb-2">01 · Build & test</div>
                    <h2 class="text-3xl font-black tracking-tight text-slate-950">Active Prototypes</h2>
                    <p class="text-slate-500 mt-2">Interactive experiments across policy, design, education and digital systems.</p>
                </div>
                <span class="inline-flex w-fit items-center px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-500">${prototypes.length} apps</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                ${generateCards(prototypes, 'blue')}
            </div>
        </section>

        <section id="pitchdecks" class="scroll-mt-10 mt-20">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                <div>
                    <div class="text-xs uppercase tracking-[0.18em] font-semibold text-amber-600 mb-2">02 · Communicate the idea</div>
                    <h2 class="text-3xl font-black tracking-tight text-slate-950">Donor Pitch Decks</h2>
                    <p class="text-slate-500 mt-2">Concept communication materials and presentation prototypes.</p>
                </div>
                <span class="inline-flex w-fit items-center px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-500">${pitchDecks.length} decks</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                ${generateCards(pitchDecks, 'yellow')}
            </div>
        </section>

        <section class="mt-20 rounded-[2rem] bg-slate-900 text-white p-8 md:p-10 overflow-hidden relative">
            <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div class="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl"></div>
            <div class="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                    <div class="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold mb-3">Prototype philosophy</div>
                    <h3 class="text-2xl md:text-3xl font-black">Explore quickly. Test visibly. Refine continuously.</h3>
                    <p class="mt-3 text-slate-400 max-w-2xl leading-7">These prototypes are intentionally experimental: they turn concepts into something people can click, inspect, challenge and improve.</p>
                </div>
                <a href="https://github.com/AnggaConni/Prototyping" target="_blank" rel="noopener noreferrer"
                   class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold transition">
                    <i class="fab fa-github"></i> View repository
                </a>
            </div>
        </section>
    </main>

    <footer class="max-w-6xl mx-auto px-6 py-10 text-sm text-slate-400">
        <div class="border-t border-slate-200 pt-6 flex flex-col md:flex-row gap-2 justify-between">
            <span>© ${new Date().getFullYear()} Angga Conni Saputra</span>
            <span>Innovation Hub · Browser-first experiments</span>
        </div>
    </footer>
</body>
</html>
`;

fs.writeFileSync(indexPath, landingPageHtml);
console.log('✅ index.html generated!');

// 4. Build Sitemap
const today = new Date().toISOString().split('T')[0];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  ${[...prototypes, ...pitchDecks].map(p => `<url><loc>${p.absoluteUrl}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`).join('')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapXml);
console.log('✅ sitemap.xml generated!');
