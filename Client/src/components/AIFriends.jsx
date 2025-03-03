import React, { useState } from "react";
import '../styles/AIFriends.css'
import { Link } from "react-router-dom";

// ✅ AI Models Data
const AI_MODELS = [
    {
      id: 1,
      name: "Priya Nair",
      age: 22,
      profileImage:
        "https://imgs.search.brave.com/nIAyljsTeZTdr1KyGYdxjfdeXbdJZKU5wAxx8a22SYA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9naXJsLWJsYWNr/LWNhcC13aXRoLXJl/ZC1zY2FyZi1hZ2Fp/bnN0LWJyaWNrLXdh/bGxfMTUzOTEyLTE3/MzcyLmpwZz9zZW10/PWFpc19oeWJyaWQ",
      location: "Kochi, Kerala",
      gender: "female",
      description: "AI Model Description",
    },
    {
      id: 2,
      name: "Aryan Mehta",
      age: 24,
      profileImage:
        "https://imgs.search.brave.com/M-MFqdPoCLxSHhF4-xsjHLae5ni-rKH40gL_W9K1Sg0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ2/NTEyMjk4NS9waG90/by9tYWxlLXBvcnRy/YWl0LWluLXN0dWRp/by5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9dTlWcG16TTJw/SUpnRmhqVDh0clgz/bXlpREk0Tl9VdHI1/QjZXQlo2UzRvTT0",
      location: "Mumbai, Maharashtra",
      gender: "male",
      description: "Tech Enthusiast & Traveler",
    },
    {
      id: 3,
      name: "Riya Sharma",
      age: 21,
      profileImage:
        "https://imgs.search.brave.com/PWa4wsaQxGRjtA4XT3fmuI0meMZBwnblo3EeM7gsjBY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9zdHlsaXNoLWdp/cmwtd2l0aC1yZWQt/bGlwcy13ZWFyaW5n/LWJyaWdodC1jeWFu/LWJsYXplci1yZWRf/MTk1NTQ5LTI0My5q/cGc_c2VtdD1haXNf/aHlicmlk",
      location: "Delhi",
      gender: "female",
      description: "Creative, Outgoing & Friendly",
    },
    {
      id: 4,
      name: "Rahul Verma",
      age: 26,
      profileImage:
        "https://imgs.search.brave.com/GoWf0aye1s-PQ7b4ukpde4nun64P-pl_tvSHdl1y_6g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9zdHlsaXNoLWlu/ZGlhbi1iZWFyZC1t/YW4tcGluay10c2hp/cnQtaW5kaWEtbW9k/ZWwtcG9zZWQtcmVk/LWFyY2gtcGFyay1j/aXR5XzEzNTg2Mjct/NTI0MDUuanBnP3Nl/bXQ9YWlzX2h5YnJp/ZA",
      location: "Bangalore, Karnataka",
      gender: "male",
      description: "Software Developer & AI Researcher",
    },
    {
      id: 5,
      name: "Ananya Gupta",
      age: 23,
      profileImage:
        "https://imgs.search.brave.com/UXe_2LYg9Mf5UID4H3FC3nWJnxRKMIfb6Y8uoGX_O6A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9n/aXJsLXBhcmtfMTE1/Ny03NjM2LmpwZz9z/ZW10PWFpc19oeWJy/aWQ",
      location: "Jaipur, Rajasthan",
      gender: "female",
      description: "Passionate about Fashion & AI",
    },
    {
      id: 6,
      name: "Karthik Iyer",
      age: 27,
      profileImage:
        "https://imgs.search.brave.com/b8IcZIYaYI-bonRa_d-xT0y-bpm9wvMVJC2Wgm5YrDY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ3/Mjg0NzIwMy9waG90/by9tYWxlLXBvcnRy/YWl0LWJydW5ldC1t/YW4taW4tY29hdC1p/bi1mb3Jlc3QuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPWFi/V2x1dnpjamlYX0hK/R1VkLVJFQ1JMQkZn/ZjBsZUdsTmhJSlB1/M3RQRm89",
      location: "Chennai, Tamil Nadu",
      gender: "male",
      description: "AI Engineer & Music Lover",
    },
    {
      id: 7,
      name: "Simran Kaur",
      age: 25,
      profileImage:
        "https://imgs.search.brave.com/fUHfEyHM9FC8iOo7zdzGvc3k7MM2915t_l4lw7CzNFA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM3/NTg0OS9wZXhlbHMt/cGhvdG8tMTM3NTg0/OS5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdz01MDA",
      location: "Amritsar, Punjab",
      gender: "female",
      description: "Data Scientist & Food Blogger",
    },
    {
      id: 8,
      name: "Vikram Raj",
      age: 28,
      profileImage:
        "https://imgs.search.brave.com/v1EfsI5k5F7gvZYpndC7Il_uF_wN087mkAwc5uS5nHA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9tYW4tcG9zZS13/aXRoLXRyYWRpdGlv/bmFsLWlzbGFtaWMt/Y2xvdGgtZWlkXzE0/NDQ4MS0yNDA1Lmpw/Zz9zZW10PWFpc19o/eWJyaWQ",
      location: "Hyderabad, Telangana",
      gender: "male",
      description: "Tech Geek & AI Trainer",
    },
    {
      id: 9,
      name: "Pooja Joshi",
      age: 22,
      profileImage:
        "https://imgs.search.brave.com/LXomg61V7fhByc63-lj9I6mXWpD8R6MwsTxeCAXSlf0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9h/dHRyYWN0aXZlLWdp/cmwtYnktd2luZG93/XzE0NDYyNy04MDAw/LmpwZz9zZW10PWFp/c19oeWJyaWQ",
      location: "Ahmedabad, Gujarat",
      gender: "female",
      description: "AI Influencer & Fitness Enthusiast",
    },
    {
      id: 10,
      name: "Rohan Das",
      age: 26,
      profileImage:
        "https://imgs.search.brave.com/lRfUAI5ATgSq8MxqDi6LwJj48INcqVxkWzQfmrJd9SI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxOC8w/Mi8yNS8wNi8yNi9v/dXRkb29ycy0zMTc5/ODIxXzY0MC5qcGc",
      location: "Kolkata, West Bengal",
      gender: "male",
      description: "AI Developer & Gamer",
    }
  ];

function AIFriends() {
const [activeTab, setActiveTab] = useState("girls");


  return (
    <div className="ai-friendsdd-section">
        
    {/* ✅ AI Models Display */}
    <div className="ai-frendns-section3e">
      {AI_MODELS.map((model) => (
        <Link to={`/${model.id}`} className="ai-frendns-box-edg" key={model.id}>
          <img src={model.profileImage} alt={model.name} />
          <div className="ai-frendns-box-edg-content">
            <span>{model.age}</span>
            <h3>{model.name}</h3>
            <p>{model.description}</p>
            <p>📍{model.location}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
  )
}

export default AIFriends