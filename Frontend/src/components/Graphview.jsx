import React, { useRef, useState } from "react";
import Graph from "react-graph-vis";
import axios from "axios";
// import "./graph.css";
import "./test.css";
export default function Graphview() {
  const [fileContent, setFileContent] = useState("");
  const [isTopoLoaded, setIsTopoLoaded] = useState(false);
  const fileButton = useRef(null);
  const baseUrl = "http://localhost:8085/";
  const handleFileChange = (event) => {
    // console.log("file chnaged");
    const uploadedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("file", uploadedFile);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${baseUrl}uploadfile/`,
      headers: {
        accept: "application/json",
        "Content-Type": "multipart/form-data", // to send file use this format in conetent type
      },
      data: formData,
    };

    axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        setFileContent(response.data);
        setIsTopoLoaded(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const graph = {
    nodes: fileContent?.nodes,
    edges: fileContent?.links,
  };
  // console.log(graph);

  var options = {
    physics: {
      // enabled: true,
      enabled: false,
    },
    interaction: {
      navigationButtons: false,
    },
    nodes: {
      shadow: {
        enabled: true,
        size: 20,
        x: 0,
        color: "rgba(0,0,0,0.6)",
      },
      size: 40,
      shape: "box",
      borderWidth: 2,
      heightConstraint: {
        minimum: 30,
      },
      widthConstraint: {
        minimum: 70,
      },
      font: {
        color: "black",
        size: 20,
        strokeWidth: 1,
        strokeColor: "black",
        bold: {
          size: 40,
          mod: "bold",
        },
      },
    },
    edges: {
      color: "rgb(52, 152, 219)",
      width: 3,
      length: 300,
    },
    shadow: true,
    smooth: true,
    height: "100%",
  };

  return (
    <>
      <div style={{ display: "flex", marginTop: "26px" }}>
        <div
          style={{
            flex: "0 0 30%",
            marginLeft: "2rem",
            marginTop: "1rem",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <h3>Node Info</h3>
            <ul style={{ listStyle: "none" }}>
              <li>
                <span style={{ color: "#F5B7B1" }}>
                  <b>SS</b>
                </span>{" "}
                - Super Spine
              </li>
              <li>
                <span style={{ color: "#3498DB" }}>
                  <b>S</b>
                </span>{" "}
                - Spine
              </li>
              <li>
                <span style={{ color: "#1ABC9C" }}>
                  <b>L</b>
                </span>{" "}
                - Leaf
              </li>
              <li>
                <span style={{ color: "#D35400" }}>
                  <b>T</b>
                </span>{" "}
                - ToR
              </li>
              <li>
                <span style={{ color: "#F5B041" }}>
                  <b>H</b>
                </span>{" "}
                - Host
              </li>
              <li>
                <span style={{ color: "#7D3C98" }}>Purple</span> -{" "}
                <b>MCLAG Enabled</b>
              </li>
            </ul>

            <h3>Edge Info</h3>
            <ul style={{ listStyle: "none" }}>
              <li>
                <span style={{ color: "#7D3C98" }}>
                  <b>- - - -</b>
                </span>{" "}
                MCLAG Links
              </li>
              <li>
                <span style={{ color: "#3498DB" }}>
                  <b>------</b>
                </span>{" "}
                Normal Links
              </li>
            </ul>

            <h3>Fabric level configuration</h3>
            <div>
              <input
                ref={fileButton}
                type="file"
                onChange={(e) => {
                  handleFileChange(e);
                }}
                disabled={isTopoLoaded}
              />
            </div>
            <button
              onClick={() => {
                fileButton.current.value = null;
                setFileContent("");
                setIsTopoLoaded(false);
              }}
            >
              Try Another Yaml
            </button>
            <p></p>
          </div>
        </div>
        <div style={{ flex: "0 0 65%" }}>
          {isTopoLoaded && (
            <div
              className="container"
              style={{
                height: "90vh",
                border: "2px solid #1434A4",
                borderRadius: "20px",
              }}
            >
              <Graph graph={graph} options={options} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
