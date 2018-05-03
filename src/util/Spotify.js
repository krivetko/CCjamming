let accessToken = '';
const redirectURI = "http://localhost:3000";
const clientID = "fc15c1a7b7ea44c48b814c1afb36fa3e";
const Spotify = {
  getAccessToken() {
    if (accessToken !== '') {
      return accessToken;
    } else if (window.location.href.match(/access_token=([^&]*)/) !== null) {
        accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
        let expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
    } else {
        window.location = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&response_type=token&scope=playlist-modify-public&redirect_uri=" + redirectURI;
    }
  },
  async search(query) {
    this.getAccessToken();
    try {
      const queryURL = "https://api.spotify.com/v1/search?type=track&q=" + query;
      let response = await fetch(queryURL, {
        headers: {Authorization: `Bearer ${accessToken}`}
      });
      if (response.ok) {
        let jsonResponse = await response.json();
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            uri: track.uri
          };
        });
      }
    } catch(error) {
      console.log(error);
    }
  },
  async savePlaylist(playlistName, uriArray) {
    this.getAccessToken();
    let userID = '';
    let playlistID = '';
    if (playlistName && uriArray.length > 0) {
      try {
        const profileURL = "https://api.spotify.com/v1/me";
        let userResponse = await fetch(profileURL, {
          headers: {Authorization: `Bearer ${accessToken}`}
        });
        if (userResponse.ok) {
          let userjsonResponse = await userResponse.json();
          userID = userjsonResponse.id;
        }
      } catch(error) {
        console.log(error);
      }
      if (userID.length > 0) {
        try {
          const playlistsURL = `https://api.spotify.com/v1/users/${userID}/playlists`;
          let plResponse = await fetch(playlistsURL, {
            method: 'POST',
            body: JSON.stringify({"name": playlistName}),
            headers: {Authorization: `Bearer ${accessToken}`}
          });
          if (plResponse.ok) {
            let pljsonResponse = await plResponse.json();
            playlistID = pljsonResponse.id;
          }
        } catch(error) {
          console.log(error);
        }
      }
    }
    if (playlistID.length > 0) {
      try {
        const addTracksURL = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`;
        let addResponse = await fetch(addTracksURL, {
          method: 'POST',
          body: JSON.stringify({"uris": uriArray}),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        if (addResponse.ok) {
          return addResponse.status;
        }
      } catch(error) {
        console.log(error);
      }
    }
  }
}

export default Spotify;
