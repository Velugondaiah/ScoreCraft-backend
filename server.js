const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ['http://localhost:3000' , 'https://score-craft-frontend.vercel.app'],
  credentials: true,
}));
// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client with your specific credentials
const supabaseUrl = 'https://pvclfllgdfcyodjxlfsc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2Y2xmbGxnZGZjeW9kanhsZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NjkzOTUsImV4cCI6MjA1NzQ0NTM5NX0.dCUqfP36X9Za8otSLVjBmq0-PfMSPrQcd6mYT-oBXZw';
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint to fetch core members in the order they are stored
app.get('/api/core-members', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('core_members')
      .select('*')
      .order('id', { ascending: true }); // Assuming 'id' reflects the insertion order

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching core members:', error);
    res.status(500).json({ error: error.message });
  }
});

// New API endpoint to fetch team members
app.get('/api/team-members', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch mentors in the order of their IDs
app.get('/api/mentors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .order('id', { ascending: true }); // Ensure data is ordered by ID

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: error.message });
  }
});

// New API endpoint to fetch events
app.get('/api/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// New API endpoint to fetch upcoming events
app.get('/api/upcoming-events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('upcomming_events')
      .select('*');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to add a new upcoming event
app.post('/api/upcoming-events', async (req, res) => {
  const { heading, description, image, date } = req.body;

  try {
    const { error } = await supabase
      .from('upcomming_events')
      .insert([{ heading, description, image, date }]);

    if (error) throw error;

    res.json({ message: 'Upcoming event added successfully' });
  } catch (error) {
    console.error('Error adding upcoming event:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to verify admin login
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('admin_login')
      .select('*')
      .eq('username', username)
      .eq('password', password);

    if (error) throw error;

    if (data.length > 0) {
      // Generate a JWT token (this is a placeholder, replace with actual token generation)
      const token = 'your-jwt-token'; // Replace with actual JWT token generation logic
      res.json({ message: 'Hello Admin, welcome!', token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error verifying admin login:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to move completed upcoming events to events
app.post('/api/move-completed-events', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('upcomming_events')
      .select('*')
      .lte('date', today); // Select events with dates up to today

    if (error) throw error;

    if (data.length > 0) {
      const { error: insertError } = await supabase
        .from('events')
        .insert(data);

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('upcomming_events')
        .delete()
        .in('id', data.map(event => event.id));

      if (deleteError) throw deleteError;

      res.json({ message: 'Completed events moved successfully' });
    } else {
      res.json({ message: 'No completed events to move' });
    }
  } catch (error) {
    console.error('Error moving completed events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to delete an upcoming event by ID
app.delete('/api/upcoming-events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await supabase
      .from('upcomming_events')
      .delete()
      .eq('id', id);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
