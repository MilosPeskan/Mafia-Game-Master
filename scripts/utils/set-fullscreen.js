function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // If the document is not in fullscreen mode, request it for the entire HTML element
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
      document.documentElement.msRequestFullscreen();
    }
  } else {
    // Otherwise, exit fullscreen mode
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
}

export function lockToLandscape() {
  // Request fullscreen mode first
  toggleFullscreen()
  
  // Then attempt to lock the orientation
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape')
      .then(() => {
        console.log("Orientation locked to landscape");
      })
      .catch((error) => {
        console.error("Orientation lock failed: ", error);
        // Note: Locking may fail if not in fullscreen or not supported
      });
  } else {
    console.log("Screen Orientation API not supported or available");
  }
}

// Call this function from a user interaction event, e.g., a button click
// <button onclick="lockToLandscape()">Enter Fullscreen and Lock Landscape</button>
