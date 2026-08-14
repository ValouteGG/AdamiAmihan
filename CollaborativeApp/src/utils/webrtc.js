import { io } from 'socket.io-client';

class WebRTCClient {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.currentUserId = null;
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
    
    // Callbacks
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onIncomingCall = null;
    this.onCallEnded = null;
    this.onCallRejected = null;
    this.onCallError = null;
  }

  initialize(userId) {
    this.currentUserId = userId;
    
    // Connect to signaling server
    this.socket = io('http://localhost:4002', {
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Incoming call
    this.socket.on('call-offer', async (data) => {
      const { callerId, callerSocketId, offer, callType } = data;
      console.log('Incoming call from', callerId, 'type:', callType);
      
      if (this.onIncomingCall) {
        this.onIncomingCall({ callerId, callerSocketId, offer, callType });
      }
    });

    // Call answer
    this.socket.on('call-answer', async (data) => {
      const { answer } = data;
      console.log('Call answer received');
      await this.handleCallAnswer(answer);
    });

    // ICE candidates
    this.socket.on('ice-candidate', async (data) => {
      const { candidate } = data;
      await this.handleIceCandidate(candidate);
    });

    // Call ended
    this.socket.on('call-ended', () => {
      console.log('Call ended by remote party');
      this.endCall();
    });

    // Call rejected
    this.socket.on('call-rejected', () => {
      console.log('Call rejected by remote party');
      if (this.onCallRejected) {
        this.onCallRejected();
      }
      this.cleanup();
    });

    // Call error
    this.socket.on('call-error', (data) => {
      console.error('Call error:', data.message);
      if (this.onCallError) {
        this.onCallError(data.message);
      }
    });
  }

  async startCall(targetUserId, callType = 'audio') {
    try {
      console.log(`Starting ${callType} call to ${targetUserId}`);
      
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local stream tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          this.socket.emit('ice-candidate', {
            targetUserId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === 'failed') {
          console.error('Connection failed');
          if (this.onCallError) {
            this.onCallError('Connection failed');
          }
        }
      };

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.socket.emit('call-offer', {
        targetUserId,
        callerId: this.currentUserId,
        offer,
        callType
      });

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      console.log('Call offer sent');

    } catch (error) {
      console.error('Error starting call:', error);
      this.cleanup();
      throw error;
    }
  }

  async handleIncomingCall(callerId, callerSocketId, offer, callType) {
    try {
      console.log(`Handling incoming ${callType} call from ${callerId}`);
      
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local stream tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          this.socket.emit('ice-candidate', {
            targetUserId: callerId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === 'failed') {
          console.error('Connection failed');
          if (this.onCallError) {
            this.onCallError('Connection failed');
          }
        }
      };

      // Set remote description (offer)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Create and send answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('call-answer', {
        callerId: callerSocketId,
        answer
      });

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      console.log('Call answer sent');

    } catch (error) {
      console.error('Error handling incoming call:', error);
      this.cleanup();
      throw error;
    }
  }

  async handleCallAnswer(answer) {
    try {
      console.log('Setting remote description (answer)');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling call answer:', error);
    }
  }

  async handleIceCandidate(candidate) {
    try {
      console.log('Adding ICE candidate');
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  answerCall(callerId, callerSocketId, offer, callType) {
    this.handleIncomingCall(callerId, callerSocketId, offer, callType);
  }

  rejectCall(callerSocketId) {
    console.log('Rejecting call from', callerSocketId);
    this.socket.emit('reject-call', { callerId: callerSocketId });
  }

  endCall(targetUserId = null) {
    console.log('Ending call');
    
    if (targetUserId) {
      this.socket.emit('end-call', { targetUserId });
    }
    
    this.cleanup();
    
    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('Audio', enabled ? 'enabled' : 'disabled');
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      console.log('Video', enabled ? 'enabled' : 'disabled');
    }
  }

  getConnectionState() {
    return this.peerConnection ? this.peerConnection.connectionState : 'disconnected';
  }

  isInCall() {
    return this.peerConnection !== null && this.peerConnection.connectionState === 'connected';
  }
}

// Export singleton instance
const webrtcClient = new WebRTCClient();
export default webrtcClient;