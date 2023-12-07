//customers
app.get('/api/customers', (req, res) => {
  const sql = 'SELECT c_id AS id, name, email, address FROM tblcustomer';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching customer data:', err);
      res.status(500).json({ error: 'Error fetching customer data' });
      return;
    }
    res.json(result);
  });
});
// DELETE route to delete a customer by ID
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tblcustomer WHERE c_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting customer:', err);
      res.status(500).json({ error: 'Error deleting customer' });
      return;
    }
    res.json({ message: `Customer with ID ${id} deleted successfully` });
  });
});

//manage stocks
//seller stocks details
app.get('/api/stocks', (req, res) => {
  const sql = 'SELECT stock_id AS stock_id, seller_id, regular, budget, buddy FROM tblsellerstock';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching seller data:', err);
      res.status(500).json({ error: 'Error fetching seller data' });
      return;
    }
    res.json(result);
  });
});


app.listen(5000, () => {
    console.log("Server started on port 5000")
})
