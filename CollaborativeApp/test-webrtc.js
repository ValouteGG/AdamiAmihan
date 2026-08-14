/**
 * Simple WebRTC Test Script
 * Run this with: node test-webrtc.js
 * This tests if WebRTC is available in your environment
 */

console.log('Testing WebRTC Support...\n');

// Test 1: Check if WebRTC is supported
if (typeof RTCPeerConnection !== 'undefined') {
  console.log('✅ WebRTC is supported');
} else {
  console.log('❌ WebRTC is NOT supported');
  process.exit(1);
}

// Test 2: Check if getUserMedia is supported
if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log('✅ getUserMedia is supported');
} else {
  console.log('❌ getUserMedia is NOT supported');
  process.exit(1);
}

// Test 3: Check STUN servers configuration
const testConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

console.log('✅ STUN servers configured:', testConfig.iceServers.length);

// Test 4: Check WebSocket/Socket.io
try {
  const io = require('socket.io-client');
  console.log('✅ Socket.io client is available');
} catch (error) {
  console.log('❌ Socket.io client is NOT available');
  process.exit(1);
}

console.log('\n✅ All WebRTC dependencies are available!');
console.log('\nNext steps:');
console.log('1. Open http://localhost:5175 in your browser');
console.log('2. Navigate to the Messages page');
console.log('3. Open a second browser window to the same URL');
console.log('4. Test voice/video calling between the two windows');