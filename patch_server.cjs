const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const supabaseCode = `
import { createClient } from '@supabase/supabase-js';

// Lazy-initialize Supabase
let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// Auth API to hide passwords
app.post('/api/auth/login', (req, res) => {
  const { role, password } = req.body;
  if (role === 'ceo' && password === 'Rexlify@RRR 12352') {
    return res.json({ success: true, token: 'ceo-token-valid' });
  } else if (role === 'teacher' && password === 'RTECH@12352') {
    return res.json({ success: true, token: 'teacher-token-valid' });
  }
  return res.status(401).json({ success: false, error: 'Invalid Credentials' });
});

// Institute Applications API
app.post('/api/institute/applications', async (req, res) => {
  try {
    const data = req.body;
    const supabase = getSupabase();
    // Insert into 'student_applications' table
    const { data: result, error } = await supabase.from('student_applications').insert([data]).select();
    if (error) throw error;
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Supabase insert error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/institute/applications', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('student_applications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const data = req.body;
    const supabase = getSupabase();
    const { data: result, error } = await supabase.from('feedback').insert([data]).select();
    if (error) throw error;
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
`;

code = code.replace("app.use(express.json());", "app.use(express.json());\n" + supabaseCode);

fs.writeFileSync('server.ts', code);
