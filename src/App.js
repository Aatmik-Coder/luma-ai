import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // Define state variables for handling user input, loading state, and result
  const [videoFile, setVideoFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [getTitle, setGetTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultURL, setResultURL] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadUrl) {
      conversion();
    }
  }, [uploadUrl]);

  const handleFileChange = (e) => {
    if (e.target.files[0].type === 'video/mp4') {
      const reader = new FileReader();

      reader.onload = () => {
        const binaryData = reader.result;
        const bytes = new Uint8Array(binaryData);
        uploadVideo(bytes);
      };

      reader.onerror = (error) => {
        // Handle error
        console.error("Failed to read file:", error);
      };

      reader.readAsArrayBuffer(e.target.files[0]);
      console.log("this is reader");
      console.log(reader);
      setError(null);
    } else {
      setError('Please upload video only');
    }
  };

  const uploadVideo = (bytes) => {
    setVideoFile(bytes);
  }

  const handleTitle = (e) => {
    setGetTitle(e.target.value);
  }

  const saveData = (url, slu) => {
    setUploadUrl(url);
    setSlug(slu);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResultURL(null);
    if (!videoFile) {
      setError("Please select a video file to upload.");
      return;
    }
    if (getTitle) {
      try {
        const params = new URLSearchParams();
        params.append('title', getTitle);

        const url = 'https://webapp.engineeringlumalabs.com/api/v2/capture';
        const encodedData = params.toString();
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'luma-api-key=2ef4e741-69d3-4b0c-a558-4f28b594ee5a-99e86e3-2339-48eb-b8b9-c929b3c7e1bd'
          }
        }
        await axios.post(url, encodedData, config).then((response) => {
          saveData(response.data.signedUrls.source, response.data.capture.slug);
          // conversion();
        });
      } catch (err) {
        setError(err);
      }
    } else {
      setError("Title is compulsory! Please add it");
    }
  };

  const getURLS = async () =>{
    try{
      setIsLoading(true);
      await axios.get(`https://webapp.engineeringlumalabs.com/api/v2/capture/${slug}`, {
        headers: {
          'Authorization': 'luma-api-key=2ef4e741-69d3-4b0c-a558-4f28b594ee5a-99e86e3-2339-48eb-b8b9-c929b3c7e1bd'
        }
      }).then((response) => {
        console.log("URLs responses");
        console.log(response);
        if(response.data.latestRun.progress != 100){
          setTimeout(() => {
            getURLS();
          }, 300000);
        }else{
          setIsLoading(false);
          const getGLB = response.data.latestRun.artifacts.find(item => item['type'] === 'textured_mesh_glb');
          const getVideo = response.data.latestRun.artifacts.find(item => item['type'] === 'video_with_background');
          window.open(getGLB.url);
          window.open(getVideo.url);
          console.log('model downloaded');
        }
      });
    }catch(err){
      setError(err);
    }
  }

  const triggers = async () => {
    await axios.post(`https://webapp.engineeringlumalabs.com/api/v2/capture/${slug}`, null, {
      headers: {
        'Authorization': 'luma-api-key=2ef4e741-69d3-4b0c-a558-4f28b594ee5a-99e86e3-2339-48eb-b8b9-c929b3c7e1bd',
        // 'Content-Length':'0',
        // 'Content-Type':'none'
      }
    }).then((responsess) => {
      console.log("triggers responses");
      console.log(responsess);
      if(responsess.status == 200) {
        getURLS();
      }
    });
  }

  const conversion = async () => {
    console.log(uploadUrl);
    console.log(slug);
    setIsLoading(true);
    console.log("video can now be uploaded");
    console.log(videoFile);
    try {
      await axios.put(uploadUrl, videoFile, {
        headers: {
          "Content-Type": "video/mp4",
        },
      }).then((response) => {
        setIsLoading(true);
        if (response.status === 200) {
          triggers();
          console.log("uploaded successfully");
        }
      });
    } catch (err) {
      console.log(err);
      setError("An error occurred while processing your request. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    ".App": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      padding: "1rem",
      textAlign: "center",
      backgroundImage: `url(${process.env.PUBLIC_URL}/images/backimage.jpg)`,
      backgroundSize:'cover',
    },
      
    "h1": {
      fontSize: "2rem",
      marginBottom: "1rem",
      color:'white'
    },
      
    "form": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
      
    "input": {
      margin: "1rem",
      padding: "1rem",
      border: "3px solid white",
      borderRadius: "5px",
      backgroundColor:'transparent',
      color:'white',
      width:'20vw',
    },

    "button": {
      padding: "0.5rem 1rem",
      border: "3px solid white",
      borderRadius: "3px",
      backgroundColor: "#007bff",
      color: "#fff",
      cursor: "pointer",
      borderRadius:'5px',
      backgroundColor:'transparent',
    },

    "p": {
      marginBottom: "1rem",
    },

    ".error":{
      margin: "1rem",
      padding: "1rem",
      border:'1px solid red',
      borderRadius: "5px",
      backgroundColor:'transparent',
      color:'white',
      width:'20vw',
    },

    ".error-text":{
      color:"red",
      fontSize:"25px"
    },
      
    "a": {
      color: "#007bff",
    },
  };
  

return (
  <>
    <div className="App" style={styles[".App"]}>
      <h1 style={styles['h1']}>Video to 3D Model Converter</h1>
      <form onSubmit={handleSubmit} style={styles['form']}>
        <input type="string" placeholder="Enter title" onChange={handleTitle} style={styles['input']}
        // style={error ? styles['.error']:styles['input']} 
        />
        <input type="file" onChange={handleFileChange} style={styles['input']}
        // style={error ? styles['.error']:styles['input']} 
        />
        <button type="submit" disabled={isLoading} style={styles['button']}>
          Convert Video
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error-text" style={styles['.error-text']}>{error}</p>}
      {resultURL && (
        <div>
          <p>Here's your 3D model:</p>
          <a href={resultURL} target="_blank" rel="noreferrer" style={styles['a']}>
            View 3D Model
          </a>
        </div>
      )}
    </div>
  </>
  );
}

export default App;
