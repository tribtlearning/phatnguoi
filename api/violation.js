export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plate, type } = req.body;

    if (!plate || !type) {
      return res.status(400).json({ error: 'Thiếu thông tin biển số hoặc loại xe' });
    }

    const response = await fetch('https://phatnguoixe.com/api/violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate, type })
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Không thể kết nối đến API phatnguoixe.com' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server', detail: error.message });
  }
}
