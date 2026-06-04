<?php
/* php/location_update.php — Save or clear a user's live location */
header('Content-Type: application/json');

$db_host = 'localhost';
$db_name = 'navigation_system';
$db_user = 'root';
$db_pass = '';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']); exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['username'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing username']); exit;
}

$username = $conn->real_escape_string(trim($body['username']));

/* Clear */
if (!empty($body['clear'])) {
    $conn->query("DELETE FROM user_locations WHERE username = '$username'");
    echo json_encode(['status' => 'cleared']); exit;
}

$x_pct = isset($body['x_pct']) ? floatval($body['x_pct']) : null;
$y_pct = isset($body['y_pct']) ? floatval($body['y_pct']) : null;
$floor = isset($body['floor']) ? intval($body['floor'])   : null;

if ($x_pct === null || $y_pct === null || $floor === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing coordinates']); exit;
}

$x_pct = max(0, min(100, $x_pct));
$y_pct = max(0, min(100, $y_pct));
if (!in_array($floor, [2,3,4,5,6])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid floor']); exit;
}

$sql = "INSERT INTO user_locations (username, x_pct, y_pct, floor, updated_at)
        VALUES ('$username', $x_pct, $y_pct, $floor, NOW())
        ON DUPLICATE KEY UPDATE
            x_pct = VALUES(x_pct),
            y_pct = VALUES(y_pct),
            floor = VALUES(floor),
            updated_at = NOW()";

$conn->query($sql);
echo json_encode(['status' => 'saved']);
$conn->close();
?>
