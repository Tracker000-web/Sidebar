from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# MySQL Connection Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Benito1997!',
    'database': 'dashbox_crm_db'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/api/trackers', methods=['POST'])
def add_tracker():
    data = request.json
    name = data.get('tracker_name')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO trackers (name) VALUES (%s)", (name,))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return jsonify({"success": True, "id": new_id})

@app.route('/api/trackers/<int:tracker_id>', methods=['DELETE'])
def delete_tracker(tracker_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM trackers WHERE id = %s", (tracker_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)