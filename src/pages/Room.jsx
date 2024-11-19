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
  const [showCall,setShowCall]=useState(true);
``
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
    
    const offer=await myPeer.getOffer();
    socket.emit("user:call",{to:remoteSocketId,offer});
    setMyStream(stream);
    setShowCall(false);

  }, [remoteSocketId,socket]);

  const handleIncomingCall=useCallback(async ({from,email,offer})=>{
    console.log(from,email,offer);
    setRemoteSocketId(from);
    setRemoteEmail(email);
    const ans=await

  },[socket]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call",handleIncomingCall)

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call",handleIncomingCall)
    };
  }, [socket, handleUserJoined,handleIncomingCall]);

  return (
    <div className="text-3xl text-center">
      <div>Room {roomId}</div>
      <h4 className="p-4">
        {remoteSocketId
          ? `Connected to ${remoteEmail}`
          : "No One In the Room"}
      </h4>
      {remoteSocketId && showCall && (
        <button className="bg-gray-500 p-5" onClick={handleCallUser}>
          CALL
        </button>
      )}
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

{myStream && (
        <>
        <div className="flex flex-col p-2">
          <h2>Remote Video</h2>
          <ReactPlayer
            url={myStream}
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
