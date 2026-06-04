<?php
/* php/login_handler.php — Ruduino Auth Handler */
session_start();

$db_host = 'localhost';
$db_name = 'navigation_system';
$db_user = 'root';
$db_pass = '';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(header("Location: ../login.html?error=" . urlencode("Database connection failed.")));
}

$mode = $_POST['mode'] ?? 'login';

if ($mode === 'register') {
    $email    = trim($_POST['email']    ?? '');
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password']      ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';

    if (!$email || !$username || !$password) {
        header("Location: ../login.html?error=" . urlencode("All fields are required.")); exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../login.html?mode=register&error=" . urlencode("Invalid email address.")); exit;
    }
    if ($password !== $confirm) {
        header("Location: ../login.html?mode=register&error=" . urlencode("Passwords do not match.")); exit;
    }
    if (strlen($password) < 8) {
        header("Location: ../login.html?mode=register&error=" . urlencode("Password must be at least 8 characters.")); exit;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username); $stmt->execute(); $stmt->store_result();
    if ($stmt->num_rows > 0) {
        header("Location: ../login.html?mode=register&error=" . urlencode("Username already taken.")); exit;
    }
    $stmt->close();

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email); $stmt->execute(); $stmt->store_result();
    if ($stmt->num_rows > 0) {
        header("Location: ../login.html?mode=register&error=" . urlencode("Email already registered.")); exit;
    }
    $stmt->close();

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("INSERT INTO users (email, username, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $username, $hashed);

    if ($stmt->execute()) {
        header("Location: ../login.html?success=" . urlencode("Account created! You can now sign in."));
    } else {
        header("Location: ../login.html?mode=register&error=" . urlencode("Registration failed. Please try again."));
    }
    $stmt->close();

} elseif ($mode === 'login') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password']      ?? '';

    if (!$username || !$password) {
        header("Location: ../login.html?error=" . urlencode("Please fill in all fields.")); exit;
    }

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username); $stmt->execute(); $stmt->store_result();

    if ($stmt->num_rows === 0) {
        header("Location: ../login.html?error=" . urlencode("Invalid username or password.")); exit;
    }

    $stmt->bind_result($id, $hashed);
    $stmt->fetch();

    if (password_verify($password, $hashed)) {
        $_SESSION['user_id']  = $id;
        $_SESSION['username'] = $username;
        /* Redirect to map after login */
        header("Location: ../map.html");
    } else {
        header("Location: ../login.html?error=" . urlencode("Invalid username or password."));
    }
    $stmt->close();
}

$conn->close();
?>
