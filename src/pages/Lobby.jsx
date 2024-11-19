import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

function Lobby() {
    const [email,setEmail]=useState("");
    const [room,setRoom]=useState("");

    const socket=useSocket();
    console.log(socket);
    const navigate=useNavigate();

    const handleSubmit = useCallback((e) =>{
        e.preventDefault();
        if(!email && !room) return;
        const data={
          email,room
        }
        // console.log(data);
        socket.emit("room:join",data);
    },[email,room,socket]);

  const handleJoinRoom=useCallback(({email,room})=>{
          console.log(email,room);
          navigate(`/room/${room}`);
  },[]);
    
  useEffect(()=>{
    socket.on("room:join",handleJoinRoom);
    return ()=>{
      socket.off("room:join",handleJoinRoom);
    }
  },[socket,handleJoinRoom]);

  return (
    <div className="min-w-screen h-screen flex flex-col items-center">
        <h1 className="text-3xl p-16 font-bold">Welcome To Lobby</h1>
        
        <form className="flex flex-col bg-gray-700 p-12 py-6 w-full  lg:w-[500px]" onSubmit={handleSubmit}>
        <label htmlFor="email" className="p-2 text-xl">Email ID</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded p-2 text-black" name="email" id="email"  required/>
        <label htmlFor="room" className="p-2 text-xl">Room Number</label>
        <input type="number" value={room} onChange={(e)=>setRoom(e.target.value)} min={1}  className="rounded p-2 text-black" name="room" id="room"  required/>
        <button type="submit" className="mt-12 p-2 text-xl bg-black rounded">Join</button>

        </form>
    </div>
  )
}

export default Lobby