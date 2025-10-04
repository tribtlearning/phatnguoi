// api/violation.js
export default async function handler(req, res) {
  const { plate, type } = req.body;

  const response = await fetch('https://phatnguoixe.com/api/violation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plate, type })
  });

  const data = await response.json();
  res.status(200).json(data);
}
