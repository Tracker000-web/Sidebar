<?php
// Database connection
$conn = new mysqli("localhost", "username", "password", "database_name");

// Get the data from the JavaScript fetch request
$data = json_decode(file_get_contents('php://input'), true);
$name = $data['tracker_name'];

$stmt = $conn->prepare("INSERT INTO trackers (name) VALUES (?)");
$stmt->bind_param("s", $name);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $conn->insert_id]);
} else {
    echo json_encode(["success" => false]);
}
?>