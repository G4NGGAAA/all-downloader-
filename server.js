const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const { tiktokdl, instagramdl } = require('@bochilteam/scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk melayani file statis (CSS, gambar)
app.use(express.static(path.join(__dirname, 'public')));
// Middleware untuk membaca data dari form
app.use(express.urlencoded({ extended: true }));


// --- HALAMAN UTAMA ---
app.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Downloader Serbaguna' });
});

app.get('/tiktok', (req, res) => {
    res.render('tiktok', { pageTitle: 'TikTok Downloader' });
});

app.get('/youtube', (req, res) => {
    res.render('youtube', { pageTitle: 'YouTube Downloader' });
});

app.get('/instagram', (req, res) => {
    res.render('instagram', { pageTitle: 'Instagram Downloader' });
});


// --- LOGIC DOWNLOAD ---

// YouTube Downloader
app.post('/download-youtube', async (req, res) => {
    const url = req.body.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('URL YouTube tidak valid!');
    }
    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_'); // Membersihkan judul untuk nama file
        
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { format: 'mp4', filter: 'audioandvideo', quality: 'highest' }).pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal mengunduh video. Coba lagi nanti.');
    }
});

// TikTok Downloader
app.post('/download-tiktok', async (req, res) => {
    const url = req.body.url;
    try {
        const result = await tiktokdl(url);
        // Kita ambil video yang tanpa watermark
        const videoUrl = result.video.no_watermark;
        res.redirect(videoUrl); // Langsung arahkan ke link download
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal mengunduh video TikTok. Pastikan URL benar.');
    }
});

// Instagram Downloader
app.post('/download-instagram', async (req, res) => {
    const url = req.body.url;
    try {
        const results = await instagramdl(url);
        if (results.length === 0) {
            return res.status(404).send('Konten tidak ditemukan atau URL salah.');
        }
        // Arahkan ke link download konten pertama yang ditemukan
        res.redirect(results[0].url); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal mengunduh konten Instagram. URL mungkin tidak didukung atau post bersifat privat.');
    }
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
