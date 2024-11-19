import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import myPeer from "../services/peer";


function Room() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteEmail, setRemoteEmail] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;
    setRemoteSocketId(id);
    setRemoteEmail(email);
    console.log("Joined Room", data);
  }, []);

  const handleCallUser = useCallback(async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await myPeer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);

  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(async ({ from, email, offer }) => {
    console.log(from, email, offer);
    setRemoteSocketId(from);
    setRemoteEmail(email);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await myPeer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });

  }, [socket]);

  const sendStreams=useCallback(()=>{
    for (const track of myStream.getTracks()) {
      myPeer.peer.addTrack(track, myStream);
    }
  },[myStream]);

  const handleCallAccepted = useCallback(async ({ from, email, ans }) => {
    await myPeer.setLocalDescription(ans);
    console.log("Call Accepted");
    sendStreams();
  }, [sendStreams]);

  const handleNegoNeeded=useCallback(async () => {
    const offer= await myPeer.getOffer();
    socket.emit("peer:nego:needed",{offer,to:remoteSocketId});
  },[remoteSocketId,socket]);

  const handleNegoNeedIncoming=useCallback(async ({from,offer})=>{
     const ans=await myPeer.getAnswer(offer);
     socket.emit("peer:nego:done",{to:from,ans});
  },[socket]);

  const handleNegoNeedFinal=useCallback(async ({from,ans})=>{
     await myPeer.setLocalDescription(ans);
  },[]);

  useEffect(()=>{
    myPeer.peer.addEventListener("negotiationneeded",handleNegoNeeded);
    return ()=>{
      myPeer.peer.removeEventListener("negotiationneeded",handleNegoNeeded);
    }
  },[handleNegoNeeded]);

  useEffect(() => {
    myPeer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT Tracks");
      setRemoteStream(remoteStream[0]);
    });
  }, []);


  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed",handleNegoNeedIncoming);
    socket.on("peer:nego:final",handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed",handleNegoNeedIncoming);
      socket.off("peer:nego:final",handleNegoNeedFinal);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted,handleNegoNeedIncoming,handleNegoNeedFinal]);

  useEffect(() => {
    if (remoteSocketId) {
      handleCallUser();
    }
  }, [remoteSocketId, handleCallUser]);

  return (
    <div className="text-3xl text-center">
      <div>Room {roomId}</div>
      <h4 className="p-4">
        {remoteSocketId
          ? `Connected to ${remoteEmail}`
          : "No One In the Room"}
      </h4>

      <div className="grid grid-cols-2">
        {myStream && (
          <>
            <div className="flex flex-col p-2">
              <h2>Your Video</h2>
              <ReactPlayer
                url={myStream}
                playing
                width="100%"
                height="300px"
              />
            </div>
          </>
        )}

        {remoteStream && (
          <>
            <div className="flex flex-col p-2">
              <h2>Guest Video</h2>
              <ReactPlayer
                url={remoteStream}
                playing
                width="100%"
                height="300px"
              />
            </div>
          </>
        )}


      </div>
    </div>
  );
}

export default Room;
