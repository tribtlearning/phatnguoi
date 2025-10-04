// pages/api/violation.js

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plate, type } = req.body || {};
    if (!plate || typeof type === 'undefined') {
      return res.status(400).json({ error: 'Thiếu thông tin biển số hoặc loại xe' });
    }

    // Chuẩn hoá: bỏ khoảng trắng/dấu gạch, uppercase
    const normalizedPlate = String(plate).toUpperCase().replace(/[\s-]/g, '');
    const typeNum = Number(type);
    if (![1, 2, 3].includes(typeNum)) {
      return res.status(400).json({ error: 'Loại phương tiện không hợp lệ' });
    }

    // Timeout 15s cho fetch
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch('https://phatnguoixe.com/api/violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Thêm UA/Referer để tránh upstream chặn bot
          'User-Agent': 'phatnguoi-proxy/1.0 (+https://phatnguoi-topaz.vercel.app)',
          'Referer': 'https://phatnguoi-topaz.vercel.app',
        },
        body: JSON.stringify({ plate: normalizedPlate, type: typeNum }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error('[api/violation] fetch error:', err);
      clearTimeout(timer);
      return res.status(500).json({ error: 'Lỗi server khi gọi upstream', detail: err.message });
    }
    clearTimeout(timer);

    // Đọc text trước, rồi parse JSON tránh crash nếu upstream trả HTML
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = null; }

    if (!response.ok) {
      console.error('[api/violation] upstream !ok', response.status, text.slice(0, 200));
      return res.status(502).json({
        error: 'Không thể kết nối đến API phatnguoixe.com',
        upstreamStatus: response.status,
        upstreamBody: payload ?? text,
      });
    }

    return res.status(200).json(payload ?? text);
  } catch (error) {
    console.error('[api/violation] unhandled error:', error);
    return res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
}
