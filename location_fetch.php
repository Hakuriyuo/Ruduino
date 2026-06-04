<?php
/* php/location_fetch.php — Return all active user locations */
header('Content-Type: application/json');

$db_host = 'localhost';
$db_name = 'navigation_system';
$db_user = 'root';
$db_pass = '';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode([]); exit;
}

$result = $conn->query("
    SELECT username, x_pct, y_pct, floor
    FROM user_locations
    WHERE updated_at >= NOW() - INTERVAL 10 MINUTE
    ORDER BY updated_at DESC
");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = [
        'username' => $row['username'],
        'x_pct'   => round((float)$row['x_pct'], 2),
        'y_pct'   => round((float)$row['y_pct'], 2),
        'floor'   => (int)$row['floor'],
    ];
}

echo json_encode($rows);
$conn->close();
?>
